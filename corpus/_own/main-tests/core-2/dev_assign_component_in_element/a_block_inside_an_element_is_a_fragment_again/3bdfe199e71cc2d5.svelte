<script>
	import Foo from './Foo.svelte';
	let obj = $state({ p: 0 });
</script>
<div>{#if obj.p}<Foo onX={(e) => (obj.p = e.v)} />{/if}</div>
