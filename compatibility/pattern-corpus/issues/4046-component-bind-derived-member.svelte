<script>
	import Child from './Child.svelte';

	let checked = $state(false);

	function wrap() {
		return {
			get checked() {
				return checked;
			},
			set checked(v) {
				checked = v;
			}
		};
	}
</script>

{#if true}
	{@const obj = wrap()}
	<Child bind:checked={obj.checked} />
{/if}
