export const useFoo = () => {
  let pos = $state({ x: 0 });
  const style = $derived.by(() => {
    return `transform: translate(${pos.x}px);`;
  });
  return style;
};
