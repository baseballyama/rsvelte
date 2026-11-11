<script lang="ts">
class B {
	m() {
		return 1;
	}
}

class K extends B {
	private constructor() {}
}

const r = new K().m();
</script>
<p>{r}</p>
