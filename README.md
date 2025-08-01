# Disney Character Explorer

An interactive directory for exploring Disney characters built with Lit web components and vanilla JavaScript.

## Features

- Search characters by name or keywords
- Filter by franchise, role, and era
- Character cards with detailed information
- Favorites system with localStorage persistence
- URL-based filter state
- Responsive grid layout
- Loading states and error handling

## Tech Stack

- Lit (Web Components)
- Vanilla JavaScript
- Disney API (disneyapi.dev)

## Project Structure

```
src/
  components/
    search-bar.js       # Search input with autocomplete
    filter-panel.js     # Filter controls
    character-card.js   # Individual character display
    results-grid.js     # Grid layout for results
    favorites-panel.js  # Saved characters panel
  services/
    filters.js          # handle filter related logic
    api.js             # Disney API integration
    storage.js         # localStorage management
    url-state.js       # URL state management
  styles/
    main.css           # Global styles
  index.html           # Entry point
  main.js             # App initialization
```

## Component Architecture

### SearchBar Component
- Handles text input and autocomplete
- Emits search events
- Debounced input handling

### FilterPanel Component
- Manages filter UI state
- Emits filter change events
- Syncs with URL parameters

### CharacterCard Component
- Displays character information
- Handles favorite toggling
- Loading state management

### ResultsGrid Component
- Responsive grid layout
- Virtual scrolling for performance
- Empty state handling

### FavoritesPanel Component
- Manages favorite characters
- localStorage integration
- Toggle visibility

## Filter Architecture

The filter system is implemented using a combination of:
1. URL state management for shareable filters
2. Client-side filtering for quick updates
3. Debounced API calls for server-side filtering

## Performance Optimizations

1. Virtual scrolling for large datasets (not Implemented)
2. Debounced search input
3. Memoized filter functions (not Implemented)
4. Lazy loading images
5. Client-side caching


## API Integration

The app uses the Disney API (disneyapi.dev) for character data. The API integration includes:
- Error handling
- Rate limiting
- Response caching
- Fallback strategies