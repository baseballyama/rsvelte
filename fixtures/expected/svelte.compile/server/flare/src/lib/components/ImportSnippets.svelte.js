import * as $ from 'svelte/internal/server';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '$lib/components/ui/button';
import Icon from '$lib/components/Icon.svelte';
import { ArrowLeft, CheckCircle, Info, ArrowRight, Loader2 } from '@lucide/svelte';
import ActionBar from '$lib/components/nodes/shared/ActionBar.svelte';
import { onMount } from 'svelte';
import snippetIcon from '$lib/assets/snippets-package-1616x16@2x.png?inline';

export default function ImportSnippets($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onBack, snippetsToImport = null } = $$props;
		let importState = 'idle';
		let result = null;
		let error = null;

		async function importFromData(snippets) {
			try {
				importState = 'importing';
				error = null;

				const jsonContent = JSON.stringify(snippets);
				const importResult = await invoke('import_snippets', { jsonContent });

				result = importResult;
				importState = 'result';
			} catch(e) {
				const err = e instanceof Error ? e.message : String(e);

				error = err.startsWith('Command import_snippets failed:')
					? err.substring(('Command import_snippets failed:').length).trim()
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
					const importResult = await invoke('import_snippets', { jsonContent });

					result = importResult;
					importState = 'result';
				}
			} catch(e) {
				const err = e instanceof Error ? e.message : String(e);

				error = err.startsWith('Command import_snippets failed:')
					? err.substring(('Command import_snippets failed:').length).trim()
					: err;

				importState = 'error';
			}
		}

		onMount(() => {
			if (snippetsToImport && snippetsToImport.length > 0) {
				importFromData(snippetsToImport);
			}
		});

		$$renderer.push(`<div class="text-foreground flex h-screen flex-col"><header class="absolute top-4 left-4 z-10">`);

		Button($$renderer, {
			variant: 'ghost',
			size: 'icon',
			class: 'rounded-full text-white/80',
			onclick: onBack,
			children: ($$renderer) => {
				ArrowLeft($$renderer, { class: 'size-5' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></header> <div class="flex flex-1 flex-col items-center justify-center p-6 text-center text-white"><div class="relative mb-2 flex h-20 w-20 items-center justify-center"><div class="absolute z-10 flex size-14 items-center justify-center rounded-[22px]"${$.attr_style('', { 'background-color': '#F94144' })}>`);
		Icon($$renderer, { icon: 'snippets-16', class: 'size-8 text-white' });
		$$renderer.push(`<!----></div></div> <h1 class="mb-2 text-4xl font-bold">Import Snippets</h1> `);

		if (importState === 'idle' && !snippetsToImport) {
			$$renderer.push(`<!--[0--><p class="mb-4 text-lg text-white/70">Learn more about supported JSON format <a href="https://manual.raycast.com/snippets/how-to-import-snippets" class="font-medium text-white hover:underline">here</a>.</p>`);
		} else if (importState === 'importing') {
			$$renderer.push(`<!--[1--><p class="mb-4 text-lg text-white/70">Importing snippets...</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (importState === 'result' && result) {
			$$renderer.push(`<!--[0--><div class="my-4 space-y-3 text-left text-sm"><div class="flex items-center gap-2">`);
			CheckCircle($$renderer, { class: 'size-4 text-green-400' });
			$$renderer.push(`<!----> <span>${$.escape(result.snippetsAdded)} snippets added</span></div> `);

			if (result.duplicatesSkipped > 0) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-2">`);
				Info($$renderer, { class: 'size-4 text-gray-400' });
				$$renderer.push(`<!----> <span>${$.escape(result.duplicatesSkipped)} duplicates skipped</span></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (importState === 'error') {
			$$renderer.push(`<!--[0--><p class="my-4 max-w-md text-red-400">${$.escape(error)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		{
			function primaryAction($$renderer) {
				if (importState === 'result') {
					$$renderer.push('<!--[0-->');

					Button($$renderer, {
						class: 'bg-white/10 text-white hover:bg-white/20',
						onclick: () => {
							onBack();
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Go to Search Snippets `);
							ArrowRight($$renderer, { class: 'ml-2 size-4' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				} else if (importState === 'error') {
					$$renderer.push('<!--[1-->');

					Button($$renderer, {
						class: 'bg-white/10 text-white hover:bg-white/20',
						onclick: () => {
							if (snippetsToImport) {
								importFromData(snippetsToImport);
							} else {
								importState = 'idle';
								error = null;
							}
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Try Again`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');

					Button($$renderer, {
						class: 'bg-white/10 text-white hover:bg-white/20',
						onclick: selectAndImportFile,
						disabled: importState === 'importing' || !!snippetsToImport,
						children: ($$renderer) => {
							if (importState === 'importing') {
								$$renderer.push('<!--[0-->');
								Loader2($$renderer, { class: 'mr-2 size-4 animate-spin' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> ${$.escape(importState === 'importing' ? 'Importing...' : 'Select File')}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			ActionBar($$renderer, {
				title: 'Import Snippets',
				icon: snippetIcon,
				primaryAction,
				$$slots: { primaryAction: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	});
}