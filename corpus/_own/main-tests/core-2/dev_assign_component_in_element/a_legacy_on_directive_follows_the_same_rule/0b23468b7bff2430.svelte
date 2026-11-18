<script>
	import Foo from './Foo.svelte';
	let obj = $state({ p: 0 });
</script>
<Foo on:x={(e) => (obj.p = e.v)} />
