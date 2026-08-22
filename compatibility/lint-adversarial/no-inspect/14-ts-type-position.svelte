<script lang="ts">
	type $inspect = number;
	let v: $inspect = 1;
	const w = v as $inspect;
	void w;
</script>
<p>{v}</p>
