<script lang="ts">
	const seen = new Set<string>(['a', 'b']);
	const list = [...seen].join(', ');
</script>

<p>{list}</p>
