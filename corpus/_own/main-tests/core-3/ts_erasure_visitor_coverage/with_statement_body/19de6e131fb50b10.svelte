<script lang="ts">
	const o = { x: 1 };
	const y: any = 2;
	let x;
	with (o) { x = y as any; }
	console.log(x);
</script>

<p>ok</p>
