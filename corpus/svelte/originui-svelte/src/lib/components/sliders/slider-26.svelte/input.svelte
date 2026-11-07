<script module lang="ts">
	const items = [
		{ id: 1, price: 80 },
		{ id: 2, price: 95 },
		{ id: 3, price: 110 },
		{ id: 4, price: 125 },
		{ id: 5, price: 130 },
		{ id: 6, price: 140 },
		{ id: 7, price: 145 },
		{ id: 8, price: 150 },
		{ id: 9, price: 155 },
		{ id: 10, price: 165 },
		{ id: 11, price: 175 },
		{ id: 12, price: 185 },
		{ id: 13, price: 195 },
		{ id: 14, price: 205 },
		{ id: 15, price: 215 },
		{ id: 16, price: 225 },
		{ id: 17, price: 235 },
		{ id: 18, price: 245 },
		{ id: 19, price: 255 },
		{ id: 20, price: 260 },
		{ id: 21, price: 265 },
		{ id: 22, price: 270 },
		{ id: 23, price: 275 },
		{ id: 24, price: 280 },
		{ id: 25, price: 285 },
		{ id: 26, price: 290 },
		{ id: 27, price: 290 },
		{ id: 28, price: 295 },
		{ id: 29, price: 295 },
		{ id: 30, price: 295 },
		{ id: 31, price: 298 },
		{ id: 32, price: 299 },
		{ id: 33, price: 300 },
		{ id: 34, price: 305 },
		{ id: 35, price: 310 },
		{ id: 36, price: 315 },
		{ id: 37, price: 320 },
		{ id: 38, price: 325 },
		{ id: 39, price: 330 },
		{ id: 40, price: 335 },
		{ id: 41, price: 340 },
		{ id: 42, price: 345 },
		{ id: 43, price: 350 },
		{ id: 44, price: 355 },
		{ id: 45, price: 360 },
		{ id: 46, price: 365 },
		{ id: 47, price: 365 },
		{ id: 48, price: 375 },
		{ id: 49, price: 380 },
		{ id: 50, price: 385 },
		{ id: 51, price: 390 },
		{ id: 52, price: 395 },
		{ id: 53, price: 400 },
		{ id: 54, price: 405 },
		{ id: 55, price: 410 },
		{ id: 56, price: 415 },
		{ id: 57, price: 420 },
		{ id: 58, price: 425 },
		{ id: 59, price: 430 },
		{ id: 60, price: 435 },
		{ id: 61, price: 440 },
		{ id: 62, price: 445 },
		{ id: 63, price: 450 },
		{ id: 64, price: 455 },
		{ id: 65, price: 460 },
		{ id: 66, price: 465 },
		{ id: 67, price: 470 },
		{ id: 68, price: 475 },
		{ id: 69, price: 480 },
		{ id: 70, price: 485 },
		{ id: 71, price: 490 },
		{ id: 72, price: 495 },
		{ id: 73, price: 495 },
		{ id: 74, price: 498 },
		{ id: 75, price: 499 },
		{ id: 76, price: 500 },
		{ id: 77, price: 500 },
		{ id: 78, price: 500 },
		{ id: 79, price: 515 },
		{ id: 80, price: 530 },
		{ id: 81, price: 545 },
		{ id: 82, price: 560 },
		{ id: 83, price: 575 },
		{ id: 84, price: 590 },
		{ id: 85, price: 605 },
		{ id: 86, price: 620 },
		{ id: 87, price: 635 },
		{ id: 88, price: 650 },
		{ id: 89, price: 655 },
		{ id: 90, price: 660 },
		{ id: 91, price: 665 },
		{ id: 92, price: 670 },
		{ id: 93, price: 675 },
		{ id: 94, price: 680 },
		{ id: 95, price: 685 },
		{ id: 96, price: 690 },
		{ id: 97, price: 695 },
		{ id: 98, price: 700 },
		{ id: 99, price: 700 },
		{ id: 100, price: 700 },
		{ id: 101, price: 700 },
		{ id: 102, price: 700 },
		{ id: 103, price: 700 },
		{ id: 104, price: 725 },
		{ id: 105, price: 750 },
		{ id: 106, price: 775 },
		{ id: 107, price: 800 },
		{ id: 108, price: 815 },
		{ id: 109, price: 830 },
		{ id: 110, price: 845 },
		{ id: 111, price: 845 },
		{ id: 112, price: 845 },
		{ id: 113, price: 870 },
		{ id: 114, price: 875 },
		{ id: 115, price: 880 },
		{ id: 116, price: 885 },
		{ id: 117, price: 890 },
		{ id: 118, price: 895 },
		{ id: 119, price: 898 },
		{ id: 120, price: 900 }
	] as const;
</script>

<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';

	let value = $state([200, 780]);
	const itemsInRange = $derived(
		items.filter((item) => item.price >= value[0] && item.price <= value[1]).length
	);

	const tickCount = 40;

	const min = Math.min(...items.map((item) => item.price));
	const max = Math.max(...items.map((item) => item.price));
	const priceStep = (max - min) / tickCount;

	const itemCounts = Array.from({ length: tickCount }, (_, tick) => {
		const rangeMin = min + tick * priceStep;
		const rangeMax = min + (tick + 1) * priceStep;
		return items.filter((item) => item.price >= rangeMin && item.price < rangeMax).length;
	});
	const maxCount = Math.max(...itemCounts);

	function isBarInSelectedRange(index: number) {
		const rangeMin = min + index * priceStep;
		const rangeMax = min + (index + 1) * priceStep;
		return itemsInRange > 0 && rangeMin <= value[1] && rangeMax >= value[0];
	}

	function handleInputChange(e: Event & { currentTarget: HTMLInputElement }, index: number) {
		const v = parseFloat(e.currentTarget.value) || 0;
		if (index == 0 && v > value[1]) value = [value[1], value[1]];
		else if (index == 1 && v < value[0]) value = [value[0], value[0]];
		else value[index] = v;
	}
</script>

<div class="*:not-first:mt-4">
	<Label>Price slider</Label>
	<div>
		<div class="flex h-12 w-full items-end px-3" aria-hidden="true">
			{#each itemCounts as count, i (i)}
				<div class="flex flex-1 justify-center" style="height: {(count / maxCount) * 100}%">
					<span data-selected={isBarInSelectedRange(i)} class="bg-primary/20 h-full w-full"></span>
				</div>
			{/each}
		</div>
		<Slider bind:value {min} {max} aria-label="Price range" type="multiple" />
	</div>
	<div class="flex items-center justify-between gap-4">
		<div class="space-y-1">
			<Label for="min-price">Min price</Label>
			<div class="relative">
				<Input
					class="peer w-full ps-6"
					type="text"
					inputmode="decimal"
					onchange={(e) => handleInputChange(e, 0)}
					{min}
					max={value[1]}
					value={value[0]}
					aria-label="Enter minimum price"
				/>
				<span
					class="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50"
				>
					$
				</span>
			</div>
		</div>
		<div class="space-y-1">
			<Label for="max-price">Max price</Label>
			<div class="relative">
				<Input
					class="peer w-full ps-6"
					type="text"
					inputmode="decimal"
					onchange={(e) => handleInputChange(e, 1)}
					min={value[0]}
					{max}
					value={value[1]}
					aria-label="Enter maximum price"
				/>
				<span
					class="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50"
				>
					$
				</span>
			</div>
		</div>
	</div>
	<Button class="w-full" variant="outline">
		Show {itemsInRange} items
	</Button>
</div>
