<script lang="ts">
	class B {
		m() {}
	}
	class C extends B {
		override m() {}
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
