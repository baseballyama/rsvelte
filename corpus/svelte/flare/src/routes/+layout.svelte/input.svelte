<script lang="ts">
	import '@fontsource-variable/inter';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<ModeWatcher />

{@render children()}
