<script>let { listEl } = $props();</script>
<button onclick={() => {
	// svelte-ignore ownership_invalid_mutation
	listEl.style.overflow = "hidden";
}}>x</button>
