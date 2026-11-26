<script>
	let a = $state(0);
	// svelte-ignore state_referenced_locally TODO
	let b = a;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -- pointer convenience, Escape covers keyboard users -->
<div onclick={() => {}}>{b}</div>
