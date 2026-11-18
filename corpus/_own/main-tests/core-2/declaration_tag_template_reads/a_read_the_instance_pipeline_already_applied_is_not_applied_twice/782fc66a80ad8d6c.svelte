<script>import { writable } from 'svelte/store';
const s = writable(1);</script>
{#if true}{const c = $s}{/if}
