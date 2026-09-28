import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);

var root_1 = $.from_html(`<div><textarea placeholder="graph TD
  A[Start] --> B[End]" class="mermaid-code-editor size-full resize-none border-none bg-muted/20 p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"></textarea> <div class="absolute right-2 bottom-2 flex items-center gap-2 text-[9px] text-muted-foreground/50"><span>⌘↵ Apply</span> <span>Esc Cancel</span></div></div>`);

var root_2 = $.from_html(`<div class="flex max-w-xs flex-col items-center gap-2 text-center"><div class="flex size-8 items-center justify-center rounded-lg bg-destructive/10"><!></div> <p class="text-xs font-medium text-destructive">Syntax Error</p> <p class="max-h-24 overflow-auto font-mono text-[10px] leading-relaxed text-muted-foreground"> </p></div>`);
var root_3 = $.from_html(`<div class="flex flex-col items-center gap-2"><div class="size-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary"></div> <span class="text-[10px] text-muted-foreground">Rendering...</span></div>`);
var root_4 = $.from_html(`<div class="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-background p-6"><!> <div></div></div>`);
var root_5 = $.from_html(`<div class="flex h-112 w-full flex-col overflow-hidden rounded-lg border bg-background"><div class="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5"><div class="flex items-center gap-2"><!> <span class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Mermaid</span> <span class="text-[10px] text-muted-foreground/50"> </span></div> <div class="flex items-center gap-1"><!> <!> <div class="mx-1 h-4 w-px bg-border"></div> <!> <!></div></div> <div class="flex min-h-0 flex-1 overflow-hidden"><!> <!></div></div>`);
var root_6 = $.from_html(`<button class="flex min-h-14 w-full items-center gap-2 rounded-lg border border-dashed bg-muted/30 p-4 transition-colors hover:bg-muted/50"><!> <span class="text-sm text-muted-foreground">Click to add a Mermaid diagram</span></button>`);
var root_7 = $.from_html(`<div class="flex items-center gap-2 border-t bg-destructive/5 px-4 py-2"><!> <p class="truncate text-xs text-destructive"> </p></div>`);
var root_8 = $.from_html(`<div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover/preview:opacity-100"><!> <!> <!></div>`);
var root_9 = $.from_html(`<div class="overflow-hidden rounded-lg border"><div class="mermaid-container flex min-h-24 w-full items-center justify-center overflow-x-auto p-6 [&amp;_svg]:mx-auto [&amp;_svg]:h-auto [&amp;_svg]:max-w-full"></div> <!></div> <!>`, 1);
var root_10 = $.from_html(`<div class="group/preview relative w-full"><!></div>`);

