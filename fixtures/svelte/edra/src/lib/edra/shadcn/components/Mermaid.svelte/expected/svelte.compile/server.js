import * as $ from 'svelte/internal/server';
import { onMount, onDestroy, tick } from 'svelte';
import mermaid from 'mermaid';
import { Button } from '$lib/components/ui/button/index.js';
import * as Tabs from '$lib/components/ui/tabs/index.js';
import { cn } from '$lib/utils.js';
import Workflow from '@lucide/svelte/icons/workflow';
import Pencil from '@lucide/svelte/icons/pencil';
import Copy from '@lucide/svelte/icons/copy';
import Check from '@lucide/svelte/icons/check';
import Eye from '@lucide/svelte/icons/eye';
import Code from '@lucide/svelte/icons/code';
import Columns2 from '@lucide/svelte/icons/columns-2';
import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
import { NodeViewWrapper } from '../../tiptap/index.js';
import Tooltip from './Tooltip.svelte';
import { Download } from '@lucide/svelte';

export default function Mermaid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { node, editor, getPos } = $$props;

		// The committed code from the document
		const code = $.derived(() => node.textContent);

		// Local editing state
		let editCode = '';

		let isEditing = false;
		let mode = 'both';
		let copied = false;

		// Render state
		let container = null;

		let previewContainer = null;
		let error = null;
		let isRendering = false;

		// Debounce
		let debounceTimer;

		let renderCounter = 0;

		async function renderMermaid(target, source) {
			if (!target || !source.trim()) {
				if (target) target.innerHTML = '';

				error = null;

				return;
			}

			const thisRender = ++renderCounter;

			isRendering = true;

			const id = `mermaid-${crypto.randomUUID().slice(0, 8)}`;

			try {
				const { svg, bindFunctions } = await mermaid.render(id, source);

				// Stale check — discard if a newer render was triggered
				if (thisRender !== renderCounter) return;

				target.innerHTML = svg;
				bindFunctions?.(target);
				error = null;
			} catch(err) {
				if (thisRender !== renderCounter) return;

				error = err.message?.replace(/[\s\S]*?Syntax error in text[\s\S]*?mermaid version[\s\S]*$/m, '').trim() || err.message || 'Failed to render diagram';

				// Clean up mermaid's orphaned SVG
				document.getElementById(id)?.remove();
			} finally {
				if (thisRender === renderCounter) {
					isRendering = false;
				}
			}
		}

		function debouncedRender(target, source, delay = 400) {
			if (debounceTimer) clearTimeout(debounceTimer);

			debounceTimer = setTimeout(() => renderMermaid(target, source), delay);
		}

		// Render inline preview when code changes (not editing)
		// Render editor preview when editCode changes
		onMount(() => {
			if (container && code()) {
				renderMermaid(container, code());
			}
		});

		onDestroy(() => {
			if (debounceTimer) clearTimeout(debounceTimer);
		});

		function enterEditMode() {
			if (!editor.isEditable) return;

			editCode = code();
			isEditing = true;
			error = null;
		}

		function handleSave() {
			const trimmed = editCode.trim();

			if (!trimmed) {
				// Delete the node if empty
				editor.chain().focus().deleteRange({ from: getPos() ?? 0, to: (getPos() ?? 0) + node.nodeSize }).run();
			} else {
				editor.chain().focus().insertContentAt({ from: getPos() ?? 0, to: (getPos() ?? 0) + node.nodeSize }, { type: 'mermaid', content: [{ type: 'text', text: trimmed }] }).run();
			}

			isEditing = false;
		}

		function handleCancel() {
			isEditing = false;
			error = null;
		}

		function handleEditorKeydown(e) {
			if (e.key === 'Escape') {
				e.preventDefault();
				handleCancel();
			}

			if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
				e.preventDefault();
				handleSave();
			}

			// Prevent tiptap from handling Tab
			if (e.key === 'Tab') {
				e.preventDefault();

				const target = e.target;
				const start = target.selectionStart;
				const end = target.selectionEnd;

				editCode = editCode.substring(0, start) + '  ' + editCode.substring(end);

				tick().then(() => {
					target.selectionStart = target.selectionEnd = start + 2;
				});
			}
		}

		async function copyCode() {
			const source = isEditing ? editCode : code();

			if (!source) return;

			await navigator.clipboard.writeText(source);
			copied = true;
			setTimeout(() => copied = false, 2000);
		}

		function downloadImage() {
			const svgEl = container?.querySelector('svg');

			if (!svgEl) return;

			const svgString = new XMLSerializer().serializeToString(svgEl);
			const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
			const DOMURL = window.URL || window.webkitURL || window;
			const url = DOMURL.createObjectURL(svgBlob);
			const rect = svgEl.getBoundingClientRect();
			const viewBoxWidth = svgEl.viewBox?.baseVal?.width;
			const viewBoxHeight = svgEl.viewBox?.baseVal?.height;
			const width = viewBoxWidth && viewBoxWidth > 0 ? viewBoxWidth : rect.width || 800;
			const height = viewBoxHeight && viewBoxHeight > 0 ? viewBoxHeight : rect.height || 600;
			const dpr = window.devicePixelRatio || 1;
			const image = new Image();

			image.onload = () => {
				const canvas = document.createElement('canvas');

				canvas.width = width * dpr;
				canvas.height = height * dpr;

				const context = canvas.getContext('2d');

				if (!context) return;

				context.scale(dpr, dpr);

				// Fill white background
				context.fillRect(0, 0, width, height);

				context.drawImage(image, 0, 0, width, height);

				const pngUrl = canvas.toDataURL('image/png');
				const downloadLink = document.createElement('a');

				downloadLink.href = pngUrl;
				downloadLink.download = 'mermaid-diagram.png';
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
				DOMURL.revokeObjectURL(url);
			};

			image.src = url;
		}

		const lineCount = $.derived(() => (isEditing ? editCode : code())?.split('\n').length ?? 0);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			NodeViewWrapper($$renderer, {
				class: 'group relative my-4! flex w-full flex-col items-center overflow-hidden rounded-lg transition-all duration-200',
				contenteditable: false,
				children: ($$renderer) => {
					if (isEditing) {
						$$renderer.push(`<!--[0--><div class="flex h-112 w-full flex-col overflow-hidden rounded-lg border bg-background"><div class="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5"><div class="flex items-center gap-2">`);
						Workflow($$renderer, { class: 'size-3.5 text-primary' });
						$$renderer.push(`<!----> <span class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Mermaid</span> <span class="text-[10px] text-muted-foreground/50">${$.escape(lineCount())} lines</span></div> <div class="flex items-center gap-1">`);

						if (Tabs.Root) {
							$$renderer.push('<!--[-->');

							Tabs.Root($$renderer, {
								get value() {
									return mode;
								},

								set value($$value) {
									mode = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (Tabs.List) {
										$$renderer.push('<!--[-->');

										Tabs.List($$renderer, {
											children: ($$renderer) => {
												if (Tabs.Trigger) {
													$$renderer.push('<!--[-->');

													Tabs.Trigger($$renderer, {
														value: 'code',
														class: 'px-2 py-1',
														children: ($$renderer) => {
															Code($$renderer, {});
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Tabs.Trigger) {
													$$renderer.push('<!--[-->');

													Tabs.Trigger($$renderer, {
														value: 'both',
														class: 'px-2 py-1',
														children: ($$renderer) => {
															Columns2($$renderer, {});
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Tabs.Trigger) {
													$$renderer.push('<!--[-->');

													Tabs.Trigger($$renderer, {
														value: 'preview',
														class: 'px-2 py-1',
														children: ($$renderer) => {
															Eye($$renderer, {});
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

						$$renderer.push(` `);

						Button($$renderer, {
							size: 'icon-sm',
							variant: 'ghost',
							onclick: copyCode,
							title: 'Copy code',
							children: ($$renderer) => {
								if (copied) {
									$$renderer.push('<!--[0-->');
									Check($$renderer, { class: 'text-green-500' });
								} else {
									$$renderer.push('<!--[-1-->');
									Copy($$renderer, {});
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div class="mx-1 h-4 w-px bg-border"></div> `);

						Button($$renderer, {
							size: 'sm',
							variant: 'ghost',
							onclick: handleCancel,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Cancel`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							size: 'sm',
							onclick: handleSave,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Apply`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div> <div class="flex min-h-0 flex-1 overflow-hidden">`);

						if (mode === 'both' || mode === 'code') {
							$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn('relative min-h-0 flex-1', mode === 'both' ? 'border-r' : '')))}><textarea placeholder="graph TD
  A[Start] --> B[End]"${$.attr('spellcheck', false)} class="mermaid-code-editor size-full resize-none border-none bg-muted/20 p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40">`);

							const $$body = $.escape(editCode);

							if ($$body) {
								$$renderer.push(`${$$body}`);
							} else {}

							$$renderer.push(`</textarea> <div class="absolute right-2 bottom-2 flex items-center gap-2 text-[9px] text-muted-foreground/50"><span>⌘↵ Apply</span> <span>Esc Cancel</span></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (mode === 'both' || mode === 'preview') {
							$$renderer.push(`<!--[0--><div class="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-background p-6">`);

							if (error) {
								$$renderer.push(`<!--[0--><div class="flex max-w-xs flex-col items-center gap-2 text-center"><div class="flex size-8 items-center justify-center rounded-lg bg-destructive/10">`);
								TriangleAlert($$renderer, { class: 'size-4 text-destructive' });
								$$renderer.push(`<!----></div> <p class="text-xs font-medium text-destructive">Syntax Error</p> <p class="max-h-24 overflow-auto font-mono text-[10px] leading-relaxed text-muted-foreground">${$.escape(error)}</p></div>`);
							} else if (isRendering && !previewContainer?.innerHTML) {
								$$renderer.push(`<!--[1--><div class="flex flex-col items-center gap-2"><div class="size-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary"></div> <span class="text-[10px] text-muted-foreground">Rendering...</span></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(cn('mermaid-preview flex items-center justify-center [&_svg]:h-auto [&_svg]:max-w-full', error ? 'hidden' : '')))}></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="group/preview relative w-full">`);

						if (!code() || code().trim() === '') {
							$$renderer.push(`<!--[0--><button class="flex min-h-14 w-full items-center gap-2 rounded-lg border border-dashed bg-muted/30 p-4 transition-colors hover:bg-muted/50">`);
							Workflow($$renderer, { class: 'size-4 text-muted-foreground' });
							$$renderer.push(`<!----> <span class="text-sm text-muted-foreground"${$.attr('contenteditable', false)}>Click to add a Mermaid diagram</span></button>`);
						} else {
							$$renderer.push(`<!--[-1--><div class="overflow-hidden rounded-lg border"><div class="mermaid-container flex min-h-24 w-full items-center justify-center overflow-x-auto p-6 [&amp;_svg]:mx-auto [&amp;_svg]:h-auto [&amp;_svg]:max-w-full"></div> `);

							if (error) {
								$$renderer.push(`<!--[0--><div class="flex items-center gap-2 border-t bg-destructive/5 px-4 py-2">`);
								TriangleAlert($$renderer, { class: 'size-3.5 shrink-0 text-destructive' });
								$$renderer.push(`<!----> <p class="truncate text-xs text-destructive">${$.escape(error)}</p></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> `);

							if (editor.isEditable) {
								$$renderer.push(`<!--[0--><div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover/preview:opacity-100">`);

								Tooltip($$renderer, {
									tooltip: 'Download Image',
									children: ($$renderer) => {
										Button($$renderer, {
											size: 'icon-sm',
											variant: 'ghost',
											onclick: downloadImage,
											title: 'Download Image',
											children: ($$renderer) => {
												Download($$renderer, { class: 'text-muted-foreground' });
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Tooltip($$renderer, {
									tooltip: 'Copy Code',
									children: ($$renderer) => {
										Button($$renderer, {
											size: 'icon-sm',
											variant: 'ghost',
											onclick: copyCode,
											title: 'Copy code',
											children: ($$renderer) => {
												if (copied) {
													$$renderer.push('<!--[0-->');
													Check($$renderer, { class: ' text-green-500' });
												} else {
													$$renderer.push('<!--[-1-->');
													Copy($$renderer, { class: 'text-muted-foreground' });
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Tooltip($$renderer, {
									tooltip: 'Edit Mode',
									children: ($$renderer) => {
										Button($$renderer, {
											size: 'icon-sm',
											variant: 'ghost',
											onclick: enterEditMode,
											title: 'Edit diagram',
											children: ($$renderer) => {
												Pencil($$renderer, { class: 'text-muted-foreground' });
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]--></div>`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}