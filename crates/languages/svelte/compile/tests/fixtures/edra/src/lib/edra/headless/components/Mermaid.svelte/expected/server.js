import * as $ from 'svelte/internal/server';
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

		NodeViewWrapper($$renderer, {
			class: 'mermaid-wrapper',
			contenteditable: false,
			children: ($$renderer) => {
				if (isEditing) {
					$$renderer.push(`<!--[0--><div class="edit-container svelte-1hxe4f8"><div class="toolbar-header svelte-1hxe4f8"><div class="header-left svelte-1hxe4f8">`);
					Workflow($$renderer, { class: 'workflow-icon text-ink' });
					$$renderer.push(`<!----> <span class="header-title svelte-1hxe4f8">Mermaid</span> <span class="lines-count svelte-1hxe4f8">${$.escape(lineCount())} lines</span></div> <div class="header-right svelte-1hxe4f8">`);

					Tabs($$renderer, {
						value: mode,
						onValueChange: (val) => mode = val,
						children: ($$renderer) => {
							TabsList($$renderer, {
								children: ($$renderer) => {
									TabsTrigger($$renderer, {
										value: 'code',
										class: 'tab-btn',
										children: ($$renderer) => {
											Code($$renderer, { class: 'tab-icon' });
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TabsTrigger($$renderer, {
										value: 'both',
										class: 'tab-btn',
										children: ($$renderer) => {
											Columns2($$renderer, { class: 'tab-icon' });
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TabsTrigger($$renderer, {
										value: 'preview',
										class: 'tab-btn',
										children: ($$renderer) => {
											Eye($$renderer, { class: 'tab-icon' });
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <button class="edra-btn edra-btn-ghost edra-btn-icon-xs" title="Copy code">`);

					if (copied) {
						$$renderer.push('<!--[0-->');
						Check($$renderer, { class: 'success-icon text-icon' });
					} else {
						$$renderer.push('<!--[-1-->');
						Copy($$renderer, { class: 'text-icon' });
					}

					$$renderer.push(`<!--]--></button> <div class="divider svelte-1hxe4f8"></div> <button class="edra-btn edra-btn-ghost btn-small svelte-1hxe4f8">Cancel</button> <button class="edra-btn edra-btn-primary btn-small svelte-1hxe4f8">Apply</button></div></div> <div class="editor-panels svelte-1hxe4f8">`);

					if (mode === 'both' || mode === 'code') {
						$$renderer.push(`<!--[0--><div${$.attr_class(`editor-panel-left ${mode === 'both' ? 'border-right-only' : ''}`, 'svelte-1hxe4f8')}><textarea placeholder="graph TD
  A[Start] --> B[End]"${$.attr('spellcheck', false)} class="mermaid-code-editor svelte-1hxe4f8">`);

						const $$body = $.escape(editCode);

						if ($$body) {
							$$renderer.push(`${$$body}`);
						} else {}

						$$renderer.push(`</textarea> <div class="keyboard-hints svelte-1hxe4f8"><span>⌘↵ Apply</span> <span>Esc Cancel</span></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (mode === 'both' || mode === 'preview') {
						$$renderer.push(`<!--[0--><div class="editor-panel-right svelte-1hxe4f8">`);

						if (error) {
							$$renderer.push(`<!--[0--><div class="error-box svelte-1hxe4f8"><div class="error-icon-wrapper svelte-1hxe4f8">`);
							TriangleAlert($$renderer, { class: 'error-icon alert-icon-size' });
							$$renderer.push(`<!----></div> <p class="error-text svelte-1hxe4f8">Syntax Error</p> <p class="error-details svelte-1hxe4f8">${$.escape(error)}</p></div>`);
						} else if (isRendering) {
							$$renderer.push(`<!--[1--><div class="loading-box svelte-1hxe4f8"><div class="loading-spinner svelte-1hxe4f8"></div> <span class="loading-text svelte-1hxe4f8">Rendering...</span></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div${$.attr_class(`mermaid-preview ${error ? 'hidden-element' : ''}`, 'svelte-1hxe4f8')}></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="preview-box svelte-1hxe4f8">`);

					if (!code() || code().trim() === '') {
						$$renderer.push(`<!--[0--><button class="placeholder-button svelte-1hxe4f8">`);
						Workflow($$renderer, { class: 'workflow-icon text-mute' });
						$$renderer.push(`<!----> <span class="placeholder-text svelte-1hxe4f8"${$.attr('contenteditable', false)}>Click to add a Mermaid diagram</span></button>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="rendered-card svelte-1hxe4f8"><div class="mermaid-container svelte-1hxe4f8"></div> `);

						if (error) {
							$$renderer.push(`<!--[0--><div class="rendered-error-footer svelte-1hxe4f8">`);
							TriangleAlert($$renderer, { class: 'error-icon alert-icon-size' });
							$$renderer.push(`<!----> <p class="rendered-error-text svelte-1hxe4f8">${$.escape(error)}</p></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (editor.isEditable) {
							$$renderer.push(`<!--[0--><div class="hover-actions svelte-1hxe4f8">`);

							Tooltip($$renderer, {
								tooltip: 'Download Image',
								children: ($$renderer) => {
									$$renderer.push(`<button class="edra-btn edra-btn-ghost edra-btn-icon-xs" title="Download Image">`);
									Download($$renderer, { class: 'text-icon' });
									$$renderer.push(`<!----></button>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Tooltip($$renderer, {
								tooltip: 'Copy Code',
								children: ($$renderer) => {
									$$renderer.push(`<button class="edra-btn edra-btn-ghost edra-btn-icon-xs" title="Copy code">`);

									if (copied) {
										$$renderer.push('<!--[0-->');
										Check($$renderer, { class: 'success-icon text-icon' });
									} else {
										$$renderer.push('<!--[-1-->');
										Copy($$renderer, { class: 'text-icon' });
									}

									$$renderer.push(`<!--]--></button>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Tooltip($$renderer, {
								tooltip: 'Edit Mode',
								children: ($$renderer) => {
									$$renderer.push(`<button class="edra-btn edra-btn-ghost edra-btn-icon-xs" title="Edit diagram">`);
									Pencil($$renderer, { class: 'text-icon' });
									$$renderer.push(`<!----></button>`);
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
	});
}