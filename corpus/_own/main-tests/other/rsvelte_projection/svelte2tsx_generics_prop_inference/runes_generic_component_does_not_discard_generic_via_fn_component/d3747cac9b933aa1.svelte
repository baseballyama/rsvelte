<script lang="ts" generics="T">
import type { Snippet } from 'svelte';
let { rows, getKey, rowSnippet }: { rows: T[]; getKey: (row: T) => string; rowSnippet: Snippet<[{ row: T }]>; } = $props();
</script>
{#each rows as r}{getKey(r)}{@render rowSnippet({ row: r })}{/each}