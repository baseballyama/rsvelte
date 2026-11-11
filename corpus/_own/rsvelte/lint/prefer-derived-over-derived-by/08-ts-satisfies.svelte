<script lang="ts">
	let a = $state(1);
	let v = $derived.by(() => a satisfies number);
	let w = $derived.by((): number => a as number);
</script>

{v}{w}
