<script module>
	const b = 1;
</script>
<script>
	import a from './a.js';
</script>
{#snippet a()}<p>1</p>{/snippet}
{#snippet b()}<p>2</p>{/snippet}
{#snippet c()}{@render a()}{/snippet}
{@render a()}{@render b()}{@render c()}
