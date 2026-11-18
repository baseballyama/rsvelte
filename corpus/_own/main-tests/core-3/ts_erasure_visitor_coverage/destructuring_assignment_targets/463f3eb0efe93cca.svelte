<script lang="ts">
	const arr = [1, 2];
	let a;
	const obj: any = {};
	[a, obj!.b] = arr;
	console.log(a, obj);
</script>

<p>ok</p>
