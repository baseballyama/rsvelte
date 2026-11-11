<script>
  let n = $state(1);

  const noParen = (x) => x;
  const noParams = () => n;
  const block = (x) => {
    return x + n;
  };
  const objectBody = (x) => ({ x });
  const asyncArrow = async (x) => await Promise.resolve(x);
  const curried = (a) => (b) => (c) => a + b + c;
  const defaults = (a = 1, { b = 2 } = {}, ...rest) => a + b + rest.length;
  const named = function namedFn(x) {
    return x;
  };
  const anonymous = function (x) {
    return x;
  };
  const generator = function* () {
    yield n;
  };
  const asyncGenerator = async function* () {
    yield n;
  };
</script>

<b>{noParen(1)}{noParams()}{block(1)}</b>
<b>{objectBody(1).x}{curried(1)(2)(3)}{defaults()}</b>
<b>{named(1)}{anonymous(1)}</b>
<b>{[...generator()].length}{typeof asyncArrow}{typeof asyncGenerator}</b>
