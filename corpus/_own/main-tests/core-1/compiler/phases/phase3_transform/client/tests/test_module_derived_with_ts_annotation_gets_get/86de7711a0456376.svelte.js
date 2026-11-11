
export const useStore = () => {
  let position = $state({ x: 0, y: 0 });

  const contentStyle = $derived.by(() => {
    return `transform: translate(${position.x}px, ${position.y}px);`;
  });

  return {
    contentStyle: () => contentStyle,
  };
};
