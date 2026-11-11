<script>
	class C { set p(v) /*W*/ { globalThis.x = v; } }
	export const a = new C();
</script>

<p>x</p>
