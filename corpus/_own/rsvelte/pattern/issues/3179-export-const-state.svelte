<script>
	export const plain = 1;
	export const st = $state(1);
	export const raw = $state.raw([1]);

	let mutable = $state(2);
	mutable = 3;
	export { mutable };

	let local = 0;
</script>

<div>{plain}{st}{raw.length}{mutable}{local}</div>
