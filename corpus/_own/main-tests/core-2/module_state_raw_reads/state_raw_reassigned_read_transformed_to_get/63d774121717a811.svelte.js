let x = $state.raw({ label: 'BUTTON' });
function reassign(next) { x = next; }
export const value = (key) => x[key];
