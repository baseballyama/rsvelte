<script>
  const decimal = 1234;
  const separated = 1_234_567;
  const hex = 0xff;
  const octal = 0o17;
  const binary = 0b1010;
  const float = 1.5;
  const trailingDot = 1;
  const leadingDot = 0.5;
  const exponent = 1e3;
  const negativeExponent = 1e-3;
  const big = 9007199254740993n;
  const bigHex = 0xffn;
  const infinity = Infinity;
  const notANumber = NaN;
  const negativeZero = -0;
</script>

<b>{decimal}{separated}</b>
<b>{hex}{octal}{binary}</b>
<b>{float}{trailingDot}{leadingDot}</b>
<b>{exponent}{negativeExponent}</b>
<b>{String(big)}{String(bigHex)}</b>
<b>{infinity}{notANumber}{negativeZero}</b>
