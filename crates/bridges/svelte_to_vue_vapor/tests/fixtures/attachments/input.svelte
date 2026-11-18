<script>
  let value = $state('first');
  let visible = $state(true);
  function label(element) {
    element.setAttribute('data-label', value);
    return () => element.removeAttribute('data-label');
  }
</script>
<button onclick={() => value = value === 'first' ? 'second' : 'first'}>change</button>
<button onclick={() => visible = !visible}>toggle</button>
{#if visible}<p {@attach label}>attachment</p>{/if}
