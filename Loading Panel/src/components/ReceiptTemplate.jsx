import { QRCodeSVG } from 'qrcode.react';
import { brand } from '../config/brand';
import { formatDateTime, formatMoney } from '../utils/format';
import { ACCOUNT_LABEL, TYPE_LABEL } from '../utils/constants';
import { statusMeta } from '../utils/status';

const SLIPS = {
  standard: { paper: '#ffffff', ink: '#1c1917', muted: '#57534e', rule: '#e7e5e4', accent: '#1e3a5f', name: 'Standard online receipt' },
  white: { paper: '#ffffff', ink: '#1c1917', muted: '#57534e', rule: '#d6d3d1', accent: '#1c1917', name: 'White slip' },
  black: { paper: '#171717', ink: '#fafaf9', muted: '#d6d3d1', rule: '#404040', accent: '#fafaf9', name: 'Black slip' },
  blue: { paper: '#e8f1fb', ink: '#14233b', muted: '#3d5270', rule: '#c5d7ee', accent: '#1e3a5f', name: 'Blue slip' },
  yellow: { paper: '#fff6d8', ink: '#3f2e05', muted: '#6b5420', rule: '#ead48a', accent: '#8a5a00', name: 'Yellow slip' },
};

export const SLIP_OPTIONS = [
  ['standard', 'Standard receipt'],
  ['white', 'White slip'],
  ['black', 'Black slip'],
  ['blue', 'Blue slip'],
  ['yellow', 'Yellow slip'],
];

export function ReceiptTemplate({ record, variant = 'standard', displayName, embed = false }) {
  const theme = SLIPS[variant] || SLIPS.standard;
  const meta = statusMeta('transaction', record.status);
  const qr = `finora-demo:lookup:${record.reference}`;
  return (
    <article
      id={embed ? undefined : 'receipt-print'}
      style={{
        background: theme.paper,
        color: theme.ink,
        border: `1px solid ${theme.rule}`,
        borderRadius: 16,
        width: '100%',
        maxWidth: variant === 'standard' ? 640 : 420,
        margin: '0 auto',
        overflow: 'hidden',
        fontFamily: 'Inter, Segoe UI, sans-serif',
      }}
    >
      <div style={{ background: '#7f1d1d', color: '#fff', padding: '10px 16px', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textAlign: 'center' }}>
        DEMO — NOT A VALID FINANCIAL INSTRUMENT
      </div>
      <div style={{ padding: '20px 16px' }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.muted }}>{theme.name}</p>
        <h2 style={{ margin: '8px 0 0', fontSize: 22 }}>{displayName || brand.product}</h2>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: theme.muted }}>Simulated preview for interface testing. This slip does not move funds or certify an account.</p>
        <div style={{ height: 1, background: theme.rule, margin: '16px 0' }} />
        <Row label="Demo reference" value={record.reference} theme={theme} />
        <Row label="Record created" value={formatDateTime(record.createdAt)} theme={theme} />
        <Row label="Preview timestamp" value={formatDateTime(record.receiptPreviewAt)} theme={theme} />
        <Row label="Transaction type" value={TYPE_LABEL[record.transactionType] || record.transactionType} theme={theme} />
        <Row label="Amount" value={formatMoney(record.amount, record.currency)} theme={theme} />
        <Row label="Protocol" value={`${record.protocolIdentifier} · ${record.protocolFamily}`} theme={theme} />
        <Row label="Account type" value={ACCOUNT_LABEL[record.accountType] || record.accountType} theme={theme} />
        <Row label="Masked identifier" value={record.account?.maskedIdentifier || '—'} theme={theme} />
        <Row label="Demo status" value={meta.label} theme={theme} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginTop: 18 }}>
          <QRCodeSVG value={qr} size={104} bgColor={theme.paper} fgColor={theme.ink} />
          <div>
            <p style={{ margin: 0, fontSize: 12, color: theme.muted }}>QR contents</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, wordBreak: 'break-all' }}>{qr}</p>
          </div>
        </div>
        <p style={{ margin: '16px 0 0', fontSize: 12, lineHeight: 1.6, color: theme.muted }}>
          Verification disclaimer: scanning this code returns only the local demo reference. It does not verify a payment, a balance, a cardholder, or an institution.
        </p>
      </div>
    </article>
  );
}

function Row({ label, value, theme }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, padding: '7px 0', fontSize: 14, borderBottom: `1px solid ${theme.rule}` }}>
      <span style={{ color: theme.muted }}>{label}</span>
      <span style={{ textAlign: 'right', fontWeight: 600, overflowWrap: 'anywhere', maxWidth: '100%' }}>{value}</span>
    </div>
  );
}

export function SlipTemplate(props) {
  return <ReceiptTemplate {...props} />;
}
