import * as $ from 'svelte/internal/server';
import { onMount, getContext } from "svelte";
import { getListHandlers } from "../listnav";
import Dropdown from "../../Dropdown.svelte";

export default function Layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items = [], children, onselect, onready } = $$props;
		let list = void 0;
		let navIndex = null;
		const _ = getContext("wx-i18n").getGroup("core");
		const { move, keydown, init, navigate } = getListHandlers();

		const selectItem = (ev) => {
			if (ev) ev.stopPropagation();

			onselect && onselect({ id: items[navIndex]?.id });
		};

		onMount(() => {
			onready && onready({ navigate, keydown, move });
		});

		if (navIndex !== null) {
			$$renderer.push('<!--[0-->');

			Dropdown($$renderer, {
				oncancel: () => navigate(null),
				children: ($$renderer) => {
					$$renderer.push(`<div class="wx-list svelte-1y59czs">`);

					if (items.length) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							let data = each_array[index];

							$$renderer.push(`<div${$.attr_class('wx-item svelte-1y59czs', void 0, { 'wx-focus': index === navIndex })}${$.attr('data-id', data.id)}>`);

							if (children) {
								$$renderer.push('<!--[0-->');
								children($$renderer, { option: data });
								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(data.label)}`);
							}

							$$renderer.push(`<!--]--></div>`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><div class="wx-no-data svelte-1y59czs">${$.escape(_("No data"))}</div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}