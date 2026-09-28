<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdowns';
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button
				size="icon"
				variant="ghost"
				class="rounded-full shadow-none"
				aria-label="Open edit menu"
				{...props}
			>
				<Ellipsis size={16} aria-hidden="true" />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuItem>Option 1</DropdownMenuItem>
		<DropdownMenuItem>Option 2</DropdownMenuItem>
		<DropdownMenuItem>Option 3</DropdownMenuItem>
		<DropdownMenuItem>Option 4</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
