import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '$lib/components/ui/button';
import Icon from '$lib/components/Icon.svelte';
import { ArrowLeft, CheckCircle, Info, ArrowRight, Loader2 } from '@lucide/svelte';
import ActionBar from '$lib/components/nodes/shared/ActionBar.svelte';
import { onMount } from 'svelte';
import snippetIcon from '$lib/assets/snippets-package-1616x16@2x.png?inline';

var root = $.from_html(`<p class="mb-4 text-lg text-white/70">Learn more about supported JSON format <a href="https://manual.raycast.com/snippets/how-to-import-snippets" class="font-medium text-white hover:underline">here</a>.</p>`);
var root_1 = $.from_html(`<p class="mb-4 text-lg text-white/70">Importing snippets...</p>`);
var root_2 = $.from_html(`<div class="flex items-center gap-2"><!> <span> </span></div>`);
var root_3 = $.from_html(`<div class="my-4 space-y-3 text-left text-sm"><div class="flex items-center gap-2"><!> <span> </span></div> <!></div>`);
var root_4 = $.from_html(`<p class="my-4 max-w-md text-red-400"> </p>`);
var root_5 = $.from_html(`Go to Search Snippets <!>`, 1);
var root_6 = $.from_html(`<!> `, 1);
var root_7 = $.from_html(`<div class="text-foreground flex h-screen flex-col"><header class="absolute top-4 left-4 z-10"><!></header> <div class="flex flex-1 flex-col items-center justify-center p-6 text-center text-white"><div class="relative mb-2 flex h-20 w-20 items-center justify-center"><div class="absolute z-10 flex size-14 items-center justify-center rounded-[22px]"><!></div></div> <h1 class="mb-2 text-4xl font-bold">Import Snippets</h1> <!> <!> <!></div> <!></div>`);

