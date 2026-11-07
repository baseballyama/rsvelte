<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';

	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';

	const min = 0;
	const max = 200;
	const steps = 5;

	let value = $state(100);

	function decrement() {
		value -= steps;
	}

	function increment() {
		value += steps;
	}
</script>

<div class="*:not-first:mt-3">
	<Label class="tabular-nums">{value} credits/mo</Label>
	<div class="flex items-center gap-4">
		<div>
			<Button
				variant="outline"
				size="icon"
				class="size-8"
				aria-label="Decrease value"
				disabled={value === min}
				onclick={decrement}
			>
				<Minus size={16} aria-hidden="true" />
			</Button>
		</div>
		<Slider
			type="single"
			class="grow"
			bind:value
			{min}
			{max}
			step={steps}
			aria-label="Dual range slider with buttons"
		/>
		<div>
			<Button
				variant="outline"
				size="icon"
				class="size-8"
				aria-label="Increase value"
				disabled={value === max}
				onclick={increment}
			>
				<Plus size={16} aria-hidden="true" />
			</Button>
		</div>
	</div>
</div>
