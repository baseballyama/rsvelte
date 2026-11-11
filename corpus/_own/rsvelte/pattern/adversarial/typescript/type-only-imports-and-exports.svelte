<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";
  import { type Writable, writable } from "svelte/store";

  type Local = { id: number };

  interface Extended extends Local {
    label: string;
  }

  export type { Local };
  export type Alias = Extended;

  let {
    rows = [] as Local[],
    body,
  }: { rows?: Local[]; body?: Snippet<[Local]> } = $props();

  const store: Writable<number> = writable(0);
  const labelled: Extended = { id: 1, label: "l" };

  type SelfProps = ComponentProps<
    typeof import("./type-only-imports-and-exports.svelte").default
  >;

  function identity<T>(value: T): T {
    return value;
  }
</script>

<b>{rows.length}{labelled.label}{$store}</b>
<b>{identity(1)}</b>
{#if body}
  {@render body(labelled)}
{/if}
