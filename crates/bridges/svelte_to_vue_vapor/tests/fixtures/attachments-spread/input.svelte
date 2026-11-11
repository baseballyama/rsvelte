<script>
  import { createAttachmentKey } from 'svelte/attachments';
  let value = $state('first');
  let mode = $state(0);
  let visible = $state(true);
  let cleanups = $state(0);
  const key = createAttachmentKey();
  const ignored = Symbol('ordinary');
  function label(element) {
    element.setAttribute('data-label', value);
    return () => { element.removeAttribute('data-label'); cleanups += 1; };
  }
  function alternate(element) {
    element.setAttribute('data-label', 'alternate');
    return () => { element.removeAttribute('data-label'); cleanups += 1; };
  }
  function nested(element) {
    $effect(() => {
      element.setAttribute('data-nested', value);
      return () => element.removeAttribute('data-nested');
    });
  }
</script>
<button onclick={() => value = value === 'first' ? 'second' : 'first'}>change</button>
<button onclick={() => mode = (mode + 1) % 3}>mode</button>
<button onclick={() => visible = !visible}>toggle</button>
<output>{cleanups}</output>
{#if visible}
  <p {...{ title: 'spread', [key]: mode === 0 ? label : mode === 1 ? alternate : false, [ignored]: 'ignored' }} {@attach nested}>attachment</p>
{/if}
