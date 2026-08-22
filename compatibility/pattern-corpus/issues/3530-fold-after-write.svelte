<script>
  let total = 1;
  total += 2;
  const shown = total;

  let flag = null;
  flag ??= "on";
  const label = flag;

  let shifted = 1;
  shifted <<= 2;
  const moved = shifted;

  let counted = 0;
  for (const n of [1, 2]) counted += n;
  const summed = counted;

  let guarded = "a";
  try {
    guarded += "b";
  } catch {
    guarded = "c";
  }
  const joined = guarded;

  let captured = 1;
  const bump = () => {
    captured = 2;
  };
  bump();
  const taken = captured;

  const frozen = 5;
  const alias = frozen;
</script>

<b>{shown}{label}{moved}{summed}{joined}{taken}{alias}</b>
