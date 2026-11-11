<script>
class B {
	m() {
		return 1;
	}
}

class K extends B {
	private get a() { return 1; }
}

const r = new K().m();
</script>
<p>{r}</p>
