<script lang="ts">
class B {
	m() {
		return 1;
	}
}

class K extends B {
	override
	a = 1;
}

const r = new K().m();
</script>
<p>{r}</p>
