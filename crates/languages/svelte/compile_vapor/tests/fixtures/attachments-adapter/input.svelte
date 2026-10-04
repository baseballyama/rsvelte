<script>
  import { fromAction as attachmentFromAction } from 'svelte/attachments';
  let value = $state('first');
  let visible = $state(true);
  let destroyed = $state(0);
  function action(element, parameter) {
    element.setAttribute('data-action', parameter);
    return {
      update(next) { element.setAttribute('data-action', next); },
      destroy() { element.removeAttribute('data-action'); destroyed += 1; }
    };
  }
  const attachment = attachmentFromAction(action, () => value);
  function tracking(element) {
    element.setAttribute('data-tracking', String($effect.tracking()));
    return () => element.removeAttribute('data-tracking');
  }
</script>
<button onclick={() => value = value === 'first' ? 'second' : 'first'}>change</button>
<button onclick={() => visible = !visible}>toggle</button>
<output>{destroyed}</output>
{#if visible}<p {@attach attachment} {@attach tracking}>action</p>{/if}
