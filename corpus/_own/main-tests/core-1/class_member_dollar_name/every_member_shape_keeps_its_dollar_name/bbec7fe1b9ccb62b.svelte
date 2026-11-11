<script>
	class C {
		*$gen() { yield 1; }
		#priv = 1;
		static { void 0; }
		async $am() { return 1; }
		$bare;
	}
	let c = new C();
</script>
<p>{c}</p>