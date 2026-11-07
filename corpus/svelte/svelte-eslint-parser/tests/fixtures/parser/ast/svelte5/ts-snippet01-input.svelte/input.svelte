<script lang="ts">
    let msg = ""
</script>

{#snippet foo(msg: string)}
	<p>{msg}</p>
{/snippet}

{@render foo(msg)}
