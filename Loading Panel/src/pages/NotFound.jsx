import { ButtonLink } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

export function NotFound() {
  return (
    <EmptyState
      title="This page is not part of the console"
      description="The address does not match a Milestone 1 screen. Return to the dashboard to continue with demo records."
      action={<ButtonLink to="/">Back to dashboard</ButtonLink>}
    />
  );
}
