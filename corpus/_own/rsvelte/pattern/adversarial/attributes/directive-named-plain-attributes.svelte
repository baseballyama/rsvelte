<script>
  let v = $state(1);
</script>

<div bind={v}>a</div>
<div use={v}>b</div>
<div on={v}>c</div>
<div transition={v}>d</div>
<div animate={v}>e</div>
<div let={v}>f</div>
<div style={v}>g</div>
<div class={v}>h</div>
<div bindvalue={v}>i</div>
<div data-bind:value={v}>j</div>
