<script>
  let text = $state("t");
  let num = $state(1);
  let checked = $state(false);
  let file = $state(null);
  let date = $state("");
</script>

<input type="text" bind:value={text} />
<input type="search" bind:value={text} />
<input type="email" bind:value={text} />
<input type="password" bind:value={text} />
<input type="url" bind:value={text} />
<input type="tel" bind:value={text} />
<input type="number" bind:value={num} />
<input type="range" bind:value={num} />
<input type="date" bind:value={date} />
<input type="time" bind:value={date} />
<input type="datetime-local" bind:value={date} />
<input type="month" bind:value={date} />
<input type="week" bind:value={date} />
<input type="color" bind:value={text} />
<input type="checkbox" bind:checked />
<input type="file" bind:files={file} />
<input type="hidden" value={text} />
<b>{text}{num}{checked}{date}{file ? 1 : 0}</b>
