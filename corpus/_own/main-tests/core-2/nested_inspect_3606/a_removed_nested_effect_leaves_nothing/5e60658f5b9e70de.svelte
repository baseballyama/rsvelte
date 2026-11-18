<script>
	let a = $state(1);
	let d = $derived(a * 2);
	class C {
		m() {
			$effect(() => a);
		}
	}
	new C().m();
</script>
<b>{a}{d}</b>
