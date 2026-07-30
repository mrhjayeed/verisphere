export default function StatusBadge({ status }) {
  if (!status) return null;
  const label = status.replace(/_/g, ' ');
  return (
    <span className={`badge badge-${status.replace(/_/g, '-')}`}>
      {label}
    </span>
  );
}
