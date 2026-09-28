import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext, tick } from "svelte";
import { getListHandlers } from "./listnav.js";
import Dropdown from "../Dropdown.svelte";
import { defaultLocale } from "./locale";
import { setID } from "@svar-ui/lib-dom";
import Checkbox from "../Checkbox.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'items',
	'children',
	'onselect',
	'onready',
	'virtualized',
	'checkboxes',
	'multiselect',
	'value'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<div class="wx-list-wrapper svelte-19gmo0j"><div class="wx-list-content svelte-19gmo0j"><!></div></div>`);
var root_3 = $.from_html(`<div class="wx-no-data svelte-19gmo0j"> </div>`);
var root_4 = $.from_html(`<div class="wx-list svelte-19gmo0j"><!></div>`);

export default function SuggestDropdown($$anchor, $$props) {
	$.push($$props, true);

	const itemContent = ($$anchor, $$arg0) => {
		let data = () => ($$arg0?.()).data;
		var fragment = root();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				{
					let $0 = $.derived(() => $$props.value && $$props.value.includes(data().id));

					Checkbox($$anchor, {
						css: 'wx-list-checkbox',
						get name() {
							return data().id;
						},

						get value() {
							return $.get($0);
						}
					});
				}
			};

			$.if(node, ($$render) => {
				if ($$props.checkboxes) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.snippet(node_2, () => $$props.children, () => ({ option: data() }));
				$.append($$anchor, fragment_2);
			};

			var alternate = ($$anchor) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, data().label));
				$.append($$anchor, text);
			};

			$.if(node_1, ($$render) => {
				if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	const listContent = ($$anchor) => {
		var fragment_4 = $.comment();
		var node_3 = $.first_child(fragment_4);

		$.each(node_3, 19, () => $.get(visibleItems), (data) => data.id, ($$anchor, data, visibleIndex) => {
			var fragment_5 = $.comment();
			var node_4 = $.first_child(fragment_5);

			{
				var consequent_2 = ($$anchor) => {
					var div = root_1();
					let classes;
					var node_5 = $.child(div);

					itemContent(node_5, () => ({ data: $.get(data) }));
					$.reset(div);
					$.bind_this(div, ($$value) => $.set(firstItem, $$value), () => $.get(firstItem));

					$.template_effect(
						($0) => {
							classes = $.set_class(div, 1, 'wx-item svelte-19gmo0j', null, classes, {
								'wx-focus': $.get(visibleIndex) + $.get(visibleRange).start === $.get(navIndex)
							});

							$.set_attribute(div, 'data-id', $0);
						},
						[() => setID($.get(data).id)]
					);

					$.append($$anchor, div);
				};

				var alternate_1 = ($$anchor) => {
					var div_1 = root_1();
					let classes_1;
					var node_6 = $.child(div_1);

					itemContent(node_6, () => ({ data: $.get(data) }));
					$.reset(div_1);

					$.template_effect(
						($0) => {
							classes_1 = $.set_class(div_1, 1, 'wx-item svelte-19gmo0j', null, classes_1, {
								'wx-focus': $.get(visibleIndex) + $.get(visibleRange).start === $.get(navIndex)
							});

							$.set_attribute(div_1, 'data-id', $0);
						},
						[() => setID($.get(data).id)]
					);

					$.append($$anchor, div_1);
				};

				$.if(node_4, ($$render) => {
					if ($.get(visibleIndex) + $.get(visibleRange).start === 0) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_5);
		});

		$.append($$anchor, fragment_4);
	};

	let items = $.prop($$props, 'items', 19, () => []),
		virtualized = $.prop($$props, 'virtualized', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	const overscan = 3;
	let list = $.state(void 0);
	let firstItem = $.state(void 0);
	let navIndex = $.state(null);
	let scrollTop = $.state(0);
	let itemHeight = $.state(24);
	let isItemHeightInitialized = false;
	const _ = (getContext("wx-i18n") || defaultLocale()).getGroup("core");
	const { move, keydown, init, navigate } = getListHandlers();

	const scrollToVirtualized = (navIndex) => {
		if ($.get(list)) {
			$.get(list).scrollTop = navIndex * $.get(itemHeight) - $.get(list).clientHeight + $.get(itemHeight);
			$.set(scrollTop, $.get(list).scrollTop, true);
		}
	};

	const navigateVirtualized = (dir, ev) => {
		navigate(dir, ev);

		tick().then(() => {
			scrollToVirtualized($.get(navIndex));
		});
	};

	const keydownVirtualized = (ev, dir) => {
		if ($.get(navIndex) !== 0 && $.get(navIndex) !== items().length - 1 && (ev.key == "ArrowDown" || ev.key == "ArrowUp")) ev.preventDefault();

		keydown(ev, dir);

		tick().then(() => {
			if ($.get(list)) {
				const isInRange = $.get(visibleItems).find((item) => item.id === $.get(navIndex));

				if (isInRange) {
					const isTargetVisibleTop = $.get(list).scrollTop <= $.get(navIndex) * $.get(itemHeight);
					const isTargetVisibleBottom = $.get(list).scrollTop + $.get(list).clientHeight >= $.get(navIndex) * $.get(itemHeight) + $.get(itemHeight);

					if (!isTargetVisibleTop) {
						$.get(list).scrollTop = $.get(navIndex) * $.get(itemHeight);
						$.set(scrollTop, $.get(list).scrollTop, true);
					} else if (!isTargetVisibleBottom) {
						scrollToVirtualized($.get(navIndex));
					}
				} else {
					scrollToVirtualized($.get(navIndex));
				}
			}
		});
	};

	const selectItem = (ev) => {
		if (ev) ev.stopPropagation();

		let nextValue;
		const nextId = items()[$.get(navIndex)]?.id;

		if ($$props.multiselect) {
			if ($$props.value.includes(nextId)) {
				nextValue = $$props.value.filter((i) => i !== nextId);
			} else {
				nextValue = [...$$props.value, nextId];
			}
		} else {
			nextValue = nextId;
		}

		$$props.onselect && $$props.onselect({ id: nextValue });
	};

	const displayedItemsCount = $.derived(() => Math.ceil($.get(list)?.clientHeight / $.get(itemHeight)));

	const visibleRange = $.derived(() => {
		if (!virtualized()) return { start: 0, end: items().length };
		if (!items().length) return { start: 0, end: 0 };

		const start = Math.floor($.get(scrollTop) / $.get(itemHeight));
		const end = start + $.get(displayedItemsCount);

		return {
			start: Math.max(0, start - overscan),
			end: Math.min(items().length, end + overscan)
		};
	});

	const visibleItems = $.derived(() => {
		if (!virtualized()) return items();

		const { start, end } = $.get(visibleRange);

		return items().slice(start, end).map((item) => ({ ...item }));
	});

	const offsetTop = $.derived(() => $.get(visibleRange).start * $.get(itemHeight));
	const totalHeight = $.derived(() => items().length * $.get(itemHeight));

	const handleScroll = (ev) => {
		if (virtualized()) {
			$.set(scrollTop, ev.target.scrollTop, true);
		}
	};

	$.user_effect(() => {
		if (!isItemHeightInitialized) {
			const renderedItemHeight = $.get(firstItem)?.clientHeight;

			if (renderedItemHeight) {
				$.set(itemHeight, renderedItemHeight, true);
				isItemHeightInitialized = true;
			}
		}
	});

	$.user_effect(() => {
		init($.get(list), items(), (i) => $.set(navIndex, i, true), selectItem, virtualized(), scrollToVirtualized);
	});

	$.user_effect(() => {
		items();

		if (virtualized()) $.set(scrollTop, 0);
	});

	onMount(() => {
		$$props.onready && $$props.onready({
			navigate: virtualized() ? navigateVirtualized : navigate,
			keydown: virtualized() ? keydownVirtualized : keydown,
			move
		});
	});

	var fragment_6 = $.comment();
	var node_7 = $.first_child(fragment_6);

	{
		var consequent_5 = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_8 = $.first_child(fragment_7);

			$.key(node_8, items, ($$anchor) => {
				Dropdown($$anchor, $.spread_props({ oncancel: () => navigate(null) }, () => rest, {
					children: ($$anchor, $$slotProps) => {
						var div_2 = root_4();
						var node_9 = $.child(div_2);

						{
							var consequent_4 = ($$anchor) => {
								var fragment_9 = $.comment();
								var node_10 = $.first_child(fragment_9);

								{
									var consequent_3 = ($$anchor) => {
										var div_3 = root_2();
										var div_4 = $.child(div_3);
										var node_11 = $.child(div_4);

										listContent(node_11);
										$.reset(div_4);
										$.reset(div_3);

										$.template_effect(() => {
											$.set_style(div_3, `height: ${$.get(totalHeight)}px;`);
											$.set_style(div_4, `transform: translateY(${$.get(offsetTop)}px);`);
										});

										$.append($$anchor, div_3);
									};

									var alternate_2 = ($$anchor) => {
										listContent($$anchor);
									};

									$.if(node_10, ($$render) => {
										if (virtualized()) $$render(consequent_3); else $$render(alternate_2, -1);
									});
								}

								$.append($$anchor, fragment_9);
							};

							var alternate_3 = ($$anchor) => {
								var div_5 = root_3();
								var text_1 = $.only_child(div_5, true);

								$.template_effect(($0) => $.set_text(text_1, $0), [() => _("No data")]);
								$.append($$anchor, div_5);
							};

							$.if(node_9, ($$render) => {
								if (items().length) $$render(consequent_4); else $$render(alternate_3, -1);
							});
						}

						$.reset(div_2);
						$.bind_this(div_2, ($$value) => $.set(list, $$value), () => $.get(list));
						$.delegated('click', div_2, selectItem);
						$.delegated('mousemove', div_2, move);
						$.event('scroll', div_2, handleScroll);
						$.append($$anchor, div_2);
					},
					$$slots: { default: true }
				}));
			});

			$.append($$anchor, fragment_7);
		};

		$.if(node_7, ($$render) => {
			if ($.get(navIndex) !== null) $$render(consequent_5);
		});
	}

	$.append($$anchor, fragment_6);
	$.pop();
}

$.delegate(['click', 'mousemove']);