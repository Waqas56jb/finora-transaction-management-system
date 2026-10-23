import { createInitialState } from '../data/seed.js';

export class StoreError extends Error {
  constructor(message, { code = 'VALIDATION', fields = null } = {}) {
    super(message);
    this.name = 'StoreError';
    this.expose = true;
    this.code = code;
    this.fields = fields;
  }
}

const FAMILIES = new Set(['online', 'offline', 'proprietary']);
const TYPES = new Set(['load', 'unload']);
const ACCOUNTS = new Set(['card', 'bank', 'wallet']);
const ENVIRONMENTS = new Set(['Demo', 'Not Connected']);
const SERVER_STATUSES = new Set(['connected_demo', 'disconnected', 'pending', 'error']);
const SERVER_TYPES = new Set(['online', 'offline', 'proprietary']);

let counter = 0;

function uid(prefix) {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function text(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function assertFields(fields) {
  if (Object.keys(fields).length) {
    throw new StoreError('Check the highlighted fields.', { fields });
  }
}

function paginate(items, page, pageSize) {
  const size = Math.min(50, Math.max(1, Number(pageSize) || 8));
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size) || 1);
  const current = Math.min(pages, Math.max(1, Number(page) || 1));
  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    total,
    page: current,
    pageSize: size,
    pages,
  };
}

function dayKey(iso) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function inRange(iso, from, to) {
  const key = dayKey(iso);
  if (from && key < from) return false;
  if (to && key > to) return false;
  return true;
}

function sortItems(items, key, dir, accessors) {
  const read = accessors[key] || accessors.createdAt || accessors.timestamp;
  const sign = dir === 'asc' ? 1 : -1;
  return items.slice().sort((a, b) => {
    const left = read(a);
    const right = read(b);
    if (left < right) return -1 * sign;
    if (left > right) return 1 * sign;
    return 0;
  });
}

function findTransaction(state, idOrRef) {
  return state.transactions.find((item) => item.id === idOrRef || item.reference === idOrRef);
}

function profileName(state, id) {
  return state.serverProfiles.find((item) => item.id === id)?.name || 'Unassigned';
}

function pushLog(state, entry) {
  const nextSequence = state.logSequence + 1;
  const log = {
    id: uid('log'),
    timestamp: new Date().toISOString(),
    serverProfileId: entry.serverProfileId || '',
    serverName: entry.serverName || profileName(state, entry.serverProfileId),
    protocolFamily: entry.protocolFamily || '',
    operation: entry.operation,
    result: entry.result,
    durationMs: entry.durationMs,
    referenceId: `DEMO-LOG-${new Date().getFullYear()}-${String(nextSequence).padStart(6, '0')}`,
    errorMessage: entry.errorMessage || '',
    simulated: true,
  };
  return {
    ...state,
    logSequence: nextSequence,
    connectionLogs: [log, ...state.connectionLogs].slice(0, 400),
  };
}

function event(title, detail) {
  return {
    id: uid('evt'),
    at: new Date().toISOString(),
    title,
    detail,
    simulated: true,
  };
}

function assertUrl(value, fields) {
  let url;
  try {
    url = new URL(value);
  } catch {
    fields.baseUrl = 'Enter a valid http or https URL.';
    return;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    fields.baseUrl = 'Use an http or https URL.';
    return;
  }
  if (/password|secret|api[_-]?key|token|cvv|pin/i.test(`${url.username}${url.password}${url.search}`)) {
    fields.baseUrl = 'Do not place secrets in the endpoint URL.';
  }
}

function validateProfile(payload, { partial = false } = {}) {
  const fields = {};
  const name = text(payload.name, 80);
  const type = payload.type;
  const environment = payload.environment;
  const baseUrl = text(payload.baseUrl, 180);
  const protocolFamily = payload.protocolFamily;
  const defaultCurrency = text(payload.defaultCurrency, 8).toUpperCase();
  const timeoutMs = Number(payload.timeoutMs);
  const status = payload.status;
  const notes = text(payload.notes, 500);

  if (!partial || payload.name !== undefined) {
    if (!name) fields.name = 'Server display name is required.';
  }
  if (!partial || payload.type !== undefined) {
    if (!SERVER_TYPES.has(type)) fields.type = 'Choose a server type.';
  }
  if (!partial || payload.environment !== undefined) {
    if (!ENVIRONMENTS.has(environment)) fields.environment = 'Choose Demo or Not Connected.';
  }
  if (!partial || payload.baseUrl !== undefined) {
    if (!baseUrl) fields.baseUrl = 'Base endpoint URL is required.';
    else assertUrl(baseUrl, fields);
  }
  if (!partial || payload.protocolFamily !== undefined) {
    if (!FAMILIES.has(protocolFamily)) fields.protocolFamily = 'Choose a protocol family.';
  }
  if (!partial || payload.defaultCurrency !== undefined) {
    if (!/^[A-Z]{3}$/.test(defaultCurrency)) fields.defaultCurrency = 'Choose a currency code.';
  }
  if (!partial || payload.timeoutMs !== undefined) {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 120000) {
      fields.timeoutMs = 'Timeout must be a whole number of milliseconds between 1,000 and 120,000.';
    }
  }
  if (!partial || payload.status !== undefined) {
    if (!SERVER_STATUSES.has(status)) fields.status = 'Choose a demo status.';
  }
  if (/\d{13,19}/.test(notes)) fields.notes = 'Do not store card numbers in notes.';

  assertFields(fields);
  return {
    name,
    type,
    environment,
    baseUrl,
    protocolFamily,
    defaultCurrency,
    timeoutMs,
    status,
    enabled: payload.enabled !== false,
    notes,
  };
}

const CARD_MASK = /^\*\*\*\* \*\*\*\* \*\*\*\* \d{4}$/;
const BANK_MASK = /^\*{6}\d{4}$/;
const SWIFT = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const IFSC = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function validateDemoPayload(state, payload) {
  const fields = {};
  const source = payload || {};
  const protocol = state.protocols.find((item) => item.identifier === source.protocolIdentifier);
  const profile = state.serverProfiles.find((item) => item.id === source.serverProfileId);
  const currency = state.currencies.find((item) => item.code === String(source.currency || '').toUpperCase());

  if (!profile) fields.serverProfileId = 'Choose a demo server profile.';
  else if (!profile.enabled) fields.serverProfileId = 'This demo server profile is disabled.';
  if (!FAMILIES.has(source.protocolFamily)) fields.protocolFamily = 'Choose a protocol family.';
  if (!source.protocolIdentifier) fields.protocolIdentifier = 'Choose a protocol identifier.';
  else if (!protocol) fields.protocolIdentifier = 'That identifier is not in the demo catalog.';
  else if (protocol.family !== source.protocolFamily) fields.protocolIdentifier = 'That identifier belongs to a different family.';
  if (profile && source.protocolFamily && profile.protocolFamily !== source.protocolFamily) {
    fields.serverProfileId = 'Choose a demo server from the same protocol family.';
  }
  if (!currency) fields.currency = 'Choose a currency.';
  else if (!currency.enabled) fields.currency = 'That currency is disabled in display settings.';
  if (!TYPES.has(source.transactionType)) fields.transactionType = 'Choose Load or Unload.';
  if (!ACCOUNTS.has(source.accountType)) fields.accountType = 'Choose an account type.';

  const amountText = String(source.amount ?? '').trim();
  let amount = null;
  if (!/^\d+(\.\d{1,2})?$/.test(amountText)) fields.amount = 'Enter a positive amount with up to two decimal places.';
  else {
    amount = Math.round(Number(amountText) * 100) / 100;
    if (amount <= 0 || amount > 999999.99) fields.amount = 'Enter an amount between 0.01 and 999,999.99.';
  }

  if (text(source.description, 180).length < 3) fields.description = 'Enter a short description (at least 3 characters).';
  if (text(source.referenceNote, 140).length > 140) fields.referenceNote = 'Keep the reference note under 140 characters.';

  if (source.accountType === 'card') {
    if (!CARD_MASK.test(source.maskedIdentifier || '')) {
      fields.maskedIdentifier = 'Enter exactly four sample digits. Only a masked demo number is stored.';
    }
    if (!/^(0[1-9]|1[0-2])$/.test(source.expiryMonth || '')) fields.expiryMonth = 'Choose an expiry month for the preview.';
    const year = Number(source.expiryYear);
    const currentYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(source.expiryYear || '') || year < currentYear || year > currentYear + 12) {
      fields.expiryYear = 'Choose a presentation year from this year through the next 12 years.';
    }
  }

  if (source.accountType === 'bank') {
    if (!BANK_MASK.test(source.maskedIdentifier || '')) {
      fields.maskedIdentifier = 'Enter 8 to 17 sample digits. Only the last four are stored.';
    }
    if (text(source.holderName, 80).length < 2) fields.holderName = 'Account holder name is required.';
    if (text(source.bankName, 80).length < 2) fields.bankName = 'Bank name is required.';
    if (text(source.bankAddress, 160).length < 4) fields.bankAddress = 'Bank address is required.';
    const country = text(source.country, 2).toUpperCase();
    const routing = text(source.routingCode, 16).toUpperCase();
    if (country === 'IN') {
      if (!IFSC.test(routing)) fields.routingCode = 'Enter a demo IFSC in the form ABCD0XXXXXX. This is a format check only.';
    } else if (!SWIFT.test(routing)) {
      fields.routingCode = 'Enter a demo SWIFT/BIC with 8 or 11 letters and digits. It is not looked up on any network.';
    }
  }

  if (source.accountType === 'wallet') {
    const walletId = text(source.walletId, 40);
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{2,39}$/.test(walletId)) {
      fields.walletId = 'Use a short synthetic wallet label. Do not enter a seed phrase or private key.';
    }
    if (/^(0x)?[a-fA-F0-9]{64}$/.test(walletId) || walletId.split(/\s+/).length >= 12) {
      fields.walletId = 'Private keys and seed phrases are not accepted.';
    }
    if (text(source.walletProvider, 80).length < 2) fields.walletProvider = 'Wallet provider is required.';
  }

  const parties = [
    ['sender', 'Sender'],
    ['receiver', 'Receiver'],
  ];
  parties.forEach(([prefix, label]) => {
    if (text(source[`${prefix}Name`], 80).length < 2) fields[`${prefix}Name`] = `${label} display name is required.`;
    if (!ACCOUNTS.has(source[`${prefix}AccountType`])) fields[`${prefix}AccountType`] = `Choose a ${label.toLowerCase()} account type.`;
    if (text(source[`${prefix}Institution`], 80).length < 2) fields[`${prefix}Institution`] = `${label} institution or provider is required.`;
    const address = text(source[`${prefix}Address`], 160);
    if (source[`${prefix}AccountType`] === 'bank' && address.length < 4) {
      fields[`${prefix}Address`] = `${label} address is required for a bank account.`;
    }
  });

  if (source.confirmedSimulation !== true) {
    fields.confirmedSimulation = 'Confirm that this is a simulated record before continuing.';
  }

  const forbidden = ['cvv', 'cvc', 'pin', 'otp', 'password', 'privateKey', 'pan', 'fullCardNumber'];
  forbidden.forEach((key) => {
    if (source[key]) fields[key] = 'That field is not collected.';
  });

  return {
    ok: Object.keys(fields).length === 0,
    fields,
    message: 'Check the highlighted fields.',
    amount,
    protocol,
    profile,
    currency,
  };
}

function buildAccount(payload) {
  if (payload.accountType === 'card') {
    return {
      maskedIdentifier: payload.maskedIdentifier,
      displayLabel: text(payload.displayLabel, 40),
      expiryMonth: payload.expiryMonth,
      expiryYear: payload.expiryYear,
    };
  }
  if (payload.accountType === 'bank') {
    const country = text(payload.country, 2).toUpperCase();
    return {
      maskedIdentifier: payload.maskedIdentifier,
      displayLabel: text(payload.displayLabel, 40),
      holderName: text(payload.holderName, 80),
      bankName: text(payload.bankName, 80),
      bankAddress: text(payload.bankAddress, 160),
      country,
      routingLabel: country === 'IN' ? 'IFSC' : 'SWIFT/BIC',
      routingCode: text(payload.routingCode, 16).toUpperCase(),
    };
  }
  return {
    maskedIdentifier: text(payload.walletId, 40),
    displayLabel: text(payload.displayLabel, 40),
    walletProvider: text(payload.walletProvider, 80),
    networkLabel: text(payload.networkLabel, 40),
  };
}

function party(payload, prefix) {
  return {
    displayName: text(payload[`${prefix}Name`], 80),
    accountType: payload[`${prefix}AccountType`],
    institution: text(payload[`${prefix}Institution`], 80),
    address: text(payload[`${prefix}Address`], 160),
  };
}

function readOnly(data) {
  return { state: null, data, mutate: false };
}

function write(state, data) {
  return { state, data, mutate: true };
}

const methods = {
  getSnapshot(state) {
    return readOnly(clone(state));
  },
  getTransactions(state) {
    const items = state.transactions.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return readOnly(items);
  },
  getTransactionById(state, payload) {
    const record = findTransaction(state, payload?.id || payload?.reference);
    if (!record) throw new StoreError('No demo record matches that reference.', { code: 'NOT_FOUND' });
    return readOnly(clone(record));
  },
  searchTransactions(state, payload = {}) {
    const query = text(payload.query, 80).toLowerCase();
    let rows = state.transactions.slice();
    if (query) {
      rows = rows.filter((item) => {
        const haystack = [
          item.reference,
          item.account?.displayLabel,
          item.account?.maskedIdentifier,
          item.protocolIdentifier,
          item.serverProfileName,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }
    const equals = ['status', 'transactionType', 'protocolFamily', 'protocolIdentifier', 'currency', 'accountType'];
    equals.forEach((key) => {
      if (payload[key]) rows = rows.filter((item) => item[key] === payload[key]);
    });
    if (payload.dateFrom || payload.dateTo) {
      rows = rows.filter((item) => inRange(item.createdAt, payload.dateFrom, payload.dateTo));
    }
    rows = sortItems(rows, payload.sort || 'createdAt', payload.dir || 'desc', {
      reference: (item) => item.reference,
      transactionType: (item) => item.transactionType,
      protocolIdentifier: (item) => item.protocolIdentifier,
      currency: (item) => item.currency,
      amount: (item) => item.amount,
      status: (item) => item.status,
      createdAt: (item) => item.createdAt,
      accountType: (item) => item.accountType,
      serverProfileName: (item) => item.serverProfileName,
    });
    if (payload.unpaged) {
      return readOnly({ items: rows, total: rows.length, page: 1, pageSize: rows.length || 1, pages: 1 });
    }
    return readOnly(paginate(rows, payload.page, payload.pageSize));
  },
  createDemoTransaction(state, payload) {
    const check = validateDemoPayload(state, payload);
    if (!check.ok) throw new StoreError(check.message, { fields: check.fields });
    const createdAt = new Date().toISOString();
    const sequence = state.sequence + 1;
    const reference = `DEMO-TXN-${new Date().getFullYear()}-${String(sequence).padStart(6, '0')}`;
    const requiresBackend = check.protocol.availability === 'requires_backend';
    const status = requiresBackend ? 'pending' : 'completed';
    const backendNote = requiresBackend
      ? `${check.protocol.identifier} is stored as configuration metadata. No message was sent and no backend is connected.`
      : 'The demo workflow finished locally. No funds were loaded, unloaded, or settled.';
    const stamp = (seconds, title, detail) => ({
      ...event(title, detail),
      at: new Date(Date.now() + seconds * 1000).toISOString(),
    });
    const timeline = [
      stamp(0, 'Demo request created', 'A simulated transaction record was stored in the local demo dataset.'),
      stamp(1, 'Input validation completed', 'Required demo fields passed local validation. Names were not verified against any institution.'),
      stamp(2, 'Mock processing started', 'No external network or financial institution was contacted.'),
    ];
    if (requiresBackend) {
      timeline.push(stamp(3, 'Demo record left pending', backendNote));
    } else {
      timeline.push(stamp(3, 'Mock processing completed', backendNote));
      timeline.push(stamp(4, 'Receipt preview generated', 'A demo receipt preview is available. It is not a financial instrument.'));
    }
    const record = {
      id: uid('txn'),
      reference,
      transactionType: payload.transactionType,
      accountType: payload.accountType,
      protocolFamily: payload.protocolFamily,
      protocolIdentifier: check.protocol.identifier,
      protocolName: check.protocol.name,
      serverProfileId: check.profile.id,
      serverProfileName: check.profile.name,
      environmentLabel: check.profile.environment,
      currency: check.currency.code,
      amount: check.amount,
      description: text(payload.description, 180),
      referenceNote: text(payload.referenceNote, 140),
      account: buildAccount(payload),
      sender: party(payload, 'sender'),
      receiver: party(payload, 'receiver'),
      status,
      createdAt,
      updatedAt: createdAt,
      receiptPreviewAt: requiresBackend ? null : createdAt,
      approvalDemo: null,
      timeline,
      demoMode: true,
    };
    let next = {
      ...state,
      sequence,
      transactions: [record, ...state.transactions],
    };
    next = pushLog(next, {
      serverProfileId: check.profile.id,
      serverName: check.profile.name,
      protocolFamily: payload.protocolFamily,
      operation: requiresBackend ? 'Unsupported protocol selected' : 'Demo transaction record created',
      result: requiresBackend ? 'error' : 'success',
      durationMs: 40,
      errorMessage: requiresBackend ? backendNote : '',
    });
    return write(next, clone(record));
  },
  updateDemoTransaction(state, payload = {}) {
    const current = findTransaction(state, payload.id);
    if (!current) throw new StoreError('No demo record matches that reference.', { code: 'NOT_FOUND' });
    if (payload.status) {
      throw new StoreError('Status changes are limited to demo cancellation.', { code: 'FORBIDDEN' });
    }
    const description = payload.description === undefined ? current.description : text(payload.description, 180);
    const referenceNote = payload.referenceNote === undefined ? current.referenceNote : text(payload.referenceNote, 140);
    if (description.length < 3) throw new StoreError('Enter a short description.', { fields: { description: 'Enter a short description.' } });
    const updated = {
      ...current,
      description,
      referenceNote,
      updatedAt: new Date().toISOString(),
      timeline: [...current.timeline, event('Demo record updated', 'Display text was updated locally. The original creation time was not changed.')],
    };
    const transactions = state.transactions.map((item) => (item.id === current.id ? updated : item));
    return write({ ...state, transactions }, clone(updated));
  },
  cancelDemoTransaction(state, payload = {}) {
    const current = findTransaction(state, payload.id);
    if (!current) throw new StoreError('No demo record matches that reference.', { code: 'NOT_FOUND' });
    if (!['pending', 'completed'].includes(current.status)) {
      throw new StoreError('This demo record can no longer be cancelled.');
    }
    const updated = {
      ...current,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
      timeline: [...current.timeline, event('Demo record cancelled', 'The local demo record was cancelled. This does not reverse or settle a real payment.')],
    };
    const transactions = state.transactions.map((item) => (item.id === current.id ? updated : item));
    return write({ ...state, transactions }, clone(updated));
  },
  refreshReceiptPreview(state, payload = {}) {
    const current = findTransaction(state, payload.id);
    if (!current) throw new StoreError('No demo record matches that reference.', { code: 'NOT_FOUND' });
    const updated = {
      ...current,
      receiptPreviewAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [...current.timeline, event('Receipt preview timestamp refreshed', 'The preview time changed. The original creation timestamp was kept.')],
    };
    const transactions = state.transactions.map((item) => (item.id === current.id ? updated : item));
    return write({ ...state, transactions }, clone(updated));
  },
  generateDemoReference(state, payload = {}) {
    const current = findTransaction(state, payload.id);
    if (!current) throw new StoreError('No demo record matches that reference.', { code: 'NOT_FOUND' });
    if (current.approvalDemo) {
      throw new StoreError('A demo reference already exists. This screen does not reset or override authorizations.');
    }
    const code = `DEMO-APR-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const updated = {
      ...current,
      approvalDemo: {
        code,
        createdAt: new Date().toISOString(),
        notice: 'Non-authoritative demo reference. Not a valid banking approval code.',
      },
      updatedAt: new Date().toISOString(),
      timeline: [...current.timeline, event('Demo reference generated', 'A non-authoritative demo reference was generated locally. It is not a banking approval code.')],
    };
    const transactions = state.transactions.map((item) => (item.id === current.id ? updated : item));
    return write({ ...state, transactions }, clone(updated));
  },
  getServerProfiles(state) {
    return readOnly(clone(state.serverProfiles));
  },
  createServerProfile(state, payload) {
    const value = validateProfile(payload);
    if (!state.currencies.some((item) => item.code === value.defaultCurrency)) {
      throw new StoreError('Choose a currency from the demo list.', { fields: { defaultCurrency: 'Choose a currency from the demo list.' } });
    }
    const profile = { id: uid('srv'), ...value, updatedAt: new Date().toISOString() };
    let next = { ...state, serverProfiles: [profile, ...state.serverProfiles] };
    next = pushLog(next, {
      serverProfileId: profile.id,
      serverName: profile.name,
      protocolFamily: profile.protocolFamily,
      operation: 'Local configuration saved',
      result: 'success',
      durationMs: 18,
    });
    return write(next, clone(profile));
  },
  updateServerProfile(state, payload = {}) {
    const current = state.serverProfiles.find((item) => item.id === payload.id);
    if (!current) throw new StoreError('That demo server profile was not found.', { code: 'NOT_FOUND' });
    const value = validateProfile({ ...current, ...payload });
    if (!state.currencies.some((item) => item.code === value.defaultCurrency)) {
      throw new StoreError('Choose a currency from the demo list.', { fields: { defaultCurrency: 'Choose a currency from the demo list.' } });
    }
    const profile = { ...current, ...value, id: current.id, updatedAt: new Date().toISOString() };
    let next = {
      ...state,
      serverProfiles: state.serverProfiles.map((item) => (item.id === current.id ? profile : item)),
    };
    next = pushLog(next, {
      serverProfileId: profile.id,
      serverName: profile.name,
      protocolFamily: profile.protocolFamily,
      operation: 'Local configuration saved',
      result: 'success',
      durationMs: 16,
    });
    return write(next, clone(profile));
  },
  deleteServerProfile(state, payload = {}) {
    const current = state.serverProfiles.find((item) => item.id === payload.id);
    if (!current) throw new StoreError('That demo server profile was not found.', { code: 'NOT_FOUND' });
    let next = {
      ...state,
      serverProfiles: state.serverProfiles.filter((item) => item.id !== current.id),
      protocols: state.protocols.map((item) => (
        item.serverProfileId === current.id ? { ...item, serverProfileId: '', updatedAt: new Date().toISOString() } : item
      )),
    };
    next = pushLog(next, {
      serverProfileId: '',
      serverName: current.name,
      protocolFamily: current.protocolFamily,
      operation: 'Local configuration saved',
      result: 'success',
      durationMs: 14,
      errorMessage: 'Demo profile removed from local configuration. Existing records keep the stored display name.',
    });
    return write(next, { id: current.id });
  },
  testDemoConnection(state, payload = {}) {
    const profile = state.serverProfiles.find((item) => item.id === payload.id);
    if (!profile) throw new StoreError('That demo server profile was not found.', { code: 'NOT_FOUND' });
    let outcome;
    if (!profile.enabled) {
      outcome = {
        result: 'validation',
        operation: 'Local form validation failed',
        title: 'Local form validation failed',
        message: 'This demo profile is disabled. Enable it before running a simulated connection test. No outbound request was sent.',
        durationMs: 12,
      };
    } else if (profile.status === 'connected_demo') {
      outcome = {
        result: 'success',
        operation: 'Mock connection successful',
        title: 'Mock connection successful',
        message: profile.protocolFamily === 'proprietary'
          ? 'The local simulation marked this proprietary profile as reachable. Messaging standards were not executed, and the endpoint URL was not contacted.'
          : 'The demo profile responded in a local simulation. No financial network was contacted, and the endpoint URL was not called.',
        durationMs: 240,
      };
    } else if (profile.status === 'error') {
      outcome = {
        result: 'error',
        operation: 'Mock connection failed',
        title: 'Mock connection failed',
        message: 'A simulated endpoint error was returned because this profile is marked Error. No outbound request was sent.',
        durationMs: 180,
      };
    } else {
      outcome = {
        result: 'timeout',
        operation: 'Mock connection timeout',
        title: 'Mock connection timeout',
        message: 'The local simulation timed out because this profile is Disconnected or Pending. The endpoint URL was not contacted.',
        durationMs: profile.timeoutMs,
      };
    }
    const started = pushLog(state, {
      serverProfileId: profile.id,
      serverName: profile.name,
      protocolFamily: profile.protocolFamily,
      operation: 'Demo connection initiated',
      result: 'info',
      durationMs: 30,
    });
    const next = pushLog(started, {
      serverProfileId: profile.id,
      serverName: profile.name,
      protocolFamily: profile.protocolFamily,
      operation: outcome.operation,
      result: outcome.result,
      durationMs: outcome.durationMs,
      errorMessage: outcome.result === 'success' ? '' : outcome.message,
    });
    return write(next, {
      ...outcome,
      url: profile.baseUrl,
      referenceId: next.connectionLogs[0].referenceId,
      simulated: true,
    });
  },
  getProtocols(state) {
    return readOnly(clone(state.protocols));
  },
  updateProtocol(state, payload = {}) {
    const current = state.protocols.find((item) => item.id === payload.id);
    if (!current) throw new StoreError('That protocol record was not found.', { code: 'NOT_FOUND' });
    const fields = {};
    const name = text(payload.name, 80);
    const description = text(payload.description, 360);
    if (!name) fields.name = 'Display name is required.';
    if (description.length < 12) fields.description = 'Add a short description of at least 12 characters.';
    assertFields(fields);
    const updated = {
      ...current,
      name,
      description,
      enabled: payload.enabled === true,
      updatedAt: new Date().toISOString(),
    };
    const protocols = state.protocols.map((item) => (item.id === current.id ? updated : item));
    return write({ ...state, protocols }, clone(updated));
  },
  getCurrencies(state) {
    return readOnly(clone(state.currencies));
  },
  updateCurrency(state, payload = {}) {
    const current = state.currencies.find((item) => item.code === payload.code);
    if (!current) throw new StoreError('That currency was not found.', { code: 'NOT_FOUND' });
    const enabled = payload.enabled === true;
    if (!enabled) {
      const remaining = state.currencies.filter((item) => item.enabled && item.code !== current.code).length;
      if (remaining < 1) throw new StoreError('At least one currency must stay enabled.');
      const used = state.serverProfiles.some((item) => item.defaultCurrency === current.code && item.enabled);
      if (used) throw new StoreError('This currency is the default on an enabled demo server profile.');
    }
    const currencies = state.currencies.map((item) => (item.code === current.code ? { ...item, enabled } : item));
    return write({ ...state, currencies }, currencies.find((item) => item.code === current.code));
  },
  getConnectionLogs(state, payload = {}) {
    const query = text(payload.query, 80).toLowerCase();
    let rows = state.connectionLogs.slice();
    if (query) {
      rows = rows.filter((item) => [item.operation, item.referenceId, item.errorMessage, item.serverName]
        .join(' ')
        .toLowerCase()
        .includes(query));
    }
    if (payload.serverProfileId) rows = rows.filter((item) => item.serverProfileId === payload.serverProfileId);
    if (payload.protocolFamily) rows = rows.filter((item) => item.protocolFamily === payload.protocolFamily);
    if (payload.result) rows = rows.filter((item) => item.result === payload.result);
    if (payload.dateFrom || payload.dateTo) rows = rows.filter((item) => inRange(item.timestamp, payload.dateFrom, payload.dateTo));
    rows = sortItems(rows, payload.sort || 'timestamp', payload.dir || 'desc', {
      timestamp: (item) => item.timestamp,
      serverName: (item) => item.serverName,
      protocolFamily: (item) => item.protocolFamily,
      operation: (item) => item.operation,
      result: (item) => item.result,
      durationMs: (item) => item.durationMs,
      referenceId: (item) => item.referenceId,
    });
    if (payload.unpaged) {
      return readOnly({ items: rows, total: rows.length, page: 1, pageSize: rows.length || 1, pages: 1 });
    }
    return readOnly(paginate(rows, payload.page, payload.pageSize));
  },
};

export function applyMethod(state, method, payload) {
  const handler = methods[method];
  if (!handler) throw new StoreError('That demo operation is not available.', { code: 'NOT_FOUND' });
  const current = state?.version ? state : createInitialState();
  return handler(current, payload || {});
}

export { createInitialState };
