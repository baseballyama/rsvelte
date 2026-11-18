<script lang="ts">
	abstract class C {
		m() {
			class D {
				abstract q: number;
			}
			return D;
		}
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
