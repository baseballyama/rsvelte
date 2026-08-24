<svelte:options runes={false} />

<script>
  import {
    run,
    createBubbler,
    handlers,
    passive,
    nonpassive,
    once,
    preventDefault,
    self,
    stopPropagation,
    stopImmediatePropagation,
    trusted,
  } from "svelte/legacy";

  export let value = 1;

  const bubble = createBubbler();

  let seen = 0;

  run(() => {
    seen = value;
  });

  function bump() {
    seen += 1;
  }
</script>

<button on:click={handlers(bump, bubble("click"))}>a</button>
<button on:click={once(bump)}>b</button>
<button on:click={preventDefault(bump)}>c</button>
<button on:click={self(bump)}>d</button>
<button on:click={stopPropagation(bump)}>e</button>
<button on:click={stopImmediatePropagation(bump)}>f</button>
<button on:click={trusted(bump)}>g</button>
<div use:passive={["scroll", bump]}>h</div>
<div use:nonpassive={["scroll", bump]}>i</div>
<b>{seen}</b>
