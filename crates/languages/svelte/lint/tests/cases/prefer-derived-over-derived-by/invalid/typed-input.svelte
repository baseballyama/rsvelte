<script lang="ts">
	let a = $state(1);
	const b = $derived.by((): number => a * 2);
	const c = $derived.by(() => {
		return;
	});
</script>
{b}{c}