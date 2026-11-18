<script lang="ts">
	const arr: any[] = [];
	const obj: any = {};
	[obj!.b = (1 as number)] = arr;
	console.log(obj);
</script>

<p>ok</p>
