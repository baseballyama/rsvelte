<script lang="ts">
	const src = { x: 1 };
	const obj: any = {};
	({ x: obj!.x } = src);
	console.log(obj);
</script>

<p>ok</p>
