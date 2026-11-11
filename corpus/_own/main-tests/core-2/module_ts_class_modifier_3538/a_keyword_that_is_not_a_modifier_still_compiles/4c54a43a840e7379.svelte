<script>
class B {
	m() {
		return 1;
	}
}

class K extends B {
	static { }
}

const r = new K().m();
</script>
<p>{r}</p>
