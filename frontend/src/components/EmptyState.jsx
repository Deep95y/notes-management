import { Link } from "react-router-dom";

export default function EmptyState({ message, actionLabel, actionTo }) {
  return (
    <div className="state-box empty-state">
      <p>{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
