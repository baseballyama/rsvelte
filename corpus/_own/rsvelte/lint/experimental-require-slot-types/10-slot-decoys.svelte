<script lang="ts">
	import Card from './Card.svelte';
	const s = '<slot>';
	void s;
</script>
<Card>
	<p slot="header">named slot attribute, not a slot element</p>
</Card>
