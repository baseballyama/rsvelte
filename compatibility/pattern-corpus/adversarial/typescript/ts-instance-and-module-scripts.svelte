<script lang="ts" module>
  export type Mode = "a" | "b";

  export const modes: Mode[] = ["a", "b"];

  let shared = $state(0);

  export function bump(): number {
    shared += 1;
    return shared;
  }
</script>

<script lang="ts">
  let { mode = "a" as Mode }: { mode?: Mode } = $props();

  const index = $derived(modes.indexOf(mode));
</script>

<button onclick={() => bump()}>{index}</button>
