<script lang="ts">
	let a = $state(1);
	const b = $derived(a * 2);
	const c = $derived.by(() => {
		return;
	});
</script>
{b}{c}