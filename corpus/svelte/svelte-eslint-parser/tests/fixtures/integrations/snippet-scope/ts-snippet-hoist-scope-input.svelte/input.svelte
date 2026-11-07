<script lang="ts">
	const bar = foo;
</script>

{#snippet foo()}
	<p>Hello World!</p>
{/snippet}

{@render bar()}
