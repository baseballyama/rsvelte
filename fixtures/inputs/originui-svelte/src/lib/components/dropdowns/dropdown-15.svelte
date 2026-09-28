<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Monitor from '@lucide/svelte/icons/monitor';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdowns';

	const systemPreference = 'light';

	let theme = $state('light');
	const displayTheme = $derived(theme === 'system' ? systemPreference : theme);
	const Icon = $derived.by(() => {
		if (displayTheme === 'light') return Sun;
		if (displayTheme === 'dark') return Moon;
	});
</script>

<div>
	<DropdownMenu>
		<DropdownMenuTrigger>
			{#snippet child({ props })}
				<Button size="icon" variant="outline" aria-label="Select theme" {...props}>
					<Icon size={16} aria-hidden="true" />
				</Button>
			{/snippet}
		</DropdownMenuTrigger>
		<DropdownMenuContent class="min-w-32">
			<DropdownMenuItem onSelect={() => (theme = 'light')}>
				<Sun size={16} class="opacity-60" aria-hidden="true" />
				<span>Light</span>
			</DropdownMenuItem>
			<DropdownMenuItem onSelect={() => (theme = 'dark')}>
				<Moon size={16} class="opacity-60" aria-hidden="true" />
				<span>Dark</span>
			</DropdownMenuItem>
			<DropdownMenuItem onSelect={() => (theme = 'system')}>
				<Monitor size={16} class="opacity-60" aria-hidden="true" />
				<span>System</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</div>
