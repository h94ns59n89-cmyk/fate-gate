import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function ReportLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-brand">
      <LoadingSpinner size="lg" />
    </div>
  );
}
