<script lang="ts">
	import Button from '../ui/button.svelte';

	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import { AppToggle, TeamSwitcher } from '$lib/components/_extras/navbars';
	const teams = ['Acme Inc.', 'Origin UI - Svelte', 'Junon'];
</script>

<header class="border-b px-4 md:px-6">
	<div class="flex h-16 items-center justify-between gap-4">
		<!-- Left side -->
		<div class="flex flex-1 items-center gap-2">
			<TeamSwitcher {teams} defaultTeam={teams[0]} />
		</div>
		<!-- Middle area -->
		<AppToggle />
		<!-- Right side -->
		<div class="flex flex-1 items-center justify-end gap-2">
			<Button size="sm" variant="ghost" class="aspect-square text-sm max-sm:p-0">
				<UploadIcon class="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
				<span class="max-sm:sr-only">Export</span>
			</Button>
			<Button size="sm" class="aspect-square text-sm max-sm:p-0">
				<SparklesIcon class="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
				<span class="max-sm:sr-only">Upgrade</span>
			</Button>
		</div>
	</div>
</header>
