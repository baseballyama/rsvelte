<script>
  let café = $state(1);
  let 日本語 = $state(2);
  let _underscore = $state(3);
  let dollar$Infix = 4;
  let abc = $state(5);
  const 𝕊 = 6;
  const über = { ä: 7 };
  const table = { "quoted-key": 8, 9: 9 };
</script>

<b>{café}{日本語}{_underscore}</b>
<b>{dollar$Infix}{abc}</b>
<b>{𝕊}{über.ä}</b>
<b>{table["quoted-key"]}{table[9]}</b>
