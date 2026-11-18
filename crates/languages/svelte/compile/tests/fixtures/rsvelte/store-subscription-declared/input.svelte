<script lang="ts">
	import { writable } from "svelte/store";
	const a = writable(0); // $a
	declare const $a: string;
</script>

{$a}
