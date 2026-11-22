<script lang="ts">
	import Comp from './Comp.svelte';
	function f(node: Element, p: { d: number }) { return {}; }
	function g(node: Element, m: any, p: { d: number }) { return {}; }
</script>

<Comp style:color={1}>x</Comp>
<Comp transition:f={{ d: 's' }}>x</Comp>
<Comp in:f>x</Comp>
<Comp animate:g={{ d: 's' }}>x</Comp>
