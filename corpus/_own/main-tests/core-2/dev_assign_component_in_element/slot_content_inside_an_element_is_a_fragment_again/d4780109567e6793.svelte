<script>
	import Foo from './Foo.svelte';
	let obj = $state({ p: 0 });
</script>
<div><Foo><Foo onX={(e) => (obj.p = e.v)} /></Foo></div>
