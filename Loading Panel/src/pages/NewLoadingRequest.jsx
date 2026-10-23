import { LoadingWizard } from '../components/LoadingWizard';
import { PageHeader } from '../components/PageHeader';

export function NewLoadingRequest() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Demo workflow"
        title="New loading request"
        description="Design and validate a simulated load or unload. Submission creates a demo record only."
      />
      <LoadingWizard />
    </div>
  );
}
