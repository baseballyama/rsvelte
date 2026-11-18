export const fn = () => {
  let arr = $state.raw([[1, 2]]);
  arr = [[3, 4]];
  if (arr[0].length !== 0) arr[0][0];
};