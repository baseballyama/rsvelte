import * as $ from 'svelte/internal/server';
import { onMount, getContext, tick } from "svelte";
import { getListHandlers } from "./listnav.js";
import Dropdown from "../Dropdown.svelte";
import { defaultLocale } from "./locale";
import { setID } from "@svar-ui/lib-dom";
import Checkbox from "../Checkbox.svelte";

export default function SuggestDropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items = [],
			children,
			onselect,
			onready,
			virtualized = false,
			checkboxes,
			multiselect,
			value,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const overscan = 3;
		let list = void 0;
		let firstItem = void 0;
		let navIndex = null;
		let scrollTop = 0;
		let itemHeight = 24;
		let isItemHeightInitialized = false;
		const _ = (getContext("wx-i18n") || defaultLocale()).getGroup("core");
		const { move, keydown, init, navigate } = getListHandlers();

		const scrollToVirtualized = (navIndex) => {
			if (list) {
				list.scrollTop = navIndex * itemHeight - list.clientHeight + itemHeight;
				scrollTop = list.scrollTop;
			}
		};

		const navigateVirtualized = (dir, ev) => {
			navigate(dir, ev);

			tick().then(() => {
				scrollToVirtualized(navIndex);
			});
		};

		const keydownVirtualized = (ev, dir) => {
			if (navIndex !== 0 && navIndex !== items.length - 1 && (ev.key == "ArrowDown" || ev.key == "ArrowUp")) ev.preventDefault();

			keydown(ev, dir);

			tick().then(() => {
				if (list) {
					const isInRange = visibleItems().find((item) => item.id === navIndex);

					if (isInRange) {
						const isTargetVisibleTop = list.scrollTop <= navIndex * itemHeight;
						const isTargetVisibleBottom = list.scrollTop + list.clientHeight >= navIndex * itemHeight + itemHeight;

						if (!isTargetVisibleTop) {
							list.scrollTop = navIndex * itemHeight;
							scrollTop = list.scrollTop;
						} else if (!isTargetVisibleBottom) {
							scrollToVirtualized(navIndex);
						}
					} else {
						scrollToVirtualized(navIndex);
					}
				}
			});
		};

		const selectItem = (ev) => {
			if (ev) ev.stopPropagation();

			let nextValue;
			const nextId = items[navIndex]?.id;

			if (multiselect) {
				if (value.includes(nextId)) {
					nextValue = value.filter((i) => i !== nextId);
				} else {
					nextValue = [...value, nextId];
				}
			} else {
				nextValue = nextId;
			}

			onselect && onselect({ id: nextValue });
		};

		const displayedItemsCount = $.derived(() => Math.ceil(list?.clientHeight / itemHeight));

		const visibleRange = $.derived(() => {
			if (!virtualized) return { start: 0, end: items.length };
			if (!items.length) return { start: 0, end: 0 };

			const start = Math.floor(scrollTop / itemHeight);
			const end = start + displayedItemsCount();

			return {
				start: Math.max(0, start - overscan),
				end: Math.min(items.length, end + overscan)
			};
		});

		const visibleItems = $.derived(() => {
			if (!virtualized) return items;

			const { start, end } = visibleRange();

			return items.slice(start, end).map((item) => ({ ...item }));
		});

		const offsetTop = $.derived(() => visibleRange().start * itemHeight);
		const totalHeight = $.derived(() => items.length * itemHeight);

		const handleScroll = (ev) => {
			if (virtualized) {
				scrollTop = ev.target.scrollTop;
			}
		};

		onMount(() => {
			onready && onready({
				navigate: virtualized ? navigateVirtualized : navigate,
				keydown: virtualized ? keydownVirtualized : keydown,
				move
			});
		});

		function itemContent($$renderer, { data }) {
			if (checkboxes) {
				$$renderer.push('<!--[0-->');

				Checkbox($$renderer, {
					css: 'wx-list-checkbox',
					name: data.id,
					value: value && value.includes(data.id)
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer, { option: data });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(data.label)}`);
			}

			$$renderer.push(`<!--]-->`);
		}

		function listContent($$renderer) {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(visibleItems());

			for (let visibleIndex = 0, $$length = each_array.length; visibleIndex < $$length; visibleIndex++) {
				let data = each_array[visibleIndex];

				if (visibleIndex + visibleRange().start === 0) {
					$$renderer.push(`<!--[0--><div${$.attr_class('wx-item svelte-19gmo0j', void 0, { 'wx-focus': visibleIndex + visibleRange().start === navIndex })}${$.attr('data-id', setID(data.id))}>`);
					itemContent($$renderer, { data });
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div${$.attr_class('wx-item svelte-19gmo0j', void 0, { 'wx-focus': visibleIndex + visibleRange().start === navIndex })}${$.attr('data-id', setID(data.id))}>`);
					itemContent($$renderer, { data });
					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		}

		if (navIndex !== null) {
			$$renderer.push(`<!--[0--><!---->`);

			{
				Dropdown($$renderer, $.spread_props([
					{ oncancel: () => navigate(null) },
					rest,
					{
						children: ($$renderer) => {
							$$renderer.push(`<div class="wx-list svelte-19gmo0j">`);

							if (items.length) {
								$$renderer.push('<!--[0-->');

								if (virtualized) {
									$$renderer.push(`<!--[0--><div class="wx-list-wrapper svelte-19gmo0j"${$.attr_style(`height: ${totalHeight()}px;`)}><div class="wx-list-content svelte-19gmo0j"${$.attr_style(`transform: translateY(${offsetTop()}px);`)}>`);
									listContent($$renderer);
									$$renderer.push(`<!----></div></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
									listContent($$renderer);
								}

								$$renderer.push(`<!--]-->`);
							} else {
								$$renderer.push(`<!--[-1--><div class="wx-no-data svelte-19gmo0j">${$.escape(_("No data"))}</div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						},
						$$slots: { default: true }
					}
				]));
			}

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}