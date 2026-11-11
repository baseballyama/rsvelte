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
<div style:color|important="{s}{o.k}"></div>
