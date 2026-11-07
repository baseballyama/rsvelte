<script context="module" lang="ts">
	import { writable } from 'svelte/store';
	const a = writable(0)
	declare const $a: string
</script>
<script lang="ts">
	const b = writable(0)
	declare const $b: string
</script>
{$a}
{$b}
