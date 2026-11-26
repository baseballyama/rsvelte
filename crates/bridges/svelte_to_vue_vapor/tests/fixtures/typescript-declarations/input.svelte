<script module lang="ts">
  import type { Snippet } from "svelte";
  export interface Item { label: string }
  export declare const enum Kind { A }
  namespace Labels { export type Label = string; }
  export const start = 1;
</script>

<script lang="ts">
  type Count = number;
  declare let JSON: { stringify(value: unknown): string };
  declare function untouched(): void;
  import { type Item as Same } from "./missing.js";
  let count: Count = $state(start);
</script>

<button onclick={() => count++}>{JSON.stringify({ count })}</button>
