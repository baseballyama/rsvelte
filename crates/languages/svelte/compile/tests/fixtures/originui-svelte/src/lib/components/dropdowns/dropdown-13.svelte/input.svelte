<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Book from '@lucide/svelte/icons/book';
	import Info from '@lucide/svelte/icons/info';
	import LifeBuoy from '@lucide/svelte/icons/life-buoy';
	import MessageCircleMore from '@lucide/svelte/icons/message-circle-more';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuLabel,
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
				<Info size={16} aria-hidden="true" />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent class="pb-2">
		<DropdownMenuLabel>Need help?</DropdownMenuLabel>
		<DropdownMenuItem class="cursor-pointer py-1 focus:bg-transparent focus:underline">
			{#snippet child({ props })}
				<a href="#title" {...props}>
					<Book size={16} class="opacity-60" aria-hidden="true" />
					Documentation
				</a>
			{/snippet}
		</DropdownMenuItem>
		<DropdownMenuItem class="cursor-pointer py-1 focus:bg-transparent focus:underline">
			{#snippet child({ props })}
				<a href="#title" {...props}>
					<LifeBuoy size={16} class="opacity-60" aria-hidden="true" />
					Support
				</a>
			{/snippet}
		</DropdownMenuItem>
		<DropdownMenuItem class="cursor-pointer py-1 focus:bg-transparent focus:underline">
			{#snippet child({ props })}
				<a href="#title" {...props}>
					<MessageCircleMore size={16} class="opacity-60" aria-hidden="true" />
					Contact us
				</a>
			{/snippet}
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
