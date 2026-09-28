import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { IconChevronRight } from '@appwrite.io/pink-icons-svelte';
import { Icon, Layout, Selector, Spinner, Typography } from '@appwrite.io/pink-svelte';
import DirectoryItemSelf from './DirectoryItem.svelte';

var root = $.from_html(`<!> <div><!></div>`, 1);
var root_1 = $.from_html(`<div class="fileCount svelte-1czg5av"><!></div>`);
var root_2 = $.from_html(`<div><!></div> <span class="title svelte-1czg5av"> </span> <!>`, 1);
var root_3 = $.from_html(`<div class="thumbnail-fallback svelte-1czg5av"></div>`);
var root_4 = $.from_html(`<img alt="Directory thumbnail"/>`);
var root_5 = $.from_html(`<div class="thumbnail svelte-1czg5av"><!></div>`);
var root_6 = $.from_html(`<div class="thumbnail svelte-1czg5av"></div>`);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<div><!></div>`);
var root_9 = $.from_html(`<div class="directory-item-container svelte-1czg5av"><button><!></button> <!></div>`);

export default function DirectoryItem($$anchor, $$props) {
	$.push($$props, true);

	const $group = () => $.store_get(group, '$group', $$stores);
	const $item = () => $.store_get(item, '$item', $$stores);
	const $isExpanded = () => $.store_get(isExpanded, '$isExpanded', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let level = $.prop($$props, 'level', 3, 0);
	const Radio = Selector.Radio;
	let radioInputs = $.proxy([]);
	let value = $.state(undefined);
	let thumbnailStates = $.state($.proxy([]));

	$.user_effect(() => {
		if (!$$props.directories) return;

		if ($.get(thumbnailStates).length < $$props.directories.length) {
			$.set(
				thumbnailStates,
				[
					...$.get(thumbnailStates),
					...Array.from(
						{
							length: $$props.directories.length - $.get(thumbnailStates).length
						},
						() => ({ loading: true, error: false })
					)
				],
				true
			);
		} else if ($.get(thumbnailStates).length > $$props.directories.length) {
			$.set(thumbnailStates, $.get(thumbnailStates).slice(0, $$props.directories.length), true);
		}
	});

	function handleThumbnailLoad(index) {
		if (!$.get(thumbnailStates)[index]) return;

		$.get(thumbnailStates)[index].loading = false;
		$.get(thumbnailStates)[index].error = false;
	}

	function handleThumbnailError(index) {
		if (!$.get(thumbnailStates)[index]) return;

		$.get(thumbnailStates)[index].loading = false;
		$.get(thumbnailStates)[index].error = true;
	}

	const { elements: { item, group }, helpers: { isExpanded } } = getContext('tree');
	const paddingLeftStyle = `padding-left: ${32 * level() + 8}px`;

	$.user_effect(() => {
		if ($$props.selectedPath && $$props.directories?.length) {
			const idx = $$props.directories.findIndex((d) => d.fullPath === $$props.selectedPath);

			if (idx !== -1 && radioInputs[idx]) {
				radioInputs[idx].checked = true;
			}
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $$props.directories, $.index, ($$anchor, $$item, i) => {
		let title = () => $.get($$item).title;
		let fileCount = () => $.get($$item).fileCount;
		let fullPath = () => $.get($$item).fullPath;
		let thumbnailUrl = () => $.get($$item).thumbnailUrl;
		let thumbnailIcon = () => $.get($$item).thumbnailIcon;
		let thumbnailHtml = () => $.get($$item).thumbnailHtml;
		let children = () => $.get($$item).children;
		let explicitHasChildren = () => $.get($$item).hasChildren;
		let showThumbnail = $.derived_safe_equal(() => $.fallback($.get($$item).showThumbnail, true));
		let loading = $.derived_safe_equal(() => $.fallback($.get($$item).loading, false));
		const hasChildren = $.derived(() => explicitHasChildren() ?? !!children()?.length);
		const __MELTUI_BUILDER_1__ = $.derived(() => $group()({ id: fullPath() }));
		const __MELTUI_BUILDER_0__ = $.derived(() => $item()({ id: fullPath(), hasChildren: $.get(hasChildren) }));
		var div = root_9();
		var button = $.child(div);

		var event_handler = () => {
			if (radioInputs[i]) radioInputs[i].checked = true;

			$$props.onSelect?.({
				title: title(),
				fullPath: fullPath(),
				hasChildren: $.get(hasChildren)
			});
		};

		$.attribute_effect(
			button,
			() => ({
				class: 'folder',
				type: 'button',
				style: paddingLeftStyle,
				onclick: event_handler,
				...$.get(__MELTUI_BUILDER_0__)
			}),
			void 0,
			void 0,
			void 0,
			'svelte-1czg5av'
		);

		var node_1 = $.child(button);

		$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
			Layout_Stack($$anchor, {
				direction: 'row',
				justifyContent: 'space-between',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_7();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
						Layout_Stack_1($$anchor, {
							direction: 'row',
							justifyContent: 'flex-start',
							gap: 'xxs',
							alignItems: 'center',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_2();
								var div_1 = $.first_child(fragment_2);
								var node_3 = $.child(div_1);

								$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
									Layout_Stack_2($$anchor, {
										direction: 'row',
										gap: 'xxs',
										alignItems: 'center',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_4 = $.first_child(fragment_3);

											Radio(node_4, {
												group: 'directory',
												name: 'directory',
												size: 's',
												get value() {
													return $.get(value);
												},

												set value($$value) {
													$.set(value, $$value, true);
												},

												get radioInput() {
													return radioInputs[i];
												},

												set radioInput($$value) {
													radioInputs[i] = $$value;
												}
											});

											var div_2 = $.sibling(node_4, 2);
											let classes;
											var node_5 = $.child(div_2);

											Icon(node_5, {
												get icon() {
													return IconChevronRight;
												},
												size: 's',
												color: '--fgcolor-neutral-tertiary'
											});

											$.reset(div_2);
											$.template_effect(($0) => classes = $.set_class(div_2, 1, 'chevron-container svelte-1czg5av', null, classes, { 'folder-open': $0, disabled: !$.get(hasChildren) }), [() => $isExpanded()(fullPath())]);
											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.reset(div_1);

								var span = $.sibling(div_1, 2);
								var text = $.only_child(span, true);
								var node_6 = $.sibling(span, 2);

								{
									var consequent = ($$anchor) => {
										var div_3 = root_1();
										var node_7 = $.child(div_3);

										$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text) => {
											Typography_Text($$anchor, {
												variant: 'm-400',
												color: '--fgcolor-neutral-tertiary',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, `(${fileCount() ?? ''} files)`));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_3);
										$.append($$anchor, div_3);
									};

									$.if(node_6, ($$render) => {
										if (fileCount() !== undefined) $$render(consequent);
									});
								}

								$.template_effect(() => {
									$.set_style(span, $$props.containerWidth
										? `max-width: ${$$props.containerWidth - 100 - level() * 40}px`
										: '');

									$.set_text(text, title());
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					var node_8 = $.sibling(node_2, 2);

					{
						var consequent_6 = ($$anchor) => {
							var fragment_5 = root_7();
							var node_9 = $.first_child(fragment_5);

							{
								var consequent_1 = ($$anchor) => {
									Spinner($$anchor, {});
								};

								$.if(node_9, ($$render) => {
									if ($.get(loading) || $.get(thumbnailStates)[i]?.loading && !thumbnailIcon() && !thumbnailHtml()) $$render(consequent_1);
								});
							}

							var node_10 = $.sibling(node_9, 2);

							{
								var consequent_2 = ($$anchor) => {
									var div_4 = root_3();

									$.append($$anchor, div_4);
								};

								var consequent_3 = ($$anchor) => {
									var img = root_4();
									let classes_1;

									$.template_effect(() => {
										$.set_attribute(img, 'src', thumbnailUrl());
										classes_1 = $.set_class(img, 1, 'thumbnail svelte-1czg5av', null, classes_1, { hidden: $.get(thumbnailStates)[i]?.loading });
									});

									$.event('load', img, () => handleThumbnailLoad(i));
									$.event('error', img, () => handleThumbnailError(i));
									$.replay_events(img);
									$.append($$anchor, img);
								};

								var consequent_4 = ($$anchor) => {
									var div_5 = root_5();
									var node_11 = $.child(div_5);

									Icon(node_11, {
										get icon() {
											return thumbnailIcon();
										},
										size: 'l'
									});

									$.reset(div_5);
									$.append($$anchor, div_5);
								};

								var consequent_5 = ($$anchor) => {
									var div_6 = root_6();

									$.html(div_6, thumbnailHtml, true);
									$.reset(div_6);
									$.append($$anchor, div_6);
								};

								$.if(node_10, ($$render) => {
									if ($.get(thumbnailStates)[i]?.error) $$render(consequent_2); else if (thumbnailUrl()) $$render(consequent_3, 1); else if (thumbnailIcon()) $$render(consequent_4, 2); else if (thumbnailHtml()) $$render(consequent_5, 3);
								});
							}

							$.append($$anchor, fragment_5);
						};

						$.if(node_8, ($$render) => {
							if ($.get(showThumbnail)) $$render(consequent_6);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});

		$.reset(button);
		$.action(button, ($$node) => $.get(__MELTUI_BUILDER_0__).action?.($$node));

		var node_12 = $.sibling(button, 2);

		{
			var consequent_7 = ($$anchor) => {
				var div_7 = root_8();

				$.attribute_effect(div_7, () => ({ ...$.get(__MELTUI_BUILDER_1__) }), void 0, void 0, void 0, 'svelte-1czg5av');

				var node_13 = $.child(div_7);

				{
					let $0 = $.derived(() => level() + 1);

					DirectoryItemSelf(node_13, {
						get directories() {
							return children();
						},

						get level() {
							return $.get($0);
						},

						get containerWidth() {
							return $$props.containerWidth;
						},

						get selectedPath() {
							return $$props.selectedPath;
						},

						get onSelect() {
							return $$props.onSelect;
						}
					});
				}

				$.reset(div_7);
				$.action(div_7, ($$node) => $.get(__MELTUI_BUILDER_1__).action?.($$node));
				$.append($$anchor, div_7);
			};

			$.if(node_12, ($$render) => {
				if (children()) $$render(consequent_7);
			});
		}

		$.reset(div);
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}