import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<input type="text" class="my-1 w-full bg-transparent text-center text-sm text-muted-foreground outline-none"/>`);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div role="button" tabindex="0" class="absolute inset-y-0 z-20 flex w-5 cursor-col-resize items-center justify-start p-2" style="left: 0px"><div class="z-20 h-16 w-1 rounded-xl border bg-muted opacity-0 transition-all group-hover:opacity-100"></div></div> <div role="button" tabindex="0" class="absolute inset-y-0 z-20 flex w-5 cursor-col-resize items-center justify-end p-2" style="right: 0px"><div class="z-20 h-16 w-1 rounded-xl border bg-muted opacity-0 transition-all group-hover:opacity-100"></div></div> <div><!> <!> <!> <!></div>`, 1);
var root_5 = $.from_html(`<div><!> <!> <!></div>`);

export default function MediaExtended($$anchor, $$props) {
	$.push($$props, true);

	const minWidthPercent = 20;
	const maxWidthPercent = 100;
	let nodeRef = $.state(void 0);
	let resizing = $.state(false);
	let resizingInitialWidthPercent = $.state(0);
	let resizingInitialMouseX = $.state(0);
	let resizingPosition = $.state('left');
	let openedMore = $.state(false);

	function handleResizingPosition(e, position) {
		startResize(e);
		$.set(resizingPosition, position, true);
	}

	function startResize(e) {
		e.preventDefault();
		$.set(resizing, true);
		$.set(resizingInitialMouseX, e.clientX, true);

		if ($$props.mediaRef && $.get(nodeRef)?.parentElement) {
			const currentWidth = $$props.mediaRef.offsetWidth;
			const parentWidth = $.get(nodeRef).parentElement.offsetWidth;

			$.set(resizingInitialWidthPercent, currentWidth / parentWidth * 100);
		}
	}

	function resize(e) {
		if (!$.get(resizing) || !$.get(nodeRef)?.parentElement) return;

		let dx = e.clientX - $.get(resizingInitialMouseX);

		if ($.get(resizingPosition) === 'left') {
			dx = $.get(resizingInitialMouseX) - e.clientX;
		}

		const parentWidth = $.get(nodeRef).parentElement.offsetWidth;
		const deltaPercent = dx / parentWidth * 100;
		const newWidthPercent = Math.max(Math.min($.get(resizingInitialWidthPercent) + deltaPercent, maxWidthPercent), minWidthPercent);

		$$props.updateAttributes({ width: `${newWidthPercent}%` });
	}

	function endResize() {
		$.set(resizing, false);
		$.set(resizingInitialMouseX, 0);
		$.set(resizingInitialWidthPercent, 0);
	}

	function handleTouchStart(e, position) {
		e.preventDefault();
		$.set(resizing, true);
		$.set(resizingPosition, position, true);
		$.set(resizingInitialMouseX, e.touches[0].clientX, true);

		if ($$props.mediaRef && $.get(nodeRef)?.parentElement) {
			const currentWidth = $$props.mediaRef.offsetWidth;
			const parentWidth = $.get(nodeRef).parentElement.offsetWidth;

			$.set(resizingInitialWidthPercent, currentWidth / parentWidth * 100);
		}
	}

	function handleTouchMove(e) {
		if (!$.get(resizing) || !$.get(nodeRef)?.parentElement) return;

		let dx = e.touches[0].clientX - $.get(resizingInitialMouseX);

		if ($.get(resizingPosition) === 'left') {
			dx = $.get(resizingInitialMouseX) - e.touches[0].clientX;
		}

		const parentWidth = $.get(nodeRef).parentElement.offsetWidth;
		const deltaPercent = dx / parentWidth * 100;
		const newWidthPercent = Math.max(Math.min($.get(resizingInitialWidthPercent) + deltaPercent, maxWidthPercent), minWidthPercent);

		$$props.updateAttributes({ width: `${newWidthPercent}%` });
	}

	function handleTouchEnd() {
		$.set(resizing, false);
		$.set(resizingInitialMouseX, 0);
		$.set(resizingInitialWidthPercent, 0);
	}

	onMount(() => {
		// Attach id to nodeRef
		$.set(nodeRef, document.getElementById('resizable-container-media'), true);

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

	{
		let $0 = $.derived(() => cn('relative my-4! flex flex-col rounded-md border border-transparent', $$props.selected && 'is-media-selected', $$props.node.attrs.align === 'left' && 'left-0 translate-x-0', $$props.node.attrs.align === 'center' && 'left-1/2 -translate-x-1/2', $$props.node.attrs.align === 'right' && 'left-full -translate-x-full'));
		let $1 = $.derived(() => `width: ${$$props.node.attrs.width}`);

		NodeViewWrapper($$anchor, {
			id: 'resizable-container-media',
			get class() {
				return $.get($0);
			},

			get style() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var div = root_5();
				var node_1 = $.child(div);

				$.snippet(node_1, () => $$props.children);

				var node_2 = $.sibling(node_1, 2);

				{
					var consequent = ($$anchor) => {
						var input = root();

						$.remove_input_defaults(input);
						$.template_effect(() => $.set_value(input, $$props.node.attrs.title));

						$.delegated('change', input, (e) => {
							const target = e.target;

							$$props.updateAttributes({ title: target.value });
						});

						$.append($$anchor, input);
					};

					var d = $.derived(() => $$props.node.attrs.title !== null && $$props.node.attrs.title.trim() !== '');

					$.if(node_2, ($$render) => {
						if ($.get(d)) $$render(consequent);
					});
				}

				var node_3 = $.sibling(node_2, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_1 = root_4();
						var div_1 = $.first_child(fragment_1);
						var div_2 = $.sibling(div_1, 2);
						var div_3 = $.sibling(div_2, 2);
						var node_4 = $.child(div_3);

						{
							let $0 = $.derived(() => cn($$props.node.attrs.align === 'left' && 'bg-muted'));

							Button(node_4, {
								variant: 'ghost',
								size: 'icon-xs',
								get class() {
									return $.get($0);
								},
								onclick: () => $$props.updateAttributes({ align: 'left' }),
								get title() {
									return strings.extension.media.alignLeft;
								},

								children: ($$anchor, $$slotProps) => {
									AlignLeft($$anchor, {});
								},
								$$slots: { default: true }
							});
						}

						var node_5 = $.sibling(node_4, 2);

						{
							let $0 = $.derived(() => cn($$props.node.attrs.align === 'center' && 'bg-muted'));

							Button(node_5, {
								variant: 'ghost',
								size: 'icon-xs',
								get class() {
									return $.get($0);
								},
								onclick: () => $$props.updateAttributes({ align: 'center' }),
								get title() {
									return strings.extension.media.alignCenter;
								},

								children: ($$anchor, $$slotProps) => {
									AlignCenter($$anchor, {});
								},
								$$slots: { default: true }
							});
						}

						var node_6 = $.sibling(node_5, 2);

						{
							let $0 = $.derived(() => cn($$props.node.attrs.align === 'right' && 'bg-muted'));

							Button(node_6, {
								variant: 'ghost',
								size: 'icon-xs',
								get class() {
									return $.get($0);
								},
								onclick: () => $$props.updateAttributes({ align: 'right' }),
								get title() {
									return strings.extension.media.alignRight;
								},

								children: ($$anchor, $$slotProps) => {
									AlignRight($$anchor, {});
								},
								$$slots: { default: true }
							});
						}

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
							DropdownMenu_Root($$anchor, {
								onOpenChange: (value) => $.set(openedMore, value, true),
								get open() {
									return $.get(openedMore);
								},

								set open($$value) {
									$.set(openedMore, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_3();
									var node_8 = $.first_child(fragment_5);

									{
										let $0 = $.derived(() => buttonVariants({ variant: 'ghost', size: 'icon-xs' }));

										$.component(node_8, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
											DropdownMenu_Trigger($$anchor, {
												get class() {
													return $.get($0);
												},

												get title() {
													return strings.extension.media.moreOptions;
												},

												children: ($$anchor, $$slotProps) => {
													EllipsisVertical($$anchor, {});
												},
												$$slots: { default: true }
											});
										});
									}

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
										DropdownMenu_Content($$anchor, {
											align: 'start',
											class: 'mt-1 overflow-auto text-sm',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_2();
												var node_10 = $.first_child(fragment_7);

												$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
													DropdownMenu_Item($$anchor, {
														onclick: () => {
															if ($$props.node.attrs.title === null || $$props.node.attrs.title.trim() === '') $$props.updateAttributes({ title: strings.extension.media.captionPlaceholder });
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_1();
															var node_11 = $.first_child(fragment_8);

															Captions(node_11, {});

															var text = $.sibling(node_11);

															$.template_effect(() => $.set_text(text, ` ${strings.extension.media.caption ?? ''}`));
															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_10, 2);

												$.component(node_12, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
													DropdownMenu_Item_1($$anchor, {
														onclick: () => {
															duplicateContent($$props.editor, $$props.node);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_1();
															var node_13 = $.first_child(fragment_9);

															CopyIcon(node_13, {});

															var text_1 = $.sibling(node_13);

															$.template_effect(() => $.set_text(text_1, ` ${strings.extension.media.duplicate ?? ''}`));
															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_12, 2);

												$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
													DropdownMenu_Item_2($$anchor, {
														onclick: () => {
															$$props.updateAttributes({ width: '100%' });
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root_1();
															var node_15 = $.first_child(fragment_10);

															Fullscreen(node_15, {});

															var text_2 = $.sibling(node_15);

															$.template_effect(() => $.set_text(text_2, ` ${strings.extension.media.fullscreen ?? ''}`));
															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												var node_16 = $.sibling(node_14, 2);

												$.component(node_16, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
													DropdownMenu_Item_3($$anchor, {
														onclick: () => {
															$$props.deleteNode();
														},
														class: 'text-destructive',
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root_1();
															var node_17 = $.first_child(fragment_11);

															Trash(node_17, {});

															var text_3 = $.sibling(node_17);

															$.template_effect(() => $.set_text(text_3, ` ${strings.extension.media.delete ?? ''}`));
															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_3);

						$.template_effect(
							($0) => {
								$.set_attribute(div_1, 'aria-label', strings.extension.media.back);
								$.set_attribute(div_2, 'aria-label', strings.extension.media.back);
								$.set_class(div_3, 1, $0);
							},
							[
								() => $.clsx(cn('absolute -top-2 left-[calc(50%-3rem)] z-50! flex items-center gap-1 rounded-md border bg-background/50 p-1 opacity-0 backdrop-blur-sm transition-opacity', !$.get(resizing) && 'group-hover:opacity-100', $.get(openedMore) && 'opacity-100'))
							]
						);

						$.delegated('mousedown', div_1, (event) => {
							handleResizingPosition(event, 'left');
						});

						$.delegated(
							'touchstart',
							div_1,
							(event) => {
								handleTouchStart(event, 'left');
							},
							void 0,
							true
						);

						$.delegated('mousedown', div_2, (event) => {
							handleResizingPosition(event, 'right');
						});

						$.delegated(
							'touchstart',
							div_2,
							(event) => {
								handleTouchStart(event, 'right');
							},
							void 0,
							true
						);

						$.append($$anchor, fragment_1);
					};

					$.if(node_3, ($$render) => {
						if ($$props.editor.isEditable) $$render(consequent_1);
					});
				}

				$.reset(div);

				$.template_effect(($0) => $.set_class(div, 1, $0), [
					() => $.clsx(cn('group relative flex flex-col rounded-md', $.get(resizing) && ''))
				]);

				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}

$.delegate(['change', 'mousedown', 'touchstart']);