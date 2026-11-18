<script lang="ts">
	class B {
		m() {}
	}
	class C extends B {
		m() {
			class D {
				override q() {}
			}
			return D;
		}
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
