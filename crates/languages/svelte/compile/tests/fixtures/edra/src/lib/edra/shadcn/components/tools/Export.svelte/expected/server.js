import * as $ from 'svelte/internal/server';
import { buttonVariants } from '$lib/components/ui/button/button.svelte';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
import { getEditor } from '../../../tiptap/index.js';
import { ChevronDown, Download } from '@lucide/svelte';

export default function Export($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					if (DropdownMenu.Trigger) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Trigger($$renderer, {
							class: buttonVariants({ variant: 'ghost', size: 'icon' }),
							children: ($$renderer) => {
								Download($$renderer, {});
								$$renderer.push(`<!----> `);
								ChevronDown($$renderer, { class: 'size-2! text-muted-foreground' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (DropdownMenu.Portal) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Portal($$renderer, {
							children: ($$renderer) => {
								if (DropdownMenu.Content) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Content($$renderer, {
										children: ($$renderer) => {
											if (DropdownMenu.Label) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Label($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Export As`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (DropdownMenu.Item) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Item($$renderer, {
													onclick: () => handleExport('markdown'),
													children: ($$renderer) => {
														$$renderer.push(`<!---->Markdown`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (DropdownMenu.Item) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Item($$renderer, {
													onclick: () => handleExport('html'),
													children: ($$renderer) => {
														$$renderer.push(`<!---->HTML`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (DropdownMenu.Item) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Item($$renderer, {
													onclick: () => handleExport('json'),
													children: ($$renderer) => {
														$$renderer.push(`<!---->JSON`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}