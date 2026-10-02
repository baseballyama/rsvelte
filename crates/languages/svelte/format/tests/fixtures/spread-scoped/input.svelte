<script>
	let props = $props();
	let open = $state(false);
</script>

<p {...props}>scoped</p>
<p {...props} class="lead">scoped with class</p>
<p {...props} class:open>scoped with directive</p>
<em {...props}>unscoped</em>
<button type="button" onclick={() => (open = !open)}>toggle</button>

<style>
	p {
		color: teal;
	}
	.open {
		font-style: italic;
	}
</style>
