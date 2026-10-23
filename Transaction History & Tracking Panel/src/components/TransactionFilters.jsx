import { Button } from './Button';
import { fieldProps, FormField } from './FormField';
import { ACCOUNT_TYPES, FAMILIES, TRANSACTION_TYPES } from '../utils/constants';

export function TransactionFilters({ filters, patch, protocols, currencies, onClear, idPrefix = 'filter' }) {
  const identifiers = protocols.filter((item) => !filters.protocolFamily || item.family === filters.protocolFamily);
  const fieldId = (name) => `${idPrefix}-${name}`;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Status" htmlFor={fieldId('status')}>
          <select {...fieldProps(fieldId('status'))} value={filters.status} onChange={(event) => patch({ status: event.target.value })}>
            <option value="">Any status</option>
            <option value="completed">Completed (Demo)</option>
            <option value="pending">Pending (Demo)</option>
            <option value="failed">Failed (Demo)</option>
            <option value="cancelled">Cancelled (Demo)</option>
          </select>
        </FormField>
        <FormField label="Transaction type" htmlFor={fieldId('type')}>
          <select {...fieldProps(fieldId('type'))} value={filters.transactionType} onChange={(event) => patch({ transactionType: event.target.value })}>
            <option value="">Any type</option>
            {TRANSACTION_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </FormField>
        <FormField label="Protocol family" htmlFor={fieldId('family')}>
          <select {...fieldProps(fieldId('family'))} value={filters.protocolFamily} onChange={(event) => patch({ protocolFamily: event.target.value, protocolIdentifier: '' })}>
            <option value="">Any family</option>
            {FAMILIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </FormField>
        <FormField label="Protocol identifier" htmlFor={fieldId('protocol')}>
          <select {...fieldProps(fieldId('protocol'))} value={filters.protocolIdentifier} onChange={(event) => patch({ protocolIdentifier: event.target.value })}>
            <option value="">Any identifier</option>
            {identifiers.map((item) => <option key={item.id} value={item.identifier}>{item.identifier}</option>)}
          </select>
        </FormField>
        <FormField label="Currency" htmlFor={fieldId('currency')}>
          <select {...fieldProps(fieldId('currency'))} value={filters.currency} onChange={(event) => patch({ currency: event.target.value })}>
            <option value="">Any currency</option>
            {currencies.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}
          </select>
        </FormField>
        <FormField label="Account type" htmlFor={fieldId('account')}>
          <select {...fieldProps(fieldId('account'))} value={filters.accountType} onChange={(event) => patch({ accountType: event.target.value })}>
            <option value="">Any account</option>
            {ACCOUNT_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </FormField>
        <FormField label="From" htmlFor={fieldId('from')}>
          <input {...fieldProps(fieldId('from'))} type="date" value={filters.dateFrom} onChange={(event) => patch({ dateFrom: event.target.value })} />
        </FormField>
        <FormField label="To" htmlFor={fieldId('to')}>
          <input {...fieldProps(fieldId('to'))} type="date" value={filters.dateTo} onChange={(event) => patch({ dateTo: event.target.value })} />
        </FormField>
      </div>
      <Button variant="ghost" onClick={onClear}>Clear filters</Button>
    </div>
  );
}
