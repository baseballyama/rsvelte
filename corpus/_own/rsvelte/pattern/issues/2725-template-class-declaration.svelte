<script>
	let enabled = true;
</script>

<p>{(() => { class T {} return new T(); })()}</p>
{#if enabled}
	<p>{(() => { class U {} return new U(); })()}</p>
{/if}
