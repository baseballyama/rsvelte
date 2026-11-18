<script lang="ts">
	let o: any = {};
	let { a, x: { $permissions: permissions } } = o;
</script>
<p>{permissions}</p>