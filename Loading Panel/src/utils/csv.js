function escapeCell(value) {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(headers, rows) {
  const head = headers.map((header) => escapeCell(header.label)).join(',');
  const body = rows.map((row) => headers.map((header) => escapeCell(header.value(row))).join(','));
  return [head, ...body].join('\r\n');
}

export function downloadText(filename, contents, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([type.includes('csv') ? `\uFEFF${contents}` : contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const TRANSACTION_CSV_COLUMNS = [
  { label: 'Transaction reference', value: (row) => row.reference },
  { label: 'Transaction type', value: (row) => row.transactionType },
  { label: 'Account type', value: (row) => row.accountType },
  { label: 'Server profile', value: (row) => row.serverProfileName },
  { label: 'Protocol family', value: (row) => row.protocolFamily },
  { label: 'Protocol identifier', value: (row) => row.protocolIdentifier },
  { label: 'Currency', value: (row) => row.currency },
  { label: 'Amount', value: (row) => row.amount },
  { label: 'Status', value: (row) => row.status },
  { label: 'Masked identifier', value: (row) => row.account?.maskedIdentifier || '' },
  { label: 'Account label', value: (row) => row.account?.displayLabel || '' },
  { label: 'Description', value: (row) => row.description },
  { label: 'Created at', value: (row) => row.createdAt },
  { label: 'Updated at', value: (row) => row.updatedAt },
  { label: 'Demo mode', value: () => 'yes' },
];

export const LOG_CSV_COLUMNS = [
  { label: 'Timestamp', value: (row) => row.timestamp },
  { label: 'Demo server profile', value: (row) => row.serverName },
  { label: 'Protocol family', value: (row) => row.protocolFamily },
  { label: 'Operation', value: (row) => row.operation },
  { label: 'Result', value: (row) => row.result },
  { label: 'Duration (ms)', value: (row) => row.durationMs },
  { label: 'Reference ID', value: (row) => row.referenceId },
  { label: 'Error message', value: (row) => row.errorMessage || '' },
  { label: 'Simulated', value: () => 'yes' },
];
