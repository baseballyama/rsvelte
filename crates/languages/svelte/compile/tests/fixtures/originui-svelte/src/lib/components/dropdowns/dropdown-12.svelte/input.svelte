<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Bolt from '@lucide/svelte/icons/bolt';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Layers2 from '@lucide/svelte/icons/layers-2';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Pin from '@lucide/svelte/icons/pin';
	import UserPen from '@lucide/svelte/icons/user-pen';
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
				<ChevronDown size={16} class="opacity-60" aria-hidden="true" />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent class="max-w-64">
		<DropdownMenuLabel class="flex min-w-0 flex-col">
			<span class="text-foreground truncate text-sm font-medium">Keith Kennedy</span>
			<span class="text-muted-foreground truncate text-xs font-normal">
				k.kennedy@originui-svelte.com
			</span>
		</DropdownMenuLabel>
		<DropdownMenuSeparator />
		<DropdownMenuGroup>
			<DropdownMenuItem>
				<Bolt size={16} class="opacity-60" aria-hidden="true" />
				<span>Option 1</span>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<Layers2 size={16} class="opacity-60" aria-hidden="true" />
				<span>Option 2</span>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<BookOpen size={16} class="opacity-60" aria-hidden="true" />
				<span>Option 3</span>
			</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuGroup>
			<DropdownMenuItem>
				<Pin size={16} class="opacity-60" aria-hidden="true" />
				<span>Option 4</span>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<UserPen size={16} class="opacity-60" aria-hidden="true" />
				<span>Option 5</span>
			</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuItem>
			<LogOut size={16} class="opacity-60" aria-hidden="true" />
			<span>Logout</span>
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
