export const eager = (() => {
  let seed = 0;
  seed += 1;
  return seed;
})();

hoisted();

function hoisted() {
  return eager;
}

let late = $state(hoisted());

export const arrowIife = (() => late)();

export function read() {
  late += 1;
  return `${eager}/${arrowIife}/${late}`;
}

export default hoisted;
