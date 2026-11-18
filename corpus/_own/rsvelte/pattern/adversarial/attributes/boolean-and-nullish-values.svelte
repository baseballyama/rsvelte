<script>
  let flag = $state(true);
  const nothing = null;
  const undef = undefined;
</script>

<input disabled />
<input disabled={flag} />
<input disabled={0} />
<input disabled={""} />
<input disabled={nothing} />
<input disabled={undef} />
<input checked={NaN} />
<input readonly={flag ? "" : undefined} />
<div hidden={flag}>a</div>
<div contenteditable={flag}>b</div>
<div draggable={flag}>c</div>
<div inert>d</div>
<option selected={flag}>e</option>
