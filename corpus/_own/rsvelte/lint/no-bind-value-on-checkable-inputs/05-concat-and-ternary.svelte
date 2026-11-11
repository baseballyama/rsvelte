<script>
  let v = '';
  let cond = true;
</script>

<input type={'check' + 'box'} bind:value={v} />
<input type={cond ? 'checkbox' : 'checkbox'} bind:value={v} />
<input type={cond ? 'checkbox' : 'radio'} bind:value={v} />
