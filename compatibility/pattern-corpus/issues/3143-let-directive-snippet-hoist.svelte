<script>
	import C from './C.svelte';

	let n = $state(1);
</script>

{#snippet hoistable_let()}
	<C let:v><b>{v}</b></C>
{/snippet}

{#snippet hoistable_slot_let()}
	<C>
		<b slot="s" let:w>{w}</b>
	</C>
{/snippet}

{#snippet pinned_let()}
	<C let:v><b>{v}{n}</b></C>
{/snippet}

{@render hoistable_let()}
{@render hoistable_slot_let()}
{@render pinned_let()}
