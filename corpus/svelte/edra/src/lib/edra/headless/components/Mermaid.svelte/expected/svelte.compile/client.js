import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy, tick } from 'svelte';
import mermaid from 'mermaid';
import { Tabs, TabsList, TabsTrigger } from '../primitives/tabs/index.ts';
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
  A[Start] --> B[End]" class="mermaid-code-editor svelte-1hxe4f8"></textarea> <div class="keyboard-hints svelte-1hxe4f8"><span>⌘↵ Apply</span> <span>Esc Cancel</span></div></div>`);

var root_2 = $.from_html(`<div class="error-box svelte-1hxe4f8"><div class="error-icon-wrapper svelte-1hxe4f8"><!></div> <p class="error-text svelte-1hxe4f8">Syntax Error</p> <p class="error-details svelte-1hxe4f8"> </p></div>`);
var root_3 = $.from_html(`<div class="loading-box svelte-1hxe4f8"><div class="loading-spinner svelte-1hxe4f8"></div> <span class="loading-text svelte-1hxe4f8">Rendering...</span></div>`);
var root_4 = $.from_html(`<div class="editor-panel-right svelte-1hxe4f8"><!> <div></div></div>`);
var root_5 = $.from_html(`<div class="edit-container svelte-1hxe4f8"><div class="toolbar-header svelte-1hxe4f8"><div class="header-left svelte-1hxe4f8"><!> <span class="header-title svelte-1hxe4f8">Mermaid</span> <span class="lines-count svelte-1hxe4f8"> </span></div> <div class="header-right svelte-1hxe4f8"><!> <button class="edra-btn edra-btn-ghost edra-btn-icon-xs" title="Copy code"><!></button> <div class="divider svelte-1hxe4f8"></div> <button class="edra-btn edra-btn-ghost btn-small svelte-1hxe4f8">Cancel</button> <button class="edra-btn edra-btn-primary btn-small svelte-1hxe4f8">Apply</button></div></div> <div class="editor-panels svelte-1hxe4f8"><!> <!></div></div>`);
var root_6 = $.from_html(`<button class="placeholder-button svelte-1hxe4f8"><!> <span class="placeholder-text svelte-1hxe4f8">Click to add a Mermaid diagram</span></button>`);
var root_7 = $.from_html(`<div class="rendered-error-footer svelte-1hxe4f8"><!> <p class="rendered-error-text svelte-1hxe4f8"> </p></div>`);
var root_8 = $.from_html(`<button class="edra-btn edra-btn-ghost edra-btn-icon-xs" title="Download Image"><!></button>`);
var root_9 = $.from_html(`<button class="edra-btn edra-btn-ghost edra-btn-icon-xs" title="Copy code"><!></button>`);
var root_10 = $.from_html(`<button class="edra-btn edra-btn-ghost edra-btn-icon-xs" title="Edit diagram"><!></button>`);
var root_11 = $.from_html(`<div class="hover-actions svelte-1hxe4f8"><!> <!> <!></div>`);
var root_12 = $.from_html(`<div class="rendered-card svelte-1hxe4f8"><div class="mermaid-container svelte-1hxe4f8"></div> <!></div> <!>`, 1);
var root_13 = $.from_html(`<div class="preview-box svelte-1hxe4f8"><!></div>`);

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
		class: 'mermaid-wrapper',
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

					Workflow(node_2, { class: 'workflow-icon text-ink' });

					var span = $.sibling(node_2, 4);
					var text = $.only_child(span);

					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var node_3 = $.child(div_3);

					Tabs(node_3, {
						get value() {
							return $.get(mode);
						},
						onValueChange: (val) => $.set(mode, val, true),
						children: ($$anchor, $$slotProps) => {
							TabsList($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_4 = $.first_child(fragment_3);

									TabsTrigger(node_4, {
										value: 'code',
										class: 'tab-btn',
										children: ($$anchor, $$slotProps) => {
											Code($$anchor, { class: 'tab-icon' });
										},
										$$slots: { default: true }
									});

									var node_5 = $.sibling(node_4, 2);

									TabsTrigger(node_5, {
										value: 'both',
										class: 'tab-btn',
										children: ($$anchor, $$slotProps) => {
											Columns2($$anchor, { class: 'tab-icon' });
										},
										$$slots: { default: true }
									});

									var node_6 = $.sibling(node_5, 2);

									TabsTrigger(node_6, {
										value: 'preview',
										class: 'tab-btn',
										children: ($$anchor, $$slotProps) => {
											Eye($$anchor, { class: 'tab-icon' });
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var button = $.sibling(node_3, 2);
					var node_7 = $.child(button);

					{
						var consequent = ($$anchor) => {
							Check($$anchor, { class: 'success-icon text-icon' });
						};

						var alternate = ($$anchor) => {
							Copy($$anchor, { class: 'text-icon' });
						};

						$.if(node_7, ($$render) => {
							if ($.get(copied)) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.reset(button);

					var button_1 = $.sibling(button, 4);
					var button_2 = $.sibling(button_1, 2);

					$.reset(div_3);
					$.reset(div_1);

					var div_4 = $.sibling(div_1, 2);
					var node_8 = $.child(div_4);

					{
						var consequent_1 = ($$anchor) => {
							var div_5 = root_1();
							var textarea = $.child(div_5);

							$.remove_textarea_child(textarea);
							$.set_attribute(textarea, 'spellcheck', false);
							$.next(2);
							$.reset(div_5);
							$.template_effect(() => $.set_class(div_5, 1, `editor-panel-left ${$.get(mode) === 'both' ? 'border-right-only' : ''}`, 'svelte-1hxe4f8'));
							$.delegated('keydown', textarea, handleEditorKeydown);
							$.bind_value(textarea, () => $.get(editCode), ($$value) => $.set(editCode, $$value));
							$.append($$anchor, div_5);
						};

						$.if(node_8, ($$render) => {
							if ($.get(mode) === 'both' || $.get(mode) === 'code') $$render(consequent_1);
						});
					}

					var node_9 = $.sibling(node_8, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_6 = root_4();
							var node_10 = $.child(div_6);

							{
								var consequent_2 = ($$anchor) => {
									var div_7 = root_2();
									var div_8 = $.child(div_7);
									var node_11 = $.child(div_8);

									TriangleAlert(node_11, { class: 'error-icon alert-icon-size' });
									$.reset(div_8);

									var p = $.sibling(div_8, 4);
									var text_1 = $.only_child(p, true);

									$.reset(div_7);
									$.template_effect(() => $.set_text(text_1, $.get(error)));
									$.append($$anchor, div_7);
								};

								var consequent_3 = ($$anchor) => {
									var div_9 = root_3();

									$.append($$anchor, div_9);
								};

								$.if(node_10, ($$render) => {
									if ($.get(error)) $$render(consequent_2); else if ($.get(isRendering)) $$render(consequent_3, 1);
								});
							}

							var div_10 = $.sibling(node_10, 2);

							$.bind_this(div_10, ($$value) => $.set(previewContainer, $$value), () => $.get(previewContainer));
							$.reset(div_6);
							$.template_effect(() => $.set_class(div_10, 1, `mermaid-preview ${$.get(error) ? 'hidden-element' : ''}`, 'svelte-1hxe4f8'));
							$.append($$anchor, div_6);
						};

						$.if(node_9, ($$render) => {
							if ($.get(mode) === 'both' || $.get(mode) === 'preview') $$render(consequent_4);
						});
					}

					$.reset(div_4);
					$.reset(div);
					$.template_effect(() => $.set_text(text, `${$.get(lineCount) ?? ''} lines`));
					$.delegated('click', button, copyCode);
					$.delegated('click', button_1, handleCancel);
					$.delegated('click', button_2, handleSave);
					$.append($$anchor, div);
				};

				var alternate_3 = ($$anchor) => {
					var div_11 = root_13();
					var node_12 = $.child(div_11);

					{
						var consequent_6 = ($$anchor) => {
							var button_3 = root_6();
							var node_13 = $.child(button_3);

							Workflow(node_13, { class: 'workflow-icon text-mute' });

							var span_1 = $.sibling(node_13, 2);

							$.set_attribute(span_1, 'contenteditable', false);
							$.reset(button_3);
							$.delegated('click', button_3, enterEditMode);
							$.append($$anchor, button_3);
						};

						var d = $.derived(() => !$.get(code) || $.get(code).trim() === '');

						var alternate_2 = ($$anchor) => {
							var fragment_9 = root_12();
							var div_12 = $.first_child(fragment_9);
							var div_13 = $.child(div_12);

							$.bind_this(div_13, ($$value) => $.set(container, $$value), () => $.get(container));

							var node_14 = $.sibling(div_13, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_14 = root_7();
									var node_15 = $.child(div_14);

									TriangleAlert(node_15, { class: 'error-icon alert-icon-size' });

									var p_1 = $.sibling(node_15, 2);
									var text_2 = $.only_child(p_1, true);

									$.reset(div_14);
									$.template_effect(() => $.set_text(text_2, $.get(error)));
									$.append($$anchor, div_14);
								};

								$.if(node_14, ($$render) => {
									if ($.get(error)) $$render(consequent_7);
								});
							}

							$.reset(div_12);

							var node_16 = $.sibling(div_12, 2);

							{
								var consequent_9 = ($$anchor) => {
									var div_15 = root_11();
									var node_17 = $.child(div_15);

									Tooltip(node_17, {
										tooltip: 'Download Image',
										children: ($$anchor, $$slotProps) => {
											var button_4 = root_8();
											var node_18 = $.child(button_4);

											Download(node_18, { class: 'text-icon' });
											$.reset(button_4);
											$.delegated('click', button_4, downloadImage);
											$.append($$anchor, button_4);
										},
										$$slots: { default: true }
									});

									var node_19 = $.sibling(node_17, 2);

									Tooltip(node_19, {
										tooltip: 'Copy Code',
										children: ($$anchor, $$slotProps) => {
											var button_5 = root_9();
											var node_20 = $.child(button_5);

											{
												var consequent_8 = ($$anchor) => {
													Check($$anchor, { class: 'success-icon text-icon' });
												};

												var alternate_1 = ($$anchor) => {
													Copy($$anchor, { class: 'text-icon' });
												};

												$.if(node_20, ($$render) => {
													if ($.get(copied)) $$render(consequent_8); else $$render(alternate_1, -1);
												});
											}

											$.reset(button_5);
											$.delegated('click', button_5, copyCode);
											$.append($$anchor, button_5);
										},
										$$slots: { default: true }
									});

									var node_21 = $.sibling(node_19, 2);

									Tooltip(node_21, {
										tooltip: 'Edit Mode',
										children: ($$anchor, $$slotProps) => {
											var button_6 = root_10();
											var node_22 = $.child(button_6);

											Pencil(node_22, { class: 'text-icon' });
											$.reset(button_6);
											$.delegated('click', button_6, enterEditMode);
											$.append($$anchor, button_6);
										},
										$$slots: { default: true }
									});

									$.reset(div_15);
									$.append($$anchor, div_15);
								};

								$.if(node_16, ($$render) => {
									if ($$props.editor.isEditable) $$render(consequent_9);
								});
							}

							$.append($$anchor, fragment_9);
						};

						$.if(node_12, ($$render) => {
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

$.delegate(['click', 'keydown']);