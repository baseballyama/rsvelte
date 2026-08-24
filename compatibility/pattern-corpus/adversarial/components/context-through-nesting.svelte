<script>
  import Self from "./context-through-nesting.svelte";

  import { getContext, hasContext, setContext } from "svelte";

  let { depth = 0 } = $props();

  const key = Symbol.for("ctx");

  if (depth === 0) {
    setContext(key, { level: 0 });
    setContext("string", "root");
  }

  const inherited = hasContext(key) ? getContext(key) : { level: -1 };

  if (depth > 0) {
    setContext(key, { level: inherited.level + 1 });
  }
</script>

{#if depth < 3}
  <Self depth={depth + 1} />
{/if}

<b>{depth}:{inherited.level}</b>
