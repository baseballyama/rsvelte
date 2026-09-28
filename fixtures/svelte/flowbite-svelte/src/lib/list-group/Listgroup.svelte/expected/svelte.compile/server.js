import * as $ from 'svelte/internal/server';
import { listGroup } from "./theme";
import clsx from "clsx";
import ListgroupItem from "./ListgroupItem.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import { setListGroupContext } from "$lib/context";

export default function Listgroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			items,
			active,
			onclick,
			horizontal,
			rounded,
			border,
			class: className,
			itemClass,
			iconClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("listGroup"));
		const base = $.derived(() => listGroup({ rounded, border, horizontal, class: clsx(theme(), className) }));
		let tag = $.derived(() => active ? "div" : "ul");

		// Create reactive context using getters
		const context = {
			get active() {
				return active;
			},

			get horizontal() {
				return horizontal;
			}
		};

		setListGroupContext(context);

		function createItemClickHandler() {
			return function (event) {
				if (onclick) {
					onclick(event);
				}
			};
		}

		$.element(
			$$renderer,
			tag(),
			() => {
				$$renderer.push(`${$.attributes({ ...restProps, class: $.clsx(base()) })}`);
			},
			() => {
				if (items?.length) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array = $.ensure_array_like(items);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let item = each_array[i];

						if (children) {
							$$renderer.push('<!--[0-->');
							children($$renderer, item);
							$$renderer.push(`<!---->`);
						} else if (typeof item === "string") {
							$$renderer.push('<!--[1-->');

							ListgroupItem($$renderer, {
								href: undefined,
								class: clsx(itemClass),
								iconClass: clsx(iconClass),
								active,
								horizontal,
								onclick: createItemClickHandler(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(item)}`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');

							ListgroupItem($$renderer, $.spread_props([
								{
									href: item.href,
									class: clsx(itemClass),
									iconClass: clsx(iconClass),
									active,
									horizontal
								},
								item,
								{ onclick: item.onclick ?? createItemClickHandler() }
							]));
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
					children?.($$renderer, items?.[0] ?? "");
					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]-->`);
			}
		);
	});
}