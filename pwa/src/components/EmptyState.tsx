import { Icon, type IconName } from "./Icon";

interface Props {
  icon: IconName;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, message, actionLabel, onAction }: Props) {
  return (
    <div className="empty-state">
      <span className="icon">
        <Icon name={icon} size={48} strokeWidth={1.4} />
      </span>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
