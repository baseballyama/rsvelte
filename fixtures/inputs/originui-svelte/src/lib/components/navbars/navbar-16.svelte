<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Switch from '$lib/components/ui/switch.svelte';

	import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { InfoMenu, NotificationMenu, SettingsMenu } from '$lib/components/_extras/navbars';

	const id = $props.id();

	let checked = $state(false);
</script>

<header class="border-b px-4 md:px-6">
	<div class="flex h-16 items-center justify-between gap-4">
		<!-- Left side -->
		<div class="relative flex-1">
			<Input
				id={`input-${id}`}
				class="peer h-8 w-full max-w-xs ps-8 pe-2"
				placeholder="Search..."
				type="search"
			/>
			<div
				class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50"
			>
				<SearchIcon size={16} />
			</div>
		</div>
		<!-- Right side -->
		<div class="flex items-center gap-4">
			<!-- Test mode -->
			<div class="inline-flex items-center gap-2 max-md:hidden">
				<Label for="switch-{id}" class="text-sm font-medium">Test mode</Label>
				<Switch
					id="switch-{id}"
					{checked}
					onCheckedChange={(value) => (checked = value)}
					class="h-5 w-8 [&_span]:size-4 [&_span]:data-[state=checked]:translate-x-3 rtl:[&_span]:data-[state=checked]:-translate-x-3"
					aria-label="Toggle switch"
				/>
			</div>
			<div class="flex items-center gap-2">
				<!-- Layout button -->
				<Button
					size="icon"
					variant="ghost"
					class="text-muted-foreground size-8 rounded-full shadow-none"
					aria-label="Open layout menu"
				>
					<LayoutGridIcon size={16} aria-hidden="true" />
				</Button>
				<!-- Info menu -->
				<InfoMenu />
				<!-- Notification -->
				<NotificationMenu />
				<!-- Settings -->
				<SettingsMenu />
			</div>
			<!-- Add button -->
			<Button class="size-8 rounded-full" size="icon" aria-label="Add new item">
				<PlusIcon size={16} aria-hidden="true" />
			</Button>
		</div>
	</div>
</header>
