import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<input type="text" class="media-title-input"/>`);
var root_1 = $.from_html(`<!> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div role="button" tabindex="0" class="resize-handle resize-handle-left"><div class="resize-bar"></div></div> <div role="button" tabindex="0" class="resize-handle resize-handle-right"><div class="resize-bar"></div></div> <div><button><!></button> <button><!></button> <button><!></button> <!></div>`, 1);
var root_5 = $.from_html(`<div class="media-group"><!> <!> <!></div>`);

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
		let $0 = $.derived(() => cn('media-extended-wrapper', $$props.selected && 'selected', $$props.node.attrs.align === 'left' && 'align-left', $$props.node.attrs.align === 'center' && 'align-center', $$props.node.attrs.align === 'right' && 'align-right'));
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
						var button = $.child(div_3);
						var node_4 = $.child(button);

						AlignLeft(node_4, { class: 'media-icon' });
						$.reset(button);

						var button_1 = $.sibling(button, 2);
						var node_5 = $.child(button_1);

						AlignCenter(node_5, { class: 'media-icon' });
						$.reset(button_1);

						var button_2 = $.sibling(button_1, 2);
						var node_6 = $.child(button_2);

						AlignRight(node_6, { class: 'media-icon' });
						$.reset(button_2);

						var node_7 = $.sibling(button_2, 2);

						Root(node_7, {
							get open() {
								return $.get(openedMore);
							},

							set open($$value) {
								$.set(openedMore, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_3();
								var node_8 = $.first_child(fragment_2);

								Trigger(node_8, {
									class: 'edra-btn edra-btn-ghost edra-btn-icon-xs',
									get title() {
										return strings.extension.media.moreOptions;
									},

									children: ($$anchor, $$slotProps) => {
										EllipsisVertical($$anchor, { class: 'media-icon' });
									},
									$$slots: { default: true }
								});

								var node_9 = $.sibling(node_8, 2);

								Content(node_9, {
									align: 'start',
									class: 'more-options-menu',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_2();
										var node_10 = $.first_child(fragment_4);

										Item(node_10, {
											onclick: () => {
												if ($$props.node.attrs.title === null || $$props.node.attrs.title.trim() === '') $$props.updateAttributes({ title: strings.extension.media.captionPlaceholder });
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_11 = $.first_child(fragment_5);

												Captions(node_11, { class: 'media-icon' });

												var span = $.sibling(node_11, 2);
												var text = $.only_child(span, true);

												$.template_effect(() => $.set_text(text, strings.extension.media.caption));
												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});

										var node_12 = $.sibling(node_10, 2);

										Item(node_12, {
											onclick: () => {
												duplicateContent($$props.editor, $$props.node);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_13 = $.first_child(fragment_6);

												CopyIcon(node_13, { class: 'media-icon' });

												var span_1 = $.sibling(node_13, 2);
												var text_1 = $.only_child(span_1, true);

												$.template_effect(() => $.set_text(text_1, strings.extension.media.duplicate));
												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});

										var node_14 = $.sibling(node_12, 2);

										Item(node_14, {
											onclick: () => {
												$$props.updateAttributes({ width: '100%' });
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_1();
												var node_15 = $.first_child(fragment_7);

												Fullscreen(node_15, { class: 'media-icon' });

												var span_2 = $.sibling(node_15, 2);
												var text_2 = $.only_child(span_2, true);

												$.template_effect(() => $.set_text(text_2, strings.extension.media.fullscreen));
												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});

										var node_16 = $.sibling(node_14, 2);

										Item(node_16, {
											onclick: () => {
												$$props.deleteNode();
											},
											class: 'text-(--edra-error) hover:bg-(--edra-error-soft)',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_1();
												var node_17 = $.first_child(fragment_8);

												Trash(node_17, { class: 'media-icon' });

												var span_3 = $.sibling(node_17, 2);
												var text_3 = $.only_child(span_3, true);

												$.template_effect(() => $.set_text(text_3, strings.extension.media.delete));
												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});

						$.reset(div_3);

						$.template_effect(
							($0) => {
								$.set_attribute(div_1, 'aria-label', strings.extension.media.back);
								$.set_attribute(div_2, 'aria-label', strings.extension.media.back);
								$.set_class(div_3, 1, $0);
								$.set_class(button, 1, `edra-btn edra-btn-ghost edra-btn-icon-xs ${$$props.node.attrs.align === 'left' ? 'media-align-active' : ''}`);
								$.set_attribute(button, 'title', strings.extension.media.alignLeft);
								$.set_class(button_1, 1, `edra-btn edra-btn-ghost edra-btn-icon-xs ${$$props.node.attrs.align === 'center' ? 'media-align-active' : ''}`);
								$.set_attribute(button_1, 'title', strings.extension.media.alignCenter);
								$.set_class(button_2, 1, `edra-btn edra-btn-ghost edra-btn-icon-xs ${$$props.node.attrs.align === 'right' ? 'media-align-active' : ''}`);
								$.set_attribute(button_2, 'title', strings.extension.media.alignRight);
							},
							[
								() => $.clsx(cn('media-toolbar', $.get(openedMore) && 'opened'))
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

						$.delegated('click', button, () => $$props.updateAttributes({ align: 'left' }));
						$.delegated('click', button_1, () => $$props.updateAttributes({ align: 'center' }));
						$.delegated('click', button_2, () => $$props.updateAttributes({ align: 'right' }));
						$.append($$anchor, fragment_1);
					};

					$.if(node_3, ($$render) => {
						if ($$props.editor.isEditable) $$render(consequent_1);
					});
				}

				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}

$.delegate(['change', 'mousedown', 'touchstart', 'click']);