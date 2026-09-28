<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import CircleFadingPlus from '@lucide/svelte/icons/circle-fading-plus';
	import FileInput from '@lucide/svelte/icons/file-input';
	import FolderPlus from '@lucide/svelte/icons/folder-plus';
	import Search from '@lucide/svelte/icons/search';
	import {
		CommandDialog,
		CommandEmpty,
		CommandGroup,
		CommandInput,
		CommandItem,
		CommandList,
		CommandSeparator,
		CommandShortcut
	} from '$lib/components/ui/command';

	let open = $state(false);

	const down = (e: KeyboardEvent) => {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	};
</script>

<svelte:window onkeydown={down} />

<button
	class="border-input bg-background text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/20 inline-flex h-9 w-fit rounded-lg border px-3 py-2 text-sm shadow-xs shadow-black/5 transition-shadow focus-visible:ring-[3px] focus-visible:outline-hidden"
	onclick={() => (open = true)}
>
	<span class="flex grow items-center">
		<Search class="text-muted-foreground/80 -ms-1 me-3" size={16} aria-hidden="true" />
		<span class="text-muted-foreground/70 font-normal">Search</span>
	</span>
	<kbd
		class="border-border bg-background text-muted-foreground/70 ms-12 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium"
	>
		⌘K
	</kbd>
</button>
<CommandDialog bind:open>
	<CommandInput placeholder="Type a command or search..." />
	<CommandList>
		<CommandEmpty>No results found.</CommandEmpty>
		<CommandGroup heading="Quick start">
			<CommandItem>
				<FolderPlus size={16} class="opacity-60" aria-hidden="true" />
				<span>New folder</span>
				<CommandShortcut class="justify-center">⌘N</CommandShortcut>
			</CommandItem>
			<CommandItem>
				<FileInput size={16} class="opacity-60" aria-hidden="true" />
				<span>Import document</span>
				<CommandShortcut class="justify-center">⌘I</CommandShortcut>
			</CommandItem>
			<CommandItem>
				<CircleFadingPlus size={16} class="opacity-60" aria-hidden="true" />
				<span>Add block</span>
				<CommandShortcut class="justify-center">⌘B</CommandShortcut>
			</CommandItem>
		</CommandGroup>
		<CommandSeparator />
		<CommandGroup heading="Navigation">
			<CommandItem>
				<ArrowUpRight size={16} class="opacity-60" aria-hidden="true" />
				<span>Go to dashboard</span>
			</CommandItem>
			<CommandItem>
				<ArrowUpRight size={16} class="opacity-60" aria-hidden="true" />
				<span>Go to apps</span>
			</CommandItem>
			<CommandItem>
				<ArrowUpRight size={16} class="opacity-60" aria-hidden="true" />
				<span>Go to connections</span>
			</CommandItem>
		</CommandGroup>
	</CommandList>
</CommandDialog>
