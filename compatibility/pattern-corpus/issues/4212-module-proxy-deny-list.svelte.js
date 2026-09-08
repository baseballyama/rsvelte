const tag = (parts, ...values) => parts.join('|') + values.join('|');

export async function collect(load, x) {
  let sequence = $state((0, {}));
  let tagged = $state(tag`t`);
  let parenthesised = $state({});
  let awaited = $state(await load());
  let equality = $state(x === 1);

  let store = $state(0);

  store = (0, {});
  store = tag`t`;
  store = await load();

  return [sequence, tagged, parenthesised, awaited, equality, store];
}

export function controls(x) {
  const literal = 1;
  const undef = undefined;

  let primitive = $state(1);
  let text = $state('x');
  let interpolated = $state(`t`);
  let negated = $state(!x);
  let sum = $state(x + 1);
  let callback = $state(() => 1);
  let missing = $state(undefined);
  let object = $state({});
  let created = $state(new Map());
  let branch = $state(x ? 1 : {});
  let chained = $state(x?.y);

  let target = $state(0);

  target = literal;
  target = undef;

  return [
    primitive,
    text,
    interpolated,
    negated,
    sum,
    callback,
    missing,
    object,
    created,
    branch,
    chained,
    target,
  ];
}
