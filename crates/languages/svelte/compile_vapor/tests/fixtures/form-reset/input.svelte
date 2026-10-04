<script>
  let text = $state('first');
  let adopted = $state();
  let number = $state(1);
  let checked = $state(false);
  let adoptedChecked = $state();
  let selected = $state('a');
  let multiple = $state(['a']);
  let group = $state(['a']);
  let radio = $state('a');
  let cancelled = $state(false);
  let form = $state();
</script>
<form bind:this={form} onreset={(event) => { if (cancelled) event.preventDefault(); }}>
  <input class="text" bind:value={text} defaultValue="default" />
  <input class="adopted" defaultValue="adopted" bind:value={adopted} />
  <input class="number" type="number" bind:value={number} defaultValue="4" />
  <input class="checked" type="checkbox" bind:checked defaultChecked={true} />
  <input class="adopted-checked" type="checkbox" bind:checked={adoptedChecked} defaultChecked={true} />
  <select class="single" bind:value={selected}><option value="a">a</option><option value="b">b</option></select>
  <select class="multiple" multiple bind:value={multiple}><option value="a" selected>a</option><option value="b">b</option></select>
  <input class="group" type="checkbox" value="a" bind:group={group} />
  <input class="group" type="checkbox" value="b" bind:group={group} />
  <input class="radio" type="radio" value="a" bind:group={radio} />
  <input class="radio" type="radio" value="b" bind:group={radio} />
  <button class="reset" type="reset">reset</button>
</form>
<button class="program" onclick={() => form.reset()}>program reset</button>
<button class="cancel" onclick={() => cancelled = !cancelled}>cancel</button>
<p>{text}:{adopted}:{number}:{typeof number}:{checked}:{adoptedChecked}:{selected}:{multiple.join(',')}:{group.join(',')}:{radio}:{cancelled}</p>
