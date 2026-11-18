<script>
  const TYPES = { CHECK: 'checkbox', RADIO: 'radio' };
  let stable = 'checkbox';
  let reassigned = 'checkbox';
  reassigned = 'text';
  let v = '';
</script>

<input type={TYPES.CHECK} bind:value={v} />
<input type={TYPES['RADIO']} bind:value={v} />
<input type={stable} bind:value={v} />
<input type={reassigned} bind:value={v} />
