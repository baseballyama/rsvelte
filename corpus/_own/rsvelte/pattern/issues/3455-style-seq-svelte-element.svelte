<script>
	let s = "x";
	let o = { k: "k" };
	let rest = { id: 1 };
	function f() { return "z"; }
	void s;
	void o;
	void rest;
	void f;
</script>
<svelte:element this="span" style:color="{s}{f()}"></svelte:element>
