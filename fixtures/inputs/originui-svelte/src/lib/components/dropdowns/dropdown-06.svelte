<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import {
		DropdownMenu,
		DropdownMenuCheckboxItem,
		DropdownMenuContent,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdowns';

	let sveltekit = $state(true);
	let remix = $state(false);
	let nextjs = $state(false);
	let astro = $state(true);
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button variant="outline" {...props}>
				Checkbox items
				<ChevronDown class="-me-1 opacity-60" size={16} aria-hidden="true" />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuCheckboxItem
			checked={sveltekit}
			onCheckedChange={(checked) => (sveltekit = checked)}
		>
			SvelteKit
		</DropdownMenuCheckboxItem>
		<DropdownMenuCheckboxItem checked={nextjs} onCheckedChange={(checked) => (nextjs = checked)}>
			Next.js
		</DropdownMenuCheckboxItem>
		<DropdownMenuCheckboxItem
			checked={remix}
			onCheckedChange={(checked) => (remix = checked)}
			disabled
		>
			Remix
		</DropdownMenuCheckboxItem>
		<DropdownMenuCheckboxItem checked={astro} onCheckedChange={(checked) => (astro = checked)}>
			Astro
		</DropdownMenuCheckboxItem>
	</DropdownMenuContent>
</DropdownMenu>
