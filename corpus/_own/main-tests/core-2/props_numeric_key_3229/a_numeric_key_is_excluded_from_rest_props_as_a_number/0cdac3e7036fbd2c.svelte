<script>
	let { 1: a, x: b, ...rest } = $props();
</script>

<button onclick={() => (a = 2)}>{b}{rest.z}</button>
