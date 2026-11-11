<script>
  let activeElement = $state(null);
  let fullscreenElement = $state(null);
  let pointerLockElement = $state(null);
  let visibilityState = $state("visible");

  const noop = () => {};

  function action(node) {
    return { destroy() {} };
  }
</script>

<svelte:document
  bind:activeElement
  bind:fullscreenElement
  bind:pointerLockElement
  bind:visibilityState
  onvisibilitychange={noop}
  onselectionchange={noop}
/>

<svelte:body use:action onmouseenter={noop} onmouseleave={noop} />

<b>{activeElement ? 1 : 0}{fullscreenElement ? 1 : 0}</b>
<b>{pointerLockElement ? 1 : 0}{visibilityState}</b>
