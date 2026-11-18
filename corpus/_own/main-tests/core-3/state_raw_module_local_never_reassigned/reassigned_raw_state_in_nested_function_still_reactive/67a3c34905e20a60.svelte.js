export const fn = () => {
  let items = $state.raw([]);
  items = [1];
  return items.length;
};