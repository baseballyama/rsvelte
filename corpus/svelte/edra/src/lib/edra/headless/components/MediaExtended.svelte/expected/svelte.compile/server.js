import * as $ from 'svelte/internal/server';
import { Root, Trigger, Content, Item } from '../primitives/dropdown/index.ts';
import { cn } from '$lib/utils.js';
import AlignCenter from '@lucide/svelte/icons/text-align-center';
import AlignLeft from '@lucide/svelte/icons/text-align-start';
import AlignRight from '@lucide/svelte/icons/text-align-end';
import Captions from '@lucide/svelte/icons/captions';
import CopyIcon from '@lucide/svelte/icons/copy';
import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
import Fullscreen from '@lucide/svelte/icons/fullscreen';
import Trash from '@lucide/svelte/icons/trash-2';
import { onDestroy, onMount } from 'svelte';
import { duplicateContent } from '../../utils.js';
import strings from '../../strings.js';
import { NodeViewWrapper } from '../../tiptap/index.js';

export default function MediaExtended($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			node,
			editor,
			selected,
			deleteNode,
			updateAttributes,
			children,
			mediaRef = void 0
		} = $$props;

		const minWidthPercent = 20;
		const maxWidthPercent = 100;
		let nodeRef = void 0;
		let resizing = false;
		let resizingInitialWidthPercent = 0;
		let resizingInitialMouseX = 0;
		let resizingPosition = 'left';
		let openedMore = false;

		function handleResizingPosition(e, position) {
			startResize(e);
			resizingPosition = position;
		}

		function startResize(e) {
			e.preventDefault();
			resizing = true;
			resizingInitialMouseX = e.clientX;

			if (mediaRef && nodeRef?.parentElement) {
				const currentWidth = mediaRef.offsetWidth;
				const parentWidth = nodeRef.parentElement.offsetWidth;

				resizingInitialWidthPercent = currentWidth / parentWidth * 100;
			}
		}

		function resize(e) {
			if (!resizing || !nodeRef?.parentElement) return;

			let dx = e.clientX - resizingInitialMouseX;

			if (resizingPosition === 'left') {
				dx = resizingInitialMouseX - e.clientX;
			}

			const parentWidth = nodeRef.parentElement.offsetWidth;
			const deltaPercent = dx / parentWidth * 100;
			const newWidthPercent = Math.max(Math.min(resizingInitialWidthPercent + deltaPercent, maxWidthPercent), minWidthPercent);

			updateAttributes({ width: `${newWidthPercent}%` });
		}

		function endResize() {
			resizing = false;
			resizingInitialMouseX = 0;
			resizingInitialWidthPercent = 0;
		}

		function handleTouchStart(e, position) {
			e.preventDefault();
			resizing = true;
			resizingPosition = position;
			resizingInitialMouseX = e.touches[0].clientX;

			if (mediaRef && nodeRef?.parentElement) {
				const currentWidth = mediaRef.offsetWidth;
				const parentWidth = nodeRef.parentElement.offsetWidth;

				resizingInitialWidthPercent = currentWidth / parentWidth * 100;
			}
		}

		function handleTouchMove(e) {
			if (!resizing || !nodeRef?.parentElement) return;

			let dx = e.touches[0].clientX - resizingInitialMouseX;

			if (resizingPosition === 'left') {
				dx = resizingInitialMouseX - e.touches[0].clientX;
			}

			const parentWidth = nodeRef.parentElement.offsetWidth;
			const deltaPercent = dx / parentWidth * 100;
			const newWidthPercent = Math.max(Math.min(resizingInitialWidthPercent + deltaPercent, maxWidthPercent), minWidthPercent);

			updateAttributes({ width: `${newWidthPercent}%` });
		}

		function handleTouchEnd() {
			resizing = false;
			resizingInitialMouseX = 0;
			resizingInitialWidthPercent = 0;
		}

		onMount(() => {
			// Attach id to nodeRef
			nodeRef = document.getElementById('resizable-container-media');

			// Mouse events
			window.addEventListener('mousemove', resize);

			window.addEventListener('mouseup', endResize);

			// Touch events
			window.addEventListener('touchmove', handleTouchMove);

			window.addEventListener('touchend', handleTouchEnd);
		});

		onDestroy(() => {
			window.removeEventListener('mousemove', resize);
			window.removeEventListener('mouseup', endResize);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('touchend', handleTouchEnd);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			NodeViewWrapper($$renderer, {
				id: 'resizable-container-media',
				class: cn('media-extended-wrapper', selected && 'selected', node.attrs.align === 'left' && 'align-left', node.attrs.align === 'center' && 'align-center', node.attrs.align === 'right' && 'align-right'),
				style: `width: ${node.attrs.width}`,
				children: ($$renderer) => {
					$$renderer.push(`<div class="media-group">`);
					children($$renderer);
					$$renderer.push(`<!----> `);

					if (node.attrs.title !== null && node.attrs.title.trim() !== '') {
						$$renderer.push(`<!--[0--><input${$.attr('value', node.attrs.title)} type="text" class="media-title-input"/>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (editor.isEditable) {
						$$renderer.push(`<!--[0--><div role="button" tabindex="0"${$.attr('aria-label', strings.extension.media.back)} class="resize-handle resize-handle-left"><div class="resize-bar"></div></div> <div role="button" tabindex="0"${$.attr('aria-label', strings.extension.media.back)} class="resize-handle resize-handle-right"><div class="resize-bar"></div></div> <div${$.attr_class($.clsx(cn('media-toolbar', openedMore && 'opened')))}><button${$.attr_class(`edra-btn edra-btn-ghost edra-btn-icon-xs ${node.attrs.align === 'left' ? 'media-align-active' : ''}`)}${$.attr('title', strings.extension.media.alignLeft)}>`);
						AlignLeft($$renderer, { class: 'media-icon' });
						$$renderer.push(`<!----></button> <button${$.attr_class(`edra-btn edra-btn-ghost edra-btn-icon-xs ${node.attrs.align === 'center' ? 'media-align-active' : ''}`)}${$.attr('title', strings.extension.media.alignCenter)}>`);
						AlignCenter($$renderer, { class: 'media-icon' });
						$$renderer.push(`<!----></button> <button${$.attr_class(`edra-btn edra-btn-ghost edra-btn-icon-xs ${node.attrs.align === 'right' ? 'media-align-active' : ''}`)}${$.attr('title', strings.extension.media.alignRight)}>`);
						AlignRight($$renderer, { class: 'media-icon' });
						$$renderer.push(`<!----></button> `);

						Root($$renderer, {
							get open() {
								return openedMore;
							},

							set open($$value) {
								openedMore = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								Trigger($$renderer, {
									class: 'edra-btn edra-btn-ghost edra-btn-icon-xs',
									title: strings.extension.media.moreOptions,
									children: ($$renderer) => {
										EllipsisVertical($$renderer, { class: 'media-icon' });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Content($$renderer, {
									align: 'start',
									class: 'more-options-menu',
									children: ($$renderer) => {
										Item($$renderer, {
											onclick: () => {
												if (node.attrs.title === null || node.attrs.title.trim() === '') updateAttributes({ title: strings.extension.media.captionPlaceholder });
											},

											children: ($$renderer) => {
												Captions($$renderer, { class: 'media-icon' });
												$$renderer.push(`<!----> <span>${$.escape(strings.extension.media.caption)}</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Item($$renderer, {
											onclick: () => {
												duplicateContent(editor, node);
											},

											children: ($$renderer) => {
												CopyIcon($$renderer, { class: 'media-icon' });
												$$renderer.push(`<!----> <span>${$.escape(strings.extension.media.duplicate)}</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Item($$renderer, {
											onclick: () => {
												updateAttributes({ width: '100%' });
											},

											children: ($$renderer) => {
												Fullscreen($$renderer, { class: 'media-icon' });
												$$renderer.push(`<!----> <span>${$.escape(strings.extension.media.fullscreen)}</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Item($$renderer, {
											onclick: () => {
												deleteNode();
											},
											class: 'text-(--edra-error) hover:bg-(--edra-error-soft)',
											children: ($$renderer) => {
												Trash($$renderer, { class: 'media-icon' });
												$$renderer.push(`<!----> <span>${$.escape(strings.extension.media.delete)}</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
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
		$.bind_props($$props, { mediaRef });
	});
}