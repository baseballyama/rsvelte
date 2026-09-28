<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import Label from '$lib/components/ui/label.svelte';

	import ListFilter from '@lucide/svelte/icons/list-filter';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
</script>

<div class="flex flex-col gap-4">
	<Popover>
		<PopoverTrigger>
			{#snippet child({ props })}
				<Button variant="outline" size="icon" aria-label="Filters" {...props}>
					<ListFilter size={16} aria-hidden="true" />
				</Button>
			{/snippet}
		</PopoverTrigger>
		<PopoverContent class="w-36 p-3">
			<div class="space-y-3">
				<div class="text-muted-foreground text-xs font-medium">Filters</div>
				<form class="space-y-3">
					<div class="flex items-center gap-2">
						<Checkbox id="popover-filter-01" />
						<Label for="popover-filter-01" class="font-normal">Real Time</Label>
					</div>
					<div class="flex items-center gap-2">
						<Checkbox id="popover-filter-02" />
						<Label for="popover-filter-02" class="font-normal">Top Channels</Label>
					</div>
					<div class="flex items-center gap-2">
						<Checkbox id="popover-filter-03" />
						<Label for="popover-filter-03" class="font-normal">Last Orders</Label>
					</div>
					<div class="flex items-center gap-2">
						<Checkbox id="popover-filter-04" />
						<Label for="popover-filter-04" class="font-normal">Total Spent</Label>
					</div>
					<div
						role="separator"
						aria-orientation="horizontal"
						class="bg-border -mx-3 my-1 h-px"
					></div>
					<div class="flex justify-between gap-2">
						<Button size="sm" variant="outline" class="h-7 px-2">Clear</Button>
						<Button size="sm" class="h-7 px-2">Apply</Button>
					</div>
				</form>
			</div>
		</PopoverContent>
	</Popover>
</div>
