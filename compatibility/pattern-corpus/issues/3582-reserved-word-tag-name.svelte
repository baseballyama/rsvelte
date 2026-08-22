<script>
  let v = $state(1);
  let el = $state(null);
</script>

<var>{v}</var>
<var bind:this={el}>{v}</var>
<class>{v}</class>
<function><return>{v}</return></function>
<typeof>{v}</typeof>
<await>{v}</await>
<enum>{v}</enum>
<debugger>{v}</debugger>
<async>{v}</async>
<get>{v}</get>
<svg viewBox="0 0 2 2">
  <switch>
    <text systemLanguage="en">{v}</text>
    <text>{v}</text>
  </switch>
</svg>
<b>{el ? 1 : 0}</b>
