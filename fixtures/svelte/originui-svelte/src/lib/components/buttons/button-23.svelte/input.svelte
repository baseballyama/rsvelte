<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	let open = $state(false);

	function toggleOpen() {
		open = !open;
	}
</script>

<Button
	class="group"
	variant="outline"
	size="icon"
	onclick={toggleOpen}
	aria-expanded={open}
	aria-label={open ? 'Close menu' : 'Open menu'}
>
	<svg
		class="pointer-events-none"
		width={16}
		height={16}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M4 12L20 12"
			class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"
		/>
		<path
			d="M4 12H20"
			class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
		/>
		<path
			d="M4 12H20"
			class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
		/>
	</svg>
</Button>
