export interface Category {
  readonly id: number; // Unique Category ID (used for API/DB)
  readonly slug: string; // e.g., 'groceries'
  readonly label: string; // Display name
  readonly color: string; // Hex code for charts
  readonly icon: string; // Ionic icon name
}

// Senior Dev Tip: Define a fallback constant for uncategorized state
export const UNCATEGORIZED: Category = {
  id: 0,
  slug: 'uncategorized',
  label: 'Uncategorized',
  color: '#95a5a6', 
  icon: 'help-circle'
};