<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import CircleUserRound from '@lucide/svelte/icons/circle-user-round';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuGroup,
		DropdownMenuItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdowns';
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button size="icon" variant="outline" aria-label="Open account menu" {...props}>
				<CircleUserRound size={16} aria-hidden="true" />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent class="max-w-64">
		<DropdownMenuLabel class="flex flex-col">
			<span>Signed in as</span>
			<span class="text-foreground text-xs font-normal">k.kennedy@originui-svelte.com</span>
		</DropdownMenuLabel>
		<DropdownMenuSeparator />
		<DropdownMenuGroup>
			<DropdownMenuItem>Option 1</DropdownMenuItem>
			<DropdownMenuItem>Option 2</DropdownMenuItem>
			<DropdownMenuItem>Option 3</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuItem>Logout</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
