<script lang="ts">
	import { writable } from 'svelte/store';
	writable(0, function (this: Window, set: () => void) { set(); });
	writable(0, function (this: Window) {});
	writable(0, function (set: () => void) { set(); });
</script>
