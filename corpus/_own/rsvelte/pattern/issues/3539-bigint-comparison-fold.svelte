<script>
  const fraction = 2n < 2.5;
  const rounded = 2n > 2.5;
  const nullish = 2n > null;
  const undef = 2n < undefined;
  const bigints = 7n <= 7n;
  const numericText = 2n < "3";
  const nonNumericText = 2n < "x";
  const boolean = 0n < true;
</script>

<p>{fraction} {rounded} {nullish} {undef}</p>
<p>{bigints} {numericText} {nonNumericText} {boolean}</p>

<p>{2n == 2} {2n === 2} {2n != 2} {2n == "2"}</p>
<p>{2n == "x"} {1n == true} {2n == null} {0 == "0"}</p>
