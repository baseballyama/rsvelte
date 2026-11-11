
export const fn = () => {
  return (node) => {
    const d = $state({ x: 1 });
    const clearTooltipListeners = $state([]);
    return clearTooltipListeners;
  };
};