export default function Mermaid($$anchor, $$props) {
	$.push($$props, true);

	// The committed code from the document
	const code = $.derived(() => $$props.node.textContent);

	// Local editing state
	let editCode = $.state('');

	let isEditing = $.state(false);
	let mode = $.state('both');
	let copied = $.state(false);

	// Render state
	let container = $.state(null);

	let previewContainer = $.state(null);
	let error = $.state(null);
	let isRendering = $.state(false);

	// Debounce
	let debounceTimer;

	let renderCounter = 0;

	async function renderMermaid(target, source) {
		if (!target || !source.trim()) {
			if (target) target.innerHTML = '';

			$.set(error, null);

			return;
		}

		const thisRender = ++renderCounter;

		$.set(isRendering, true);

		const id = `mermaid-${crypto.randomUUID().slice(0, 8)}`;

		try {
			const { svg, bindFunctions } = await mermaid.render(id, source);

			// Stale check — discard if a newer render was triggered
			if (thisRender !== renderCounter) return;

			target.innerHTML = svg;
			bindFunctions?.(target);
			$.set(error, null);
		} catch(err) {
			if (thisRender !== renderCounter) return;

			$.set(error, err.message?.replace(/[\s\S]*?Syntax error in text[\s\S]*?mermaid version[\s\S]*$/m, '').trim() || err.message || 'Failed to render diagram', true);

			// Clean up mermaid's orphaned SVG
			document.getElementById(id)?.remove();
		} finally {
			if (thisRender === renderCounter) {
				$.set(isRendering, false);
			}
		}
	}

	function debouncedRender(target, source, delay = 400) {
		if (debounceTimer) clearTimeout(debounceTimer);

		debounceTimer = setTimeout(() => renderMermaid(target, source), delay);
	}

	// Render inline preview when code changes (not editing)
	$.user_effect(() => {
		if (!$.get(isEditing) && $.get(code) !== undefined && $.get(container)) {
			debouncedRender($.get(container), $.get(code), 300);
		}
	});

	// Render editor preview when editCode changes
	$.user_effect(() => {
		if ($.get(isEditing) && ($.get(mode) === 'both' || $.get(mode) === 'preview') && $.get(previewContainer) && $.get(editCode)) {
			debouncedRender($.get(previewContainer), $.get(editCode), 500);
		}
	});

	onMount(() => {
		if ($.get(container) && $.get(code)) {
			renderMermaid($.get(container), $.get(code));
		}
	});

	onDestroy(() => {
		if (debounceTimer) clearTimeout(debounceTimer);
	});

	function enterEditMode() {
		if (!$$props.editor.isEditable) return;

		$.set(editCode, $.get(code), true);
		$.set(isEditing, true);
		$.set(error, null);
	}

	function handleSave() {
		const trimmed = $.get(editCode).trim();

		if (!trimmed) {
			// Delete the node if empty
			$$props.editor.chain().focus().deleteRange({
				from: $$props.getPos() ?? 0,
				to: ($$props.getPos() ?? 0) + $$props.node.nodeSize
			}).run();
		} else {
			$$props.editor.chain().focus().insertContentAt(
				{
					from: $$props.getPos() ?? 0,
					to: ($$props.getPos() ?? 0) + $$props.node.nodeSize
				},
				{ type: 'mermaid', content: [{ type: 'text', text: trimmed }] }
			).run();
		}

		$.set(isEditing, false);
	}

	function handleCancel() {
		$.set(isEditing, false);
		$.set(error, null);
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

			$.set(editCode, $.get(editCode).substring(0, start) + '  ' + $.get(editCode).substring(end));

			tick().then(() => {
				target.selectionStart = target.selectionEnd = start + 2;
			});
		}
	}

	async function copyCode() {
		const source = $.get(isEditing) ? $.get(editCode) : $.get(code);

		if (!source) return;

		await navigator.clipboard.writeText(source);
		$.set(copied, true);
		setTimeout(() => $.set(copied, false), 2000);
	}

	function downloadImage() {
		const svgEl = $.get(container)?.querySelector('svg');

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

	const lineCount = $.derived(() => ($.get(isEditing) ? $.get(editCode) : $.get(code))?.split('\n').length ?? 0);

	NodeViewWrapper($$anchor, {
		class: 'group relative my-4! flex w-full flex-col items-center overflow-hidden rounded-lg transition-all duration-200',
		contenteditable: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_5 = ($$anchor) => {
					var div = root_5();
					var div_1 = $.child(div);
					var div_2 = $.child(div_1);
					var node_2 = $.child(div_2);

					Workflow(node_2, { class: 'size-3.5 text-primary' });

					var span = $.sibling(node_2, 4);
					var text = $.only_child(span);

					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var node_3 = $.child(div_3);

					$.component(node_3, () => Tabs.Root, ($$anchor, Tabs_Root) => {
						Tabs_Root($$anchor, {
							get value() {
								return $.get(mode);
							},

							set value($$value) {
								$.set(mode, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => Tabs.List, ($$anchor, Tabs_List) => {
									Tabs_List($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_5 = $.first_child(fragment_3);

											$.component(node_5, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
												Tabs_Trigger($$anchor, {
													value: 'code',
													class: 'px-2 py-1',
													children: ($$anchor, $$slotProps) => {
														Code($$anchor, {});
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
												Tabs_Trigger_1($$anchor, {
													value: 'both',
													class: 'px-2 py-1',
													children: ($$anchor, $$slotProps) => {
														Columns2($$anchor, {});
													},
													$$slots: { default: true }
												});
											});

											var node_7 = $.sibling(node_6, 2);

											$.component(node_7, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
												Tabs_Trigger_2($$anchor, {
													value: 'preview',
													class: 'px-2 py-1',
													children: ($$anchor, $$slotProps) => {
														Eye($$anchor, {});
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					var node_8 = $.sibling(node_3, 2);

					Button(node_8, {
						size: 'icon-sm',
						variant: 'ghost',
						onclick: copyCode,
						title: 'Copy code',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_9 = $.first_child(fragment_7);

							{
								var consequent = ($$anchor) => {
									Check($$anchor, { class: 'text-green-500' });
								};

								var alternate = ($$anchor) => {
									Copy($$anchor, {});
								};

								$.if(node_9, ($$render) => {
									if ($.get(copied)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_8, 4);

					Button(node_10, {
						size: 'sm',
						variant: 'ghost',
						onclick: handleCancel,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Cancel');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Button(node_11, {
						size: 'sm',
						onclick: handleSave,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Apply');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.reset(div_3);
					$.reset(div_1);

					var div_4 = $.sibling(div_1, 2);
					var node_12 = $.child(div_4);

					{
						var consequent_1 = ($$anchor) => {
							var div_5 = root_1();
							var textarea = $.child(div_5);

							$.remove_textarea_child(textarea);
							$.set_attribute(textarea, 'spellcheck', false);
							$.next(2);
							$.reset(div_5);

							$.template_effect(($0) => $.set_class(div_5, 1, $0), [
								() => $.clsx(cn('relative min-h-0 flex-1', $.get(mode) === 'both' ? 'border-r' : ''))
							]);

							$.delegated('keydown', textarea, handleEditorKeydown);
							$.bind_value(textarea, () => $.get(editCode), ($$value) => $.set(editCode, $$value));
							$.append($$anchor, div_5);
						};

						$.if(node_12, ($$render) => {
							if ($.get(mode) === 'both' || $.get(mode) === 'code') $$render(consequent_1);
						});
					}

					var node_13 = $.sibling(node_12, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_6 = root_4();
							var node_14 = $.child(div_6);

							{
								var consequent_2 = ($$anchor) => {
									var div_7 = root_2();
									var div_8 = $.child(div_7);
									var node_15 = $.child(div_8);

									TriangleAlert(node_15, { class: 'size-4 text-destructive' });
									$.reset(div_8);

									var p = $.sibling(div_8, 4);
									var text_3 = $.only_child(p, true);

									$.reset(div_7);
									$.template_effect(() => $.set_text(text_3, $.get(error)));
									$.append($$anchor, div_7);
								};

								var consequent_3 = ($$anchor) => {
									var div_9 = root_3();

									$.append($$anchor, div_9);
								};

								$.if(node_14, ($$render) => {
									if ($.get(error)) $$render(consequent_2); else if ($.get(isRendering) && !$.get(previewContainer)?.innerHTML) $$render(consequent_3, 1);
								});
							}

							var div_10 = $.sibling(node_14, 2);

							$.bind_this(div_10, ($$value) => $.set(previewContainer, $$value), () => $.get(previewContainer));
							$.reset(div_6);

							$.template_effect(($0) => $.set_class(div_10, 1, $0), [
								() => $.clsx(cn('mermaid-preview flex items-center justify-center [&_svg]:h-auto [&_svg]:max-w-full', $.get(error) ? 'hidden' : ''))
							]);

							$.append($$anchor, div_6);
						};

						$.if(node_13, ($$render) => {
							if ($.get(mode) === 'both' || $.get(mode) === 'preview') $$render(consequent_4);
						});
					}

					$.reset(div_4);
					$.reset(div);
					$.template_effect(() => $.set_text(text, `${$.get(lineCount) ?? ''} lines`));
					$.append($$anchor, div);
				};

				var alternate_3 = ($$anchor) => {
					var div_11 = root_10();
					var node_16 = $.child(div_11);

					{
						var consequent_6 = ($$anchor) => {
							var button = root_6();
							var node_17 = $.child(button);

							Workflow(node_17, { class: 'size-4 text-muted-foreground' });

							var span_1 = $.sibling(node_17, 2);

							$.set_attribute(span_1, 'contenteditable', false);
							$.reset(button);
							$.delegated('click', button, enterEditMode);
							$.append($$anchor, button);
						};

						var d = $.derived(() => !$.get(code) || $.get(code).trim() === '');

						var alternate_2 = ($$anchor) => {
							var fragment_10 = root_9();
							var div_12 = $.first_child(fragment_10);
							var div_13 = $.child(div_12);

							$.bind_this(div_13, ($$value) => $.set(container, $$value), () => $.get(container));

							var node_18 = $.sibling(div_13, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_14 = root_7();
									var node_19 = $.child(div_14);

									TriangleAlert(node_19, { class: 'size-3.5 shrink-0 text-destructive' });

									var p_1 = $.sibling(node_19, 2);
									var text_4 = $.only_child(p_1, true);

									$.reset(div_14);
									$.template_effect(() => $.set_text(text_4, $.get(error)));
									$.append($$anchor, div_14);
								};

								$.if(node_18, ($$render) => {
									if ($.get(error)) $$render(consequent_7);
								});
							}

							$.reset(div_12);

							var node_20 = $.sibling(div_12, 2);

							{
								var consequent_9 = ($$anchor) => {
									var div_15 = root_8();
									var node_21 = $.child(div_15);

									Tooltip(node_21, {
										tooltip: 'Download Image',
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												size: 'icon-sm',
												variant: 'ghost',
												onclick: downloadImage,
												title: 'Download Image',
												children: ($$anchor, $$slotProps) => {
													Download($$anchor, { class: 'text-muted-foreground' });
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_22 = $.sibling(node_21, 2);

									Tooltip(node_22, {
										tooltip: 'Copy Code',
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												size: 'icon-sm',
												variant: 'ghost',
												onclick: copyCode,
												title: 'Copy code',
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = $.comment();
													var node_23 = $.first_child(fragment_14);

													{
														var consequent_8 = ($$anchor) => {
															Check($$anchor, { class: ' text-green-500' });
														};

														var alternate_1 = ($$anchor) => {
															Copy($$anchor, { class: 'text-muted-foreground' });
														};

														$.if(node_23, ($$render) => {
															if ($.get(copied)) $$render(consequent_8); else $$render(alternate_1, -1);
														});
													}

													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_24 = $.sibling(node_22, 2);

									Tooltip(node_24, {
										tooltip: 'Edit Mode',
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												size: 'icon-sm',
												variant: 'ghost',
												onclick: enterEditMode,
												title: 'Edit diagram',
												children: ($$anchor, $$slotProps) => {
													Pencil($$anchor, { class: 'text-muted-foreground' });
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.reset(div_15);
									$.append($$anchor, div_15);
								};

								$.if(node_20, ($$render) => {
									if ($$props.editor.isEditable) $$render(consequent_9);
								});
							}

							$.append($$anchor, fragment_10);
						};

						$.if(node_16, ($$render) => {
							if ($.get(d)) $$render(consequent_6); else $$render(alternate_2, -1);
						});
					}

					$.reset(div_11);
					$.append($$anchor, div_11);
				};

				$.if(node_1, ($$render) => {
					if ($.get(isEditing)) $$render(consequent_5); else $$render(alternate_3, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['keydown', 'click']);