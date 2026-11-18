<script>
	import Comp from './01-direct-literals.svelte';
</script>

<Comp on:click={{ a: 1 }} />
<Comp onclick={'s'} />
<Comp onCustom={[1]} />
