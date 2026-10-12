const db = require('../config/db');

class SearchIndexService {
  /**
   * Search calculations using PostgreSQL Full-Text Search or In-Memory inverted index
   */
  async searchCalculations(query, filters = {}) {
    const startTime = Date.now();
    const cleanQuery = (query || '').trim().toLowerCase();
    const { loanType, minPrincipal, maxPrincipal, limit = 50 } = filters;

    const dbStatus = db.getStatus();

    if (dbStatus.connected) {
      try {
        let sql = `
          SELECT *,
            ts_rank_cd(
              to_tsvector('english', coalesce(title, '') || ' ' || coalesce(loan_type, '') || ' ' || coalesce(notes, '')),
              websearch_to_tsquery('english', $1)
            ) AS rank
          FROM calculations
          WHERE 1=1
        `;
        const params = [cleanQuery || 'loan'];
        let paramIdx = 2;

        if (cleanQuery) {
          sql += ` AND (
            to_tsvector('english', coalesce(title, '') || ' ' || coalesce(loan_type, '') || ' ' || coalesce(notes, '')) @@ websearch_to_tsquery('english', $1)
            OR title ILIKE '%' || $1 || '%'
            OR notes ILIKE '%' || $1 || '%'
          )`;
        }

        if (loanType && loanType !== 'all') {
          sql += ` AND loan_type = $${paramIdx++}`;
          params.push(loanType);
        }

        if (minPrincipal) {
          sql += ` AND principal >= $${paramIdx++}`;
          params.push(Number(minPrincipal));
        }

        if (maxPrincipal) {
          sql += ` AND principal <= $${paramIdx++}`;
          params.push(Number(maxPrincipal));
        }

        sql += ` ORDER BY rank DESC, created_at DESC LIMIT $${paramIdx++};`;
        params.push(parseInt(limit, 10));

        const result = await db.queryRead(sql, params);
        return {
          results: result.rows,
          engine: 'postgresql-fulltext-gin',
          count: result.rows.length,
          queryTimeMs: Date.now() - startTime,
        };
      } catch (err) {
        console.warn('[SearchIndex] PostgreSQL search error, fallback to in-memory index:', err.message);
      }
    }

    // In-Memory search engine
    const allCalculations = db.memoryStore || [];
    const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

    const scored = allCalculations.map((item) => {
      let score = 0;
      const titleLower = (item.title || '').toLowerCase();
      const notesLower = (item.notes || '').toLowerCase();
      const typeLower = (item.loan_type || '').toLowerCase();

      if (queryTokens.length === 0) {
        score = 1;
      } else {
        for (const token of queryTokens) {
          if (titleLower.includes(token)) score += 10;
          if (typeLower.includes(token)) score += 5;
          if (notesLower.includes(token)) score += 3;
        }
      }

      // Filter matches
      if (loanType && loanType !== 'all' && typeLower !== loanType.toLowerCase()) {
        score = 0;
      }
      if (minPrincipal && Number(item.principal) < Number(minPrincipal)) {
        score = 0;
      }
      if (maxPrincipal && Number(item.principal) > Number(maxPrincipal)) {
        score = 0;
      }

      return { item, score };
    });

    const filtered = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.item);

    return {
      results: filtered,
      engine: 'in-memory-token-indexer',
      count: filtered.length,
      queryTimeMs: Date.now() - startTime,
    };
  }
}

module.exports = new SearchIndexService();
