<script>
  let count = $state(0);
  function title() { return String(count); }
  function read() {
    const previous = typeof document === 'undefined' ? 'server' :
      document.querySelector('[data-probe]')?.getAttribute('title') ?? 'unset';
    return `${count}:${previous}`;
  }
</script>
<button onclick={() => count++}>change</button>
<p data-probe title={title()} class:previous={read().endsWith(':0')}>{read()}</p>
