const MAP = {
  transaction: {
    completed: { label: 'Completed (Demo)', tone: 'success' },
    pending: { label: 'Pending (Demo)', tone: 'warning' },
    failed: { label: 'Failed (Demo)', tone: 'danger' },
    cancelled: { label: 'Cancelled (Demo)', tone: 'neutral' },
  },
  server: {
    connected_demo: { label: 'Connected (Demo)', tone: 'info' },
    disconnected: { label: 'Disconnected', tone: 'neutral' },
    pending: { label: 'Pending', tone: 'warning' },
    error: { label: 'Error', tone: 'danger' },
  },
  log: {
    success: { label: 'Mock success', tone: 'success' },
    error: { label: 'Error', tone: 'danger' },
    timeout: { label: 'Timeout', tone: 'warning' },
    validation: { label: 'Validation', tone: 'neutral' },
    info: { label: 'Info', tone: 'info' },
  },
  protocol: {
    available_demo: { label: 'Available for demo', tone: 'success' },
    requires_backend: { label: 'Requires backend', tone: 'warning' },
  },
};

export function statusMeta(kind, status) {
  return MAP[kind]?.[status] || { label: status || 'Unknown', tone: 'neutral' };
}
