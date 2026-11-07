import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { buttonVariants } from '$lib/components/ui/button/button.svelte';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
import { getEditor } from '../../../tiptap/index.js';
import { ChevronDown, Download } from '@lucide/svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Export($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	const handleExport = (as) => {
		let text = '';
		let mimeType = '';
		let extension = '';

		switch (as) {
			case 'markdown':
				text = editor.getMarkdown();
				mimeType = 'text/markdown;charset=utf-8';
				extension = 'md';
				break;

			case 'html':
				text = editor.getHTML();
				mimeType = 'text/html;charset=utf-8';
				extension = 'html';
				break;

			case 'json':
				text = JSON.stringify(editor.getJSON(), null, 2);
				mimeType = 'application/json;charset=utf-8';
				extension = 'json';
				break;
		}

		// Try to find a title from the first heading, or use a default
		let filename = 'document';

		const firstNode = editor.state.doc.firstChild;

		if (firstNode && firstNode.type.name === 'heading') {
			const textContent = firstNode.textContent.trim();

			if (textContent) {
				filename = textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
			}
		}

		if (!filename) {
			filename = 'document';
		}

		const blob = new Blob([text], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${filename}.${extension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: 'ghost', size: 'icon' }));

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_2 = $.first_child(fragment_2);

								Download(node_2, {});

								var node_3 = $.sibling(node_2, 2);

								ChevronDown(node_3, { class: 'size-2! text-muted-foreground' });
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
					DropdownMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
											DropdownMenu_Label($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Export As');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
											DropdownMenu_Item($$anchor, {
												onclick: () => handleExport('markdown'),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Markdown');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
											DropdownMenu_Item_1($$anchor, {
												onclick: () => handleExport('html'),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('HTML');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
											DropdownMenu_Item_2($$anchor, {
												onclick: () => handleExport('json'),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('JSON');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}