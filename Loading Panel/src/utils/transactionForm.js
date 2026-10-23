import { validateDemoPayload } from '../services/storeCore.js';

export function emptyForm(currency = 'USD') {
  const year = new Date().getFullYear() + 2;
  return {
    serverProfileId: '',
    protocolFamily: 'online',
    protocolIdentifier: '',
    currency,
    transactionType: 'load',
    accountType: 'card',
    cardLast4: '',
    accountDraft: '',
    accountLast4: '',
    accountMasked: false,
    displayLabel: '',
    expiryMonth: '',
    expiryYear: String(year),
    holderName: '',
    bankName: '',
    bankAddress: '',
    country: 'US',
    routingCode: '',
    walletId: '',
    walletProvider: '',
    networkLabel: 'Demo ledger',
    amount: '',
    description: '',
    referenceNote: '',
    senderName: '',
    senderAccountType: 'bank',
    senderInstitution: '',
    senderAddress: '',
    receiverName: '',
    receiverAccountType: 'card',
    receiverInstitution: '',
    receiverAddress: '',
    confirmed: false,
  };
}

export function maskedAccount(form) {
  if (form.accountType === 'card' && /^\d{4}$/.test(form.cardLast4)) {
    return `**** **** **** ${form.cardLast4}`;
  }
  if (form.accountType === 'bank') {
    const digits = String(form.accountDraft || '').replace(/\D/g, '');
    const last4 = digits.length >= 8 && digits.length <= 17 ? digits.slice(-4) : form.accountLast4;
    if (/^\d{4}$/.test(last4 || '') && (form.accountMasked || (digits.length >= 8 && digits.length <= 17))) {
      return `******${last4}`;
    }
  }
  if (form.accountType === 'wallet') return form.walletId.trim();
  return '';
}

export function toPayload(form) {
  return {
    serverProfileId: form.serverProfileId,
    protocolFamily: form.protocolFamily,
    protocolIdentifier: form.protocolIdentifier,
    currency: form.currency,
    transactionType: form.transactionType,
    accountType: form.accountType,
    maskedIdentifier: maskedAccount(form),
    displayLabel: form.displayLabel,
    expiryMonth: form.expiryMonth,
    expiryYear: form.expiryYear,
    holderName: form.holderName,
    bankName: form.bankName,
    bankAddress: form.bankAddress,
    country: form.country,
    routingCode: form.routingCode,
    walletId: form.walletId,
    walletProvider: form.walletProvider,
    networkLabel: form.networkLabel,
    amount: String(form.amount ?? '').trim(),
    description: form.description,
    referenceNote: form.referenceNote,
    senderName: form.senderName,
    senderAccountType: form.senderAccountType,
    senderInstitution: form.senderInstitution,
    senderAddress: form.senderAddress,
    receiverName: form.receiverName,
    receiverAccountType: form.receiverAccountType,
    receiverInstitution: form.receiverInstitution,
    receiverAddress: form.receiverAddress,
    confirmedSimulation: form.confirmed === true,
  };
}

const STEP_FIELDS = {
  1: ['serverProfileId', 'protocolFamily', 'protocolIdentifier', 'currency', 'transactionType'],
  2: ['accountType', 'maskedIdentifier', 'expiryMonth', 'expiryYear', 'holderName', 'bankName', 'bankAddress', 'routingCode', 'walletId', 'walletProvider'],
  3: ['amount', 'description', 'referenceNote', 'senderName', 'senderAccountType', 'senderInstitution', 'senderAddress', 'receiverName', 'receiverAccountType', 'receiverInstitution', 'receiverAddress'],
  5: ['confirmedSimulation'],
};

export function errorsForStep(state, form, step) {
  if (!state) return { form: 'Demo configuration is still loading.' };
  const result = validateDemoPayload(state, toPayload(form));
  if (step === 5 || step === 4) {
    const fields = { ...result.fields };
    if (step === 4) delete fields.confirmedSimulation;
    return fields;
  }
  const allowed = new Set(STEP_FIELDS[step] || []);
  return Object.fromEntries(Object.entries(result.fields).filter(([key]) => allowed.has(key)));
}

export function applySample(form) {
  const shared = {
    amount: '250.00',
    description: 'Sample demo request for interface testing.',
    referenceNote: 'Sample data. Not a real counterparty.',
    senderName: 'Northwind Demo Desk',
    senderAccountType: 'bank',
    senderInstitution: 'Sample Harbor Bank (Demo)',
    senderAddress: '100 Demonstration Avenue, Sample City',
    receiverName: 'Demo Receiver',
    receiverAddress: '4 Ledger Lane, Sample City',
    displayLabel: 'Sample destination',
  };
  if (form.accountType === 'card') {
    return {
      ...form,
      ...shared,
      cardLast4: '4242',
      expiryMonth: '08',
      expiryYear: String(new Date().getFullYear() + 2),
      receiverAccountType: 'card',
      receiverInstitution: 'Example Card Studio (Demo)',
    };
  }
  if (form.accountType === 'bank') {
    return {
      ...form,
      ...shared,
      accountDraft: '',
      accountLast4: '4821',
      accountMasked: true,
      holderName: 'Demo Account Holder',
      bankName: 'Sample Harbor Bank (Demo)',
      bankAddress: '100 Demonstration Avenue, Sample City',
      country: 'US',
      routingCode: 'DEMOUS00XXX',
      receiverAccountType: 'bank',
      receiverInstitution: 'Example Clearing Desk (Demo)',
    };
  }
  return {
    ...form,
    ...shared,
    walletId: 'demo-wallet-1001',
    walletProvider: 'Demo Wallet Co.',
    networkLabel: 'Demo ledger',
    receiverAccountType: 'wallet',
    receiverInstitution: 'Demo Wallet Co.',
  };
}
