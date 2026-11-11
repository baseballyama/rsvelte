<script>
	import Widget from './Widget.svelte';
	import documents from './documents.js';

	export let object;
</script>

<Widget query={{ [`${documents.mixin}.item`]: object.id }} />
