<script>
	const array = [1, 2, 3, [4]];
	export const [a, b, c, [d]] = array;
	export const { p, q: r, ...s } = { p: 1, q: 2 };
	export class Foo {}
	let x = $state(1);
</script>
{x} {a}
<button onclick={() => x++}>{p}</button>
