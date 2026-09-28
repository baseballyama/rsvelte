<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ArchiveRestore from '@lucide/svelte/icons/archive-restore';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Plus from '@lucide/svelte/icons/plus';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Trash from '@lucide/svelte/icons/trash';
	import {
		DropdownMenu,
		DropdownMenuCheckboxItem,
		DropdownMenuContent,
		DropdownMenuGroup,
		DropdownMenuItem,
		DropdownMenuRadioGroup,
		DropdownMenuRadioItem,
		DropdownMenuSeparator,
		DropdownMenuShortcut,
		DropdownMenuSub,
		DropdownMenuSubContent,
		DropdownMenuSubTrigger,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdowns';

	let framework = $state('sveltekit');
	let emailNotifications = $state(true);
	let pushNotifications = $state(false);
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button variant="outline" {...props}>
				Rich menu with icons
				<ChevronDown class="-me-1 opacity-60" size={16} aria-hidden="true" />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuGroup>
			<DropdownMenuItem>
				<Plus size={16} class="opacity-60" aria-hidden="true" />
				<span>New</span>
				<DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
			</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuGroup>
			<DropdownMenuSub>
				<DropdownMenuSubTrigger inset>Framework</DropdownMenuSubTrigger>

				<DropdownMenuSubContent>
					<DropdownMenuRadioGroup value={framework} onValueChange={(value) => (framework = value)}>
						<DropdownMenuRadioItem value="sveltekit">SvelteKit</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="nextjs" disabled>Next.js</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="remix">Remix</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="astro">Astro</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuSubContent>
			</DropdownMenuSub>
			<DropdownMenuSub>
				<DropdownMenuSubTrigger inset>Notifications</DropdownMenuSubTrigger>

				<DropdownMenuSubContent>
					<DropdownMenuCheckboxItem
						checked={emailNotifications}
						onCheckedChange={(checked) => (emailNotifications = checked)}
					>
						Email
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						checked={pushNotifications}
						onCheckedChange={(checked) => (pushNotifications = checked)}
					>
						Push
					</DropdownMenuCheckboxItem>
				</DropdownMenuSubContent>
			</DropdownMenuSub>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuGroup>
			<DropdownMenuItem>
				<Share2 size={16} class="opacity-60" aria-hidden="true" />
				<span>Share</span>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<ArchiveRestore size={16} class="opacity-60" aria-hidden="true" />
				<span>Archive</span>
			</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuItem class="text-destructive focus:text-destructive">
			<Trash size={16} aria-hidden="true" />
			<span>Delete</span>
			<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
