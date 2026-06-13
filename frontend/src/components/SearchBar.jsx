import { useState } from "react";

export default function SearchBar({ onSearch, placeholder = "Search notes..." }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(query.trim());
  }

  function handleClear() {
    setQuery("");
    onSearch("");
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search notes"
      />
      <button type="submit" className="btn btn-secondary">
        Search
      </button>
      {query && (
        <button type="button" className="btn btn-ghost" onClick={handleClear}>
          Clear
        </button>
      )}
    </form>
  );
}
