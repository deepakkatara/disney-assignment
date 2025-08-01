// Role options for filter panel
export const ROLE_OPTIONS = [
    { value: '', label: 'All Roles' },
    { value: 'hero', label: 'Hero' },
    { value: 'villain', label: 'Villain' },
    { value: 'sidekick', label: 'Sidekick' }
];

// Role determination rules
export const ROLE_RULES = {
    isVillain: (character) => 
        character.enemies?.length > 0 && (!character.allies || character.allies.length === 0),
    
    isHero: (character) => 
        character.allies?.length > 0 && character.enemies?.length > 0,
    
    isSidekick: (character) => 
        character.allies?.length > 0 && (!character.enemies || character.enemies.length === 0)
};