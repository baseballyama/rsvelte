import * as $ from 'svelte/internal/server';
import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
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
				class: cn('relative my-4! flex flex-col rounded-md border border-transparent', selected && 'is-media-selected', node.attrs.align === 'left' && 'left-0 translate-x-0', node.attrs.align === 'center' && 'left-1/2 -translate-x-1/2', node.attrs.align === 'right' && 'left-full -translate-x-full'),
				style: `width: ${node.attrs.width}`,
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_class($.clsx(cn('group relative flex flex-col rounded-md', resizing && '')))}>`);
					children($$renderer);
					$$renderer.push(`<!----> `);

					if (node.attrs.title !== null && node.attrs.title.trim() !== '') {
						$$renderer.push(`<!--[0--><input${$.attr('value', node.attrs.title)} type="text" class="my-1 w-full bg-transparent text-center text-sm text-muted-foreground outline-none"/>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (editor.isEditable) {
						$$renderer.push(`<!--[0--><div role="button" tabindex="0"${$.attr('aria-label', strings.extension.media.back)} class="absolute inset-y-0 z-20 flex w-5 cursor-col-resize items-center justify-start p-2" style="left: 0px"><div class="z-20 h-16 w-1 rounded-xl border bg-muted opacity-0 transition-all group-hover:opacity-100"></div></div> <div role="button" tabindex="0"${$.attr('aria-label', strings.extension.media.back)} class="absolute inset-y-0 z-20 flex w-5 cursor-col-resize items-center justify-end p-2" style="right: 0px"><div class="z-20 h-16 w-1 rounded-xl border bg-muted opacity-0 transition-all group-hover:opacity-100"></div></div> <div${$.attr_class($.clsx(cn('absolute -top-2 left-[calc(50%-3rem)] z-50! flex items-center gap-1 rounded-md border bg-background/50 p-1 opacity-0 backdrop-blur-sm transition-opacity', !resizing && 'group-hover:opacity-100', openedMore && 'opacity-100')))}>`);

						Button($$renderer, {
							variant: 'ghost',
							size: 'icon-xs',
							class: cn(node.attrs.align === 'left' && 'bg-muted'),
							onclick: () => updateAttributes({ align: 'left' }),
							title: strings.extension.media.alignLeft,
							children: ($$renderer) => {
								AlignLeft($$renderer, {});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							variant: 'ghost',
							size: 'icon-xs',
							class: cn(node.attrs.align === 'center' && 'bg-muted'),
							onclick: () => updateAttributes({ align: 'center' }),
							title: strings.extension.media.alignCenter,
							children: ($$renderer) => {
								AlignCenter($$renderer, {});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							variant: 'ghost',
							size: 'icon-xs',
							class: cn(node.attrs.align === 'right' && 'bg-muted'),
							onclick: () => updateAttributes({ align: 'right' }),
							title: strings.extension.media.alignRight,
							children: ($$renderer) => {
								AlignRight($$renderer, {});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (DropdownMenu.Root) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Root($$renderer, {
								onOpenChange: (value) => openedMore = value,
								get open() {
									return openedMore;
								},

								set open($$value) {
									openedMore = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (DropdownMenu.Trigger) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Trigger($$renderer, {
											class: buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
											title: strings.extension.media.moreOptions,
											children: ($$renderer) => {
												EllipsisVertical($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (DropdownMenu.Content) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Content($$renderer, {
											align: 'start',
											class: 'mt-1 overflow-auto text-sm',
											children: ($$renderer) => {
												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														onclick: () => {
															if (node.attrs.title === null || node.attrs.title.trim() === '') updateAttributes({ title: strings.extension.media.captionPlaceholder });
														},

														children: ($$renderer) => {
															Captions($$renderer, {});
															$$renderer.push(`<!----> ${$.escape(strings.extension.media.caption)}`);
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
														onclick: () => {
															duplicateContent(editor, node);
														},

														children: ($$renderer) => {
															CopyIcon($$renderer, {});
															$$renderer.push(`<!----> ${$.escape(strings.extension.media.duplicate)}`);
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
														onclick: () => {
															updateAttributes({ width: '100%' });
														},

														children: ($$renderer) => {
															Fullscreen($$renderer, {});
															$$renderer.push(`<!----> ${$.escape(strings.extension.media.fullscreen)}`);
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
														onclick: () => {
															deleteNode();
														},
														class: 'text-destructive',
														children: ($$renderer) => {
															Trash($$renderer, {});
															$$renderer.push(`<!----> ${$.escape(strings.extension.media.delete)}`);
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

						$$renderer.push(`</div>`);
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