<script>
	import Option from './Option.svelte';
	let { p, c } = $props();
</script>
<select>
	<svelte:boundary>
		<option>Boundary</option>
	</svelte:boundary>
</select>
<select {...p} class={c}>
	<Option />
</select>
<select {...p}>
	<option class={c} {...p}><b>{c}</b></option>
</select>
