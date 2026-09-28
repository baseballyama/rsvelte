<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuGroup,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuShortcut,
		DropdownMenuSub,
		DropdownMenuSubContent,
		DropdownMenuSubTrigger,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdowns';
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button variant="outline" {...props}>
				Rich menu
				<ChevronDown class="-me-1 opacity-60" size={16} aria-hidden="true" />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuGroup>
			<DropdownMenuItem>
				<span>Edit</span>
				<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<span>Duplicate</span>
				<DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
			</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuGroup>
			<DropdownMenuItem>
				<span>Archive</span>
				<DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
			</DropdownMenuItem>
			<DropdownMenuSub>
				<DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
				<DropdownMenuSubContent>
					<DropdownMenuItem>Move to project</DropdownMenuItem>
					<DropdownMenuItem>Move to folder</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem>Advanced options</DropdownMenuItem>
				</DropdownMenuSubContent>
			</DropdownMenuSub>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuGroup>
			<DropdownMenuItem>Share</DropdownMenuItem>
			<DropdownMenuItem>Add to favorites</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuItem class="text-destructive focus:text-destructive">
			<span>Delete</span>
			<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
