// Franchise options for filter panel
export const FRANCHISE_OPTIONS = [
    { value: '', label: 'All Franchises' },
    { value: 'frozen', label: 'Frozen' },
    { value: 'toy-story', label: 'Toy Story' },
    { value: 'lion-king', label: 'The Lion King' },
    { value: 'moana', label: 'Moana' },
    { value: 'aladdin', label: 'Aladdin' },
    { value: 'beauty-and-the-beast', label: 'Beauty and the Beast' },
    { value: 'hercules', label: 'Hercules' },
    { value: 'little-mermaid', label: 'The Little Mermaid' }
];

// Mapping for franchise search terms
export const FRANCHISE_SEARCH_TERMS = {
    'frozen': ['frozen', 'frost', 'arendelle'],
    'toy-story': ['toy story'],
    'lion-king': ['lion king'],
    'moana': ['moana'],
    'aladdin': ['aladdin'],
    'beauty-and-the-beast': ['beauty and the beast'],
    'hercules': ['hercules'],
    'little-mermaid': ['little mermaid', 'ariel']
};

// Special character names for specific franchises
export const FRANCHISE_CHARACTER_NAMES = {
    'frozen': ['elsa', 'anna', 'olaf', 'kristoff'],
    'little-mermaid': ['ariel', 'sebastian', 'flounder']
};