<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

	import IconStarFill from '~icons/ri/star-fill';

	let selectedValue = $state('all');
</script>

<RadioGroup bind:value={selectedValue}>
	<div class="flex items-center gap-2">
		<RadioGroupItem value="all" id="radio-06-all" />
		<Label for="radio-06-all">
			All reviews
			<span class="text-muted-foreground text-xs leading-[inherit] font-normal"> (12,921) </span>
		</Label>
	</div>
	<div class="flex items-center gap-2">
		<RadioGroupItem value="5-stars" id="radio-06-5-stars" />
		<Label for="radio-06-5-stars" class="inline-flex items-center gap-1">
			<span class="inline-flex items-center text-amber-500" aria-hidden="true">
				{#each Array.from({ length: 5 })}
					<IconStarFill width="16" height="16" aria-hidden="true" />
				{/each}
			</span>
			<span class="sr-only">5 stars</span>
			<span class="text-muted-foreground text-xs leading-[inherit] font-normal"> (5,168) </span>
		</Label>
	</div>
	<div class="flex items-center gap-2">
		<RadioGroupItem value="4-stars" id="radio-06-4-stars" />
		<Label for="radio-06-4-stars" class="inline-flex items-center gap-1">
			<span class="inline-flex items-center text-amber-500" aria-hidden="true">
				{#each Array.from({ length: 4 })}
					<IconStarFill width="16" height="16" aria-hidden="true" />
				{/each}
				<IconStarFill width="16" height="16" aria-hidden="true" class="opacity-30" />
			</span>
			<span class="sr-only">4 stars</span>
			<span class="text-muted-foreground text-xs leading-[inherit] font-normal"> (4,726) </span>
		</Label>
	</div>
	<div class="flex items-center gap-2">
		<RadioGroupItem value="3-stars" id="radio-06-3-stars" />
		<Label for="radio-06-3-stars" class="inline-flex items-center gap-1">
			<span class="inline-flex items-center text-amber-500" aria-hidden="true">
				{#each Array.from({ length: 3 })}
					<IconStarFill width="16" height="16" aria-hidden="true" />
				{/each}
				{#each Array.from({ length: 2 })}
					<IconStarFill width="16" height="16" aria-hidden="true" class="opacity-30" />
				{/each}
			</span>
			<span class="sr-only">3 stars</span>
			<span class="text-muted-foreground text-xs leading-[inherit] font-normal"> (3,234) </span>
		</Label>
	</div>
	<div class="flex items-center gap-2">
		<RadioGroupItem value="2-stars" id="radio-06-2-stars" />
		<Label for="radio-06-2-stars" class="inline-flex items-center gap-1">
			<span class="inline-flex items-center text-amber-500" aria-hidden="true">
				{#each Array.from({ length: 2 })}
					<IconStarFill width="16" height="16" aria-hidden="true" />
				{/each}
				{#each Array.from({ length: 3 })}
					<IconStarFill width="16" height="16" aria-hidden="true" class="opacity-30" />
				{/each}
			</span>
			<span class="sr-only">2 stars</span>
			<span class="text-muted-foreground text-xs leading-[inherit] font-normal"> (1,842) </span>
		</Label>
	</div>
	<div class="flex items-center gap-2">
		<RadioGroupItem value="1-star" id="radio-06-1-star" />
		<Label for="radio-06-1-star" class="inline-flex items-center gap-1">
			<span class="inline-flex items-center text-amber-500" aria-hidden="true">
				<IconStarFill width="16" height="16" aria-hidden="true" />
				{#each Array.from({ length: 4 })}
					<IconStarFill width="16" height="16" aria-hidden="true" class="opacity-30" />
				{/each}
			</span>
			<span class="sr-only">1 star</span>
			<span class="text-muted-foreground text-xs leading-[inherit] font-normal">(452)</span>
		</Label>
	</div>
</RadioGroup>
