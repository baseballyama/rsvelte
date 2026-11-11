<script>
  let value = $state('first');
  let visible = $state(true);
  function label(element, value) {
    element.setAttribute('data-label', value);
    return {
      update(value) { element.setAttribute('data-label', value); },
      destroy() { element.removeAttribute('data-label'); }
    };
  }
</script>
<button onclick={() => value = value === 'first' ? 'second' : 'first'}>change</button>
<button onclick={() => visible = !visible}>toggle</button>
{#if visible}<p use:label={value}>action</p>{/if}
