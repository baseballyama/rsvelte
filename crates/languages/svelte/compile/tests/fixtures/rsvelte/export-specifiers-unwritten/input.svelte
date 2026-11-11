<script>
	let { p = 1 } = $props();
	let a = 1;
	let s = $state(0);
	let f = () => 1;
	class K {}
	let _class = '';
	export { a, s, p, f, K, _class as class };
</script>
<div class={_class} onclick={f}>{a} {s} {p}</div>
