<script>
	import Widget from './Widget.svelte';
	import { settings } from './stores.js';

	$: current = $settings.current;
</script>

<Widget value={current} onSave={settings.set} />
