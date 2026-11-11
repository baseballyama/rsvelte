let x = $state.raw({ a: 1 });
function setKey(key, value) { x[key] = value; }
function reassign(next) { x = next; }
