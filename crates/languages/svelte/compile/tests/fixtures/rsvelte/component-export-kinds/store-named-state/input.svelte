<script lang="ts">
	import { writable } from "svelte/store";
	const state = writable(1);
</script>
<p>{$state}</p>
