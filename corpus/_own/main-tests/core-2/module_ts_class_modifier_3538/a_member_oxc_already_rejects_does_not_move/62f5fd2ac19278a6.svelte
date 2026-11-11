<script>
class B {
	m() {
		return 1;
	}
}

class K extends B {
	declare m(): void;
}

const r = new K().m();
</script>
<p>{r}</p>
