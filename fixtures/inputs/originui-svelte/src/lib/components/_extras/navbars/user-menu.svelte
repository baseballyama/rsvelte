<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import BoltIcon from '@lucide/svelte/icons/bolt';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import Layers2Icon from '@lucide/svelte/icons/layers-2';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import PinIcon from '@lucide/svelte/icons/pin';
	import UserPenIcon from '@lucide/svelte/icons/user-pen';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
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
			<Button variant="ghost" class="h-auto p-0 hover:bg-transparent" {...props}>
				<Avatar>
					<AvatarImage src="./avatar.jpg" alt="Profile image" />
					<AvatarFallback>KK</AvatarFallback>
				</Avatar>
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent class="max-w-64" align="end">
		<DropdownMenuLabel class="flex min-w-0 flex-col">
			<span class="text-foreground truncate text-sm font-medium"> Keith Kennedy </span>
			<span class="text-muted-foreground truncate text-xs font-normal">
				k.kennedy@originui-svelte.com
			</span>
		</DropdownMenuLabel>
		<DropdownMenuSeparator />
		<DropdownMenuGroup>
			<DropdownMenuItem>
				<BoltIcon size={16} class="opacity-60" aria-hidden="true" />
				<span>Option 1</span>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<Layers2Icon size={16} class="opacity-60" aria-hidden="true" />
				<span>Option 2</span>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<BookOpenIcon size={16} class="opacity-60" aria-hidden="true" />
				<span>Option 3</span>
			</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuGroup>
			<DropdownMenuItem>
				<PinIcon size={16} class="opacity-60" aria-hidden="true" />
				<span>Option 4</span>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<UserPenIcon size={16} class="opacity-60" aria-hidden="true" />
				<span>Option 5</span>
			</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuItem>
			<LogOutIcon size={16} class="opacity-60" aria-hidden="true" />
			<span>Logout</span>
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
