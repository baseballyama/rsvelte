<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import Icon from '$lib/components/Icon.svelte';
	import { Save } from '@lucide/svelte';
	import { quicklinksStore, type Quicklink } from '$lib/quicklinks.svelte';
	import MainLayout from './layout/MainLayout.svelte';
	import Header from './layout/Header.svelte';
	import ActionBar from './nodes/shared/ActionBar.svelte';
	import quicklinkIcon from '$lib/assets/quicklinks-package-1616x16@2x.png?inline';

	type AppInfo = {
		name: string;
		exec: string;
		icon_path?: string;
	};

	type Props = {
		quicklink?: Quicklink;
		onBack: () => void;
		onSave: () => void;
	};

	let { quicklink, onBack, onSave }: Props = $props();

	let name = $state(quicklink?.name ?? '');
	let link = $state(quicklink?.link ?? '');
	let application = $state(quicklink?.application ?? 'Default');
	let icon = $state(quicklink?.icon ?? 'link-16');

	let applications = $state<AppInfo[]>([]);
	let error = $state('');

	onMount(async () => {
		try {
			applications = (await invoke('get_installed_apps')) as AppInfo[];
		} catch (e) {
			console.error('Failed to fetch installed apps:', e);
		}
	});

	async function handleSave() {
		if (!name.trim()) {
			error = 'Name cannot be empty';
			return;
		}
		error = '';

		const data = {
			name,
			link,
			application: application === 'Default' ? undefined : application,
			icon: icon === 'link-16' ? undefined : icon
		};

		try {
			if (quicklink) {
				await quicklinksStore.update(quicklink.id, data);
			} else {
				await quicklinksStore.create(data);
			}
			onSave();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}
</script>

<MainLayout>
	{#snippet header()}
		<Header showBackButton={true} onPopView={onBack}>
			<div class="flex items-center gap-3 !pl-2.5">
				<Icon icon="link-16" class="size-6" />
				<h1 class="text-lg font-medium">{quicklink ? 'Edit Quicklink' : 'Create Quicklink'}</h1>
			</div>
		</Header>
	{/snippet}
	{#snippet content()}
		<div class="grow overflow-y-auto p-6">
			<div class="mx-auto max-w-xl space-y-6">
				<div class="grid grid-cols-[120px_1fr] items-center gap-4">
					<label for="name" class="text-right text-sm text-gray-400">Name</label>
					<Input id="name" placeholder="Quicklink name" bind:value={name} />
				</div>

				<div class="grid grid-cols-[120px_1fr] items-start gap-4">
					<label for="link" class="pt-2 text-right text-sm text-gray-400">Link</label>
					<div>
						<Textarea
							id="link"
							placeholder="https://google.com/search?q={'{argument}'}"
							bind:value={link}
						/>
						<p class="text-muted-foreground mt-1 text-xs">
							Include <span class="text-foreground font-mono">{'{argument}'}</span> for context like
							the selected or copied text in the link.
						</p>
					</div>
				</div>

				<div class="grid grid-cols-[120px_1fr] items-center gap-4">
					<label for="open-with" class="text-right text-sm text-gray-400">Open With</label>
					<Select.Root bind:value={application} type="single">
						<Select.Trigger id="open-with" class="w-full">
							{@const selectedApp = applications.find((a) => a.exec === application)}
							{selectedApp?.name ?? 'Default'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="Default">Default</Select.Item>
							{#each applications as app (app.exec)}
								<Select.Item value={app.exec}>{app.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="grid grid-cols-[120px_1fr] items-center gap-4">
					<label for="icon" class="text-right text-sm text-gray-400">Icon</label>
					<Input id="icon" placeholder="link-16" bind:value={icon} />
				</div>

				{#if error}
					<p class="text-center text-red-500">{error}</p>
				{/if}
			</div>
		</div>
	{/snippet}
	{#snippet footer()}
		<ActionBar icon={quicklinkIcon} title="Create Quicklink">
			{#snippet primaryAction({ props })}
				<Button {...props} onclick={handleSave}><Save class="mr-2 size-4" /> Save Quicklink</Button>
			{/snippet}
		</ActionBar>
	{/snippet}
</MainLayout>
