<script>
class B {
	m() {
		return 1;
	}
}

class K extends B {
	static async *m() {}
}

const r = new K().m();
</script>
<p>{r}</p>
