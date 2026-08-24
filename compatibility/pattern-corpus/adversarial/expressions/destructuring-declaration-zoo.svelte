<script>
  const source = { a: 1, b: { c: 2 }, d: [3, 4, 5] };

  const {
    a,
    b: { c },
    d: [first, , third],
    ...others
  } = source;
  const [, second = 9, ...tailRest] = source.d;

  let swapA = 1;
  let swapB = 2;
  [swapA, swapB] = [swapB, swapA];

  let assigned;
  ({ a: assigned } = source);
</script>

<b>{a}{c}</b>
<b>{first}{third}{Object.keys(others).length}</b>
<b>{second}{tailRest.length}</b>
<b>{swapA}{swapB}{assigned}</b>