export default function ImportSnippets($$anchor, $$props) {
	$.push($$props, true);

	let snippetsToImport = $.prop($$props, 'snippetsToImport', 3, null);
	let importState = $.state('idle');
	let result = $.state(null);
	let error = $.state(null);

	async function importFromData(snippets) {
		try {
			$.set(importState, 'importing');
			$.set(error, null);

			const jsonContent = JSON.stringify(snippets);
			const importResult = await invoke('import_snippets', { jsonContent });

			$.set(result, importResult, true);
			$.set(importState, 'result');
		} catch(e) {
			const err = e instanceof Error ? e.message : String(e);

			$.set(
				error,
				err.startsWith('Command import_snippets failed:')
					? err.substring(('Command import_snippets failed:').length).trim()
					: err,
				true
			);

			$.set(importState, 'error');
		}
	}

	async function selectAndImportFile() {
		try {
			const selected = await open({
				multiple: false,
				filters: [{ name: 'JSON', extensions: ['json'] }]
			});

			if (typeof selected === 'string') {
				$.set(importState, 'importing');
				$.set(error, null);

				const jsonContent = await readTextFile(selected);
				const importResult = await invoke('import_snippets', { jsonContent });

				$.set(result, importResult, true);
				$.set(importState, 'result');
			}
		} catch(e) {
			const err = e instanceof Error ? e.message : String(e);

			$.set(
				error,
				err.startsWith('Command import_snippets failed:')
					? err.substring(('Command import_snippets failed:').length).trim()
					: err,
				true
			);

			$.set(importState, 'error');
		}
	}

	onMount(() => {
		if (snippetsToImport() && snippetsToImport().length > 0) {
			importFromData(snippetsToImport());
		}
	});

	var div = root_7();
	var header = $.child(div);
	var node = $.child(header);

	Button(node, {
		variant: 'ghost',
		size: 'icon',
		class: 'rounded-full text-white/80',
		get onclick() {
			return $$props.onBack;
		},

		children: ($$anchor, $$slotProps) => {
			ArrowLeft($$anchor, { class: 'size-5' });
		},
		$$slots: { default: true }
	});

	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);

	$.set_style(div_3, '', {}, { 'background-color': '#F94144' });

	var node_1 = $.child(div_3);

	Icon(node_1, { icon: 'snippets-16', class: 'size-8 text-white' });
	$.reset(div_3);
	$.reset(div_2);

	var node_2 = $.sibling(div_2, 4);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(importState) === 'idle' && !snippetsToImport()) $$render(consequent); else if ($.get(importState) === 'importing') $$render(consequent_1, 1);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_4 = root_3();
			var div_5 = $.child(div_4);
			var node_4 = $.child(div_5);

			CheckCircle(node_4, { class: 'size-4 text-green-400' });

			var span = $.sibling(node_4, 2);
			var text = $.only_child(span);

			$.reset(div_5);

			var node_5 = $.sibling(div_5, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_6 = root_2();
					var node_6 = $.child(div_6);

					Info(node_6, { class: 'size-4 text-gray-400' });

					var span_1 = $.sibling(node_6, 2);
					var text_1 = $.only_child(span_1);

					$.reset(div_6);
					$.template_effect(() => $.set_text(text_1, `${$.get(result).duplicatesSkipped ?? ''} duplicates skipped`));
					$.append($$anchor, div_6);
				};

				$.if(node_5, ($$render) => {
					if ($.get(result).duplicatesSkipped > 0) $$render(consequent_2);
				});
			}

			$.reset(div_4);
			$.template_effect(() => $.set_text(text, `${$.get(result).snippetsAdded ?? ''} snippets added`));
			$.append($$anchor, div_4);
		};

		$.if(node_3, ($$render) => {
			if ($.get(importState) === 'result' && $.get(result)) $$render(consequent_3);
		});
	}

	var node_7 = $.sibling(node_3, 2);

	{
		var consequent_4 = ($$anchor) => {
			var p_2 = root_4();
			var text_2 = $.only_child(p_2, true);

			$.template_effect(() => $.set_text(text_2, $.get(error)));
			$.append($$anchor, p_2);
		};

		$.if(node_7, ($$render) => {
			if ($.get(importState) === 'error') $$render(consequent_4);
		});
	}

	$.reset(div_1);

	var node_8 = $.sibling(div_1, 2);

	{
		const primaryAction = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_9 = $.first_child(fragment_1);

			{
				var consequent_5 = ($$anchor) => {
					Button($$anchor, {
						class: 'bg-white/10 text-white hover:bg-white/20',
						onclick: () => {
							$$props.onBack();
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_3 = root_5();
							var node_10 = $.sibling($.first_child(fragment_3));

							ArrowRight(node_10, { class: 'ml-2 size-4' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				var consequent_6 = ($$anchor) => {
					Button($$anchor, {
						class: 'bg-white/10 text-white hover:bg-white/20',
						onclick: () => {
							if (snippetsToImport()) {
								importFromData(snippetsToImport());
							} else {
								$.set(importState, 'idle');
								$.set(error, null);
							}
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Try Again');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(importState) === 'importing' || !!snippetsToImport());

						Button($$anchor, {
							class: 'bg-white/10 text-white hover:bg-white/20',
							onclick: selectAndImportFile,
							get disabled() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_6();
								var node_11 = $.first_child(fragment_6);

								{
									var consequent_7 = ($$anchor) => {
										Loader2($$anchor, { class: 'mr-2 size-4 animate-spin' });
									};

									$.if(node_11, ($$render) => {
										if ($.get(importState) === 'importing') $$render(consequent_7);
									});
								}

								var text_4 = $.sibling(node_11);

								$.template_effect(() => $.set_text(text_4, ` ${$.get(importState) === 'importing' ? 'Importing...' : 'Select File'}`));
								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					}
				};

				$.if(node_9, ($$render) => {
					if ($.get(importState) === 'result') $$render(consequent_5); else if ($.get(importState) === 'error') $$render(consequent_6, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		ActionBar(node_8, {
			title: 'Import Snippets',
			get icon() {
				return snippetIcon;
			},
			primaryAction,
			$$slots: { primaryAction: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}