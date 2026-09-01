import { Badge } from '@/components/ui/badge'
import { SERVICE_STATUS_LABELS, type ServiceStatus } from '@/types/api'

const STATUS_VARIANT: Record<
  ServiceStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'outline',
  in_progress: 'secondary',
  completed: 'default',
  delivered: 'default',
  cancelled: 'destructive',
}

export function StatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {SERVICE_STATUS_LABELS[status]}
    </Badge>
  )
}
