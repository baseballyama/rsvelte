<script>
  const rows = [
    { id: 1, label: "a" },
    { id: 2, label: "b" },
  ];

  let selectedRow = $state(rows[0]);
  let selectedId = $state(1);
  let selectedText = $state("a");
</script>

<select bind:value={selectedRow}>
  {#each rows as row (row.id)}
    <option value={row}>{row.label}</option>
  {/each}
</select>

<select bind:value={selectedId}>
  {#each rows as row (row.id)}
    <option value={row.id}>{row.label}</option>
  {/each}
</select>

<select bind:value={selectedText}>
  <option>a</option>
  <option>b</option>
</select>

<select bind:value={selectedId}>
  <optgroup label="g">
    <option value={1}>a</option>
  </optgroup>
  <optgroup label="h" disabled>
    <option value={2} disabled>b</option>
  </optgroup>
</select>

<b>{selectedRow.label}{selectedId}{selectedText}</b>
