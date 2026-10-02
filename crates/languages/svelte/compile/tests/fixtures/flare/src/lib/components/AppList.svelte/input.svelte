<script lang="ts">
	import Fuse from 'fuse.js';
	import Icon from '$lib/components/Icon.svelte';
	import { convertFileSrc } from '@tauri-apps/api/core';
	import { invoke } from '@tauri-apps/api/core';

	type App = {
		name: string;
		comment?: string;
		exec: string;
		icon_path?: string;
	};

	type Props = {
		apps: App[];
		searchText: string;
		selectedIndex: number;
		startIndex: number;
		onItemClick: (index: number) => void;
	};

	let { apps, searchText, selectedIndex, startIndex, onItemClick }: Props = $props();

	const fuse = $derived(
		new Fuse(apps, {
			keys: ['name', 'comment', 'exec'],
			threshold: 0.4
		})
	);

	const filteredApps = $derived.by(() => {
		if (!searchText) return apps;
		return fuse.search(searchText).map((result) => result.item);
	});

	export function getFilteredApps() {
		return filteredApps;
	}

	function handleClick(index: number) {
		const absoluteIndex = startIndex + index;
		onItemClick(absoluteIndex);
		const app = filteredApps[index];
		if (app && app.exec) {
			invoke('launch_app', { exec: app.exec }).catch(console.error);
		}
	}
</script>

{#each filteredApps as app, index (app.name)}
	{@const absoluteIndex = startIndex + index}
	<button
		type="button"
		class="hover:bg-accent/50 flex w-full items-center gap-3 px-4 py-2 text-left"
		class:bg-accent={selectedIndex === absoluteIndex}
		onclick={() => handleClick(index)}
	>
		<div class="flex size-5 shrink-0 items-center justify-center">
			{#if app.icon_path}
				<img src={convertFileSrc(app.icon_path)} alt="" class="size-4" />
			{:else}
				<Icon icon="app-window-16" class="size-4" />
			{/if}
		</div>
		<div class="flex flex-col">
			<span class="font-medium">{app.name}</span>
			<span class="text-muted-foreground text-sm">{app.comment || 'No description'}</span>
		</div>
		<span class="text-muted-foreground ml-auto text-xs whitespace-nowrap">System App</span>
	</button>
{/each}
