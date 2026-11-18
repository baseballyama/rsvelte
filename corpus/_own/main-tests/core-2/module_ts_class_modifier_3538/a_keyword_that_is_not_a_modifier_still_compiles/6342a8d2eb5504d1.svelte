<script lang="ts">
class B {
	m() {
		return 1;
	}
}

class K extends B {
	async m() {}
}

const r = new K().m();
</script>
<p>{r}</p>
