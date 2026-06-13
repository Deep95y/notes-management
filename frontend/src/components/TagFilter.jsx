export default function TagFilter({ tags, selectedTag, onSelectTag }) {
  if (!tags.length) return null;

  return (
    <div className="tag-filter">
      <span className="tag-filter-label">Filter by tag:</span>
      <button
        type="button"
        className={`tag tag-clickable ${!selectedTag ? "tag-active" : ""}`}
        onClick={() => onSelectTag("")}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          className={`tag tag-clickable ${selectedTag === tag ? "tag-active" : ""}`}
          onClick={() => onSelectTag(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
