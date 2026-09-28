<script lang="ts">
	import { open } from '@tauri-apps/plugin-dialog';
	import { readTextFile } from '@tauri-apps/plugin-fs';
	import { invoke } from '@tauri-apps/api/core';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/Icon.svelte';
	import { ArrowLeft, CheckCircle, Info, ArrowRight, Loader2 } from '@lucide/svelte';
	import ActionBar from '$lib/components/nodes/shared/ActionBar.svelte';
	import { onMount } from 'svelte';
	import snippetIcon from '$lib/assets/snippets-package-1616x16@2x.png?inline';

	type SnippetToImport = {
		name: string;
		text: string;
		keyword: string;
	};

	type Props = {
		onBack: () => void;
		snippetsToImport?: SnippetToImport[] | null;
	};

	let { onBack, snippetsToImport = null }: Props = $props();

	type ImportResult = {
		snippetsAdded: number;
		duplicatesSkipped: number;
	};

	let importState: 'idle' | 'importing' | 'result' | 'error' = $state('idle');
	let result = $state<ImportResult | null>(null);
	let error = $state<string | null>(null);

	async function importFromData(snippets: SnippetToImport[]) {
		try {
			importState = 'importing';
			error = null;
			const jsonContent = JSON.stringify(snippets);
			const importResult = await invoke<ImportResult>('import_snippets', { jsonContent });
			result = importResult;
			importState = 'result';
		} catch (e) {
			const err = e instanceof Error ? e.message : String(e);
			error = err.startsWith('Command import_snippets failed:')
				? err.substring('Command import_snippets failed:'.length).trim()
				: err;

			importState = 'error';
		}
	}

	async function selectAndImportFile() {
		try {
			const selected = await open({
				multiple: false,
				filters: [{ name: 'JSON', extensions: ['json'] }]
			});
			if (typeof selected === 'string') {
				importState = 'importing';
				error = null;
				const jsonContent = await readTextFile(selected);
				const importResult = await invoke<ImportResult>('import_snippets', { jsonContent });
				result = importResult;
				importState = 'result';
			}
		} catch (e) {
			const err = e instanceof Error ? e.message : String(e);
			error = err.startsWith('Command import_snippets failed:')
				? err.substring('Command import_snippets failed:'.length).trim()
				: err;

			importState = 'error';
		}
	}

	onMount(() => {
		if (snippetsToImport && snippetsToImport.length > 0) {
			importFromData(snippetsToImport);
		}
	});
</script>

<div class="text-foreground flex h-screen flex-col">
	<header class="absolute top-4 left-4 z-10">
		<Button variant="ghost" size="icon" class="rounded-full text-white/80" onclick={onBack}>
			<ArrowLeft class="size-5" />
		</Button>
	</header>

	<div class="flex flex-1 flex-col items-center justify-center p-6 text-center text-white">
		<div class="relative mb-2 flex h-20 w-20 items-center justify-center">
			<div
				class="absolute z-10 flex size-14 items-center justify-center rounded-[22px]"
				style:background-color="#F94144"
			>
				<Icon icon="snippets-16" class="size-8 text-white" />
			</div>
		</div>
		<h1 class="mb-2 text-4xl font-bold">Import Snippets</h1>

		{#if importState === 'idle' && !snippetsToImport}
			<p class="mb-4 text-lg text-white/70">
				Learn more about supported JSON format <a
					href="https://manual.raycast.com/snippets/how-to-import-snippets"
					class="font-medium text-white hover:underline">here</a
				>.
			</p>
		{:else if importState === 'importing'}
			<p class="mb-4 text-lg text-white/70">Importing snippets...</p>
		{/if}

		{#if importState === 'result' && result}
			<div class="my-4 space-y-3 text-left text-sm">
				<div class="flex items-center gap-2">
					<CheckCircle class="size-4 text-green-400" />
					<span>{result.snippetsAdded} snippets added</span>
				</div>
				{#if result.duplicatesSkipped > 0}
					<div class="flex items-center gap-2">
						<Info class="size-4 text-gray-400" />
						<span>{result.duplicatesSkipped} duplicates skipped</span>
					</div>
				{/if}
			</div>
		{/if}

		{#if importState === 'error'}
			<p class="my-4 max-w-md text-red-400">{error}</p>
		{/if}
	</div>

	<ActionBar title="Import Snippets" icon={snippetIcon}>
		{#snippet primaryAction()}
			{#if importState === 'result'}
				<Button
					class="bg-white/10 text-white hover:bg-white/20"
					onclick={() => {
						onBack();
					}}
				>
					Go to Search Snippets
					<ArrowRight class="ml-2 size-4" />
				</Button>
			{:else if importState === 'error'}
				<Button
					class="bg-white/10 text-white hover:bg-white/20"
					onclick={() => {
						if (snippetsToImport) {
							importFromData(snippetsToImport);
						} else {
							importState = 'idle';
							error = null;
						}
					}}
				>
					Try Again
				</Button>
			{:else}
				<Button
					class="bg-white/10 text-white hover:bg-white/20"
					onclick={selectAndImportFile}
					disabled={importState === 'importing' || !!snippetsToImport}
				>
					{#if importState === 'importing'}
						<Loader2 class="mr-2 size-4 animate-spin" />
					{/if}
					{importState === 'importing' ? 'Importing...' : 'Select File'}
				</Button>
			{/if}
		{/snippet}
	</ActionBar>
</div>
