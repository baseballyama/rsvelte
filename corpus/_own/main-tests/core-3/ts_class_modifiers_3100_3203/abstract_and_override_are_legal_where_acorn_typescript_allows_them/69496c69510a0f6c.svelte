<script lang="ts">
	abstract class C {
		abstract a: number;
		abstract m(): void;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
