<script>
  let plain = 1;
  plain += 2;
  plain **= 2;
  plain <<= 1;
  plain >>= 1;
  plain >>>= 1;
  plain %= 7;
  plain &= 6;
  plain |= 1;
  plain ^= 3;

  let flag = null;
  flag ??= "on";

  let truthy = 1;
  truthy &&= 2;

  let falsy = 0;
  falsy ||= 3;

  const shown = `${plain}/${flag}/${truthy}/${falsy}`;
</script>

<b>{shown}</b>
