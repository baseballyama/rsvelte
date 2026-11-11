<script>
  let n = $state(0);
  let log = $state([]);

  function record(value) {
    log.push(value);
    return value;
  }
</script>

<b>{record(n)}</b>
<b>{(record(n), n)}</b>
<b>{[n].map((value) => record(value)).join("")}</b>
<button onclick={() => (n += 1)}>{n}</button>
<button onclick={() => log.push(n)}>{log.length}</button>
<button
  onclick={() => {
    n += 1;
    log = [...log, n];
  }}>go</button
>
