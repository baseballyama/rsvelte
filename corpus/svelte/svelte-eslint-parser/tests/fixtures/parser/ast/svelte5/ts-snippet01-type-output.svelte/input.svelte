<script lang="ts">
    let msg = "" // msg: string
</script>

{#snippet foo(msg: string)} <!-- foo: (msg: string) => void, msg: string -->
	<p>{msg}</p> <!-- msg: string -->
{/snippet}

{@render foo(msg)} <!-- foo(msg): void -->
