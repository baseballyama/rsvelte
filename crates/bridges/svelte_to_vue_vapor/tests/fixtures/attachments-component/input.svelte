<script>
  import Wrapper from '../attachments-wrapper/input.svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  let value = $state('first');
  let enabled = $state(true);
  let visible = $state(true);
  let cleanups = $state(0);
  const key = createAttachmentKey();
  function direct(element) {
    element.setAttribute('data-label', value);
    return () => { element.removeAttribute('data-label'); cleanups += 1; };
  }
  function programmatic(element) {
    element.setAttribute('data-extra', value);
    return () => element.removeAttribute('data-extra');
  }
</script>
<button onclick={() => value = value === 'first' ? 'second' : 'first'}>change</button>
<button onclick={() => enabled = !enabled}>enable</button>
<button onclick={() => visible = !visible}>toggle</button>
<output>{cleanups}</output>
{#if visible}
  <Wrapper title="wrapper" {@attach enabled && direct} {...{ [key]: programmatic }} >child</Wrapper>
{/if}
