<script lang="ts">
	let o: any = {};
	function f({ a, $permissions: permissions }: any) { return permissions; }
	let permissions = f(o);
</script>
<p>{permissions}</p>