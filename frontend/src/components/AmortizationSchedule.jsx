import React, { useState } from 'react';
import {
  Table,
  Download,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { CURRENCIES, formatCurrency } from '../utils/formatters';

export default function AmortizationSchedule({
  yearlySchedule,
  monthlySchedule,
  currency,
  principal,
}) {
  const [viewType, setViewType] = useState('yearly'); // 'yearly' | 'monthly'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 24; // 2 years per page for monthly view

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;
  const sym = currentCurrency.symbol;

  // Export CSV
  const handleExportCSV = () => {
    const data = viewType === 'yearly' ? yearlySchedule : monthlySchedule;
    if (!data || data.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    if (viewType === 'yearly') {
      csvContent += 'Year,Opening Balance,Total Payment,Principal Paid,Interest Paid,Closing Balance\n';
      data.forEach((row) => {
        csvContent += `${row.year},${row.openingBalance},${row.totalEMI},${row.totalPrincipal},${row.totalInterest},${row.closingBalance}\n`;
      });
    } else {
      csvContent += 'Month,Date,Opening Balance,Monthly Payment,Principal Paid,Interest Paid,Closing Balance\n';
      data.forEach((row) => {
        csvContent += `${row.month},${row.date},${row.openingBalance},${row.emi},${row.principal},${row.interest},${row.closingBalance}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amortization_schedule_${viewType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered dataset
  const currentDataset = viewType === 'yearly' ? yearlySchedule : monthlySchedule;
  const filteredData = (currentDataset || []).filter((item) => {
    if (!search) return true;
    if (viewType === 'yearly') {
      return String(item.year).includes(search);
    }
    return (
      String(item.month).includes(search) ||
      (item.date && item.date.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // Pagination for monthly view
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData =
    viewType === 'yearly'
      ? filteredData
      : filteredData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Table size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Amortization Schedule</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Yearly / Monthly Toggle */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-input)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            padding: '3px',
          }}>
            <button
              onClick={() => {
                setViewType('yearly');
                setPage(1);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                background: viewType === 'yearly' ? 'var(--primary)' : 'transparent',
                color: viewType === 'yearly' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <Layers size={14} />
              <span>Yearly</span>
            </button>
            <button
              onClick={() => {
                setViewType('monthly');
                setPage(1);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                background: viewType === 'monthly' ? 'var(--primary)' : 'transparent',
                color: viewType === 'monthly' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <Calendar size={14} />
              <span>Monthly</span>
            </button>
          </div>

          {/* Search box for monthly view */}
          {viewType === 'monthly' && (
            <div style={{ position: 'relative' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search Month / Year..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="input-box"
                style={{ paddingLeft: '30px', fontSize: '0.8rem', width: '160px' }}
              />
            </div>
          )}

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="mobile-swipe-hint">
        <span>👈 Swipe table left / right to see all columns 👉</span>
      </div>

      {/* Table Content */}
      <div className="table-scroll-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ minWidth: '100px' }}>{viewType === 'yearly' ? 'Year' : 'Month / Date'}</th>
              <th style={{ minWidth: '130px' }}>Opening Balance</th>
              <th style={{ minWidth: '120px' }}>Total Payment</th>
              <th style={{ minWidth: '120px', color: '#3b82f6' }}>Principal Paid</th>
              <th style={{ minWidth: '120px', color: '#f43f5e' }}>Interest Paid</th>
              <th style={{ minWidth: '130px' }}>Closing Balance</th>
              <th style={{ minWidth: '120px' }}>Loan Paid %</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => {
              const paidPercent = principal > 0
                ? Math.min(100, Math.max(0, (((principal - row.closingBalance) / principal) * 100))).toFixed(0)
                : 0;

              return (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>
                    {viewType === 'yearly' ? (
                      <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        Year {row.year}
                      </span>
                    ) : (
                      <div>
                        <span>#{row.month}</span>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {row.date}
                        </span>
                      </div>
                    )}
                  </td>
                  <td>{sym} {formatCurrency(row.openingBalance, currency)}</td>
                  <td style={{ fontWeight: 600 }}>{sym} {formatCurrency(viewType === 'yearly' ? row.totalEMI : row.emi, currency)}</td>
                  <td style={{ color: '#3b82f6', fontWeight: 600 }}>
                    {sym} {formatCurrency(viewType === 'yearly' ? row.totalPrincipal : row.principal, currency)}
                  </td>
                  <td style={{ color: '#f43f5e', fontWeight: 600 }}>
                    {sym} {formatCurrency(viewType === 'yearly' ? row.totalInterest : row.interest, currency)}
                  </td>
                  <td style={{ fontWeight: 600 }}>{sym} {formatCurrency(row.closingBalance, currency)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      <div style={{
                        width: '50px',
                        height: '6px',
                        background: 'var(--bg-input)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${paidPercent}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', minWidth: '28px' }}>{paidPercent}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls for Monthly View */}
      {viewType === 'monthly' && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing page {page} of {totalPages} ({filteredData.length} months)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: page === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: page === totalPages ? 0.5 : 1 }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
