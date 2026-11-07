<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group/index.js';

	import AlignCenter from '@lucide/svelte/icons/align-center';
	import AlignJustify from '@lucide/svelte/icons/align-justify';
	import AlignLeft from '@lucide/svelte/icons/align-left';
	import AlignRight from '@lucide/svelte/icons/align-right';

	let value = $state('center');
</script>

<ToggleGroup class="divide-background inline-flex divide-x" type="single" bind:value>
	<ToggleGroupItem
		class="bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
		aria-label="Align Left"
		value="left"
	>
		<AlignLeft size={16} aria-hidden="true" />
	</ToggleGroupItem>
	<ToggleGroupItem
		class="bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
		aria-label="Align Center"
		value="center"
	>
		<AlignCenter size={16} aria-hidden="true" />
	</ToggleGroupItem>
	<ToggleGroupItem
		class="bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
		aria-label="Align Right"
		value="right"
	>
		<AlignRight size={16} aria-hidden="true" />
	</ToggleGroupItem>
	<ToggleGroupItem
		class="bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
		aria-label="Align Justify"
		value="justify"
	>
		<AlignJustify size={16} aria-hidden="true" />
	</ToggleGroupItem>
</ToggleGroup>
