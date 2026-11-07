<script lang="ts">
	let isOpen = false;

	let id: string | undefined = undefined;
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<button on:click={() => (isOpen = !isOpen)} />

{#if !isOpen}
	<div>{id}</div>
{/if}

{#if !isOpen && id}
	<div>{id}</div>
{/if}

{#if !isOpen && !!id}
	<div>only visible when isOpen and id</div>
{/if}

{#if !isOpen && id !== undefined}
	<div>only visible when isopen and id</div>
{/if}
