import * as $ from 'svelte/internal/server';
import { setContext, tick } from 'svelte';
import { flip } from 'svelte/animate';
import { cubicInOut } from 'svelte/easing';
import { writable } from 'svelte/store';
import { crossfade } from 'svelte/transition';

export const activeNameContextKey = Symbol('activeTab');
export const itemsKey = Symbol('items');

export default function Tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const items = writable([]);
		let tabContainer = void 0;
		let itemWidthArray = [];

		/**
		 * @typedef {object} Props
		 * @property {any} activeName - Active tab name
		 * @property {boolean} [bodyPadding] - Whether to add padding to the body
		 * @property {import('svelte').Snippet} [children] - Children content
		 */
		/** @type {Props} */
		const { activeName, bodyPadding = true, children } = $$props;

		const current = writable(activeName);

		setContext(activeNameContextKey, current);
		setContext(itemsKey, items);

		function toggleTab(name) {
			$.store_set(current, name);
		}

		const [send, receive] = crossfade({
			fallback(node) {
				const style = getComputedStyle(node);
				const transform = style.transform === 'none' ? '' : style.transform;

				return {
					duration: 500,
					easing: cubicInOut,
					css: (t) => `
          transform: ${transform};
          opacity: ${t};
        `
				};
			}
		});

		function computedItems() {
			if (!tabContainer) return;

			itemWidthArray = [...tabContainer.querySelectorAll('.tab-header-item')].map((item) => ({
				left: item.offsetLeft,
				width: item.offsetWidth,
				name: item.dataset.tabName
			}));
		}

		$$renderer.push(`<div class="svp-tab svelte-st05z8"><div class="tab-header svelte-st05z8" style="--bar-op:0;"><!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$items', items));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { name, activeIcon, inactiveIcon } = each_array[$$index];
			const active = $.store_get($$store_subs ??= {}, '$current', current) === name;

			$$renderer.push(`<div${$.attr_class('tab-header-item svelte-st05z8', void 0, { 'active': active })}${$.attr('data-tab-name', name)} role="tab" tabindex="0">`);

			if (active) {
				$$renderer.push('<!--[0-->');

				if (activeIcon) {
					$$renderer.push('<!--[0-->');

					const SvelteComponent = activeIcon;

					if (SvelteComponent) {
						$$renderer.push('<!--[-->');
						SvelteComponent($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else if (inactiveIcon) {
				$$renderer.push('<!--[1-->');

				const SvelteComponent_1 = inactiveIcon;

				if (SvelteComponent_1) {
					$$renderer.push('<!--[-->');
					SvelteComponent_1($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div${$.attr_class('svelte-st05z8', void 0, { 'name': active && activeIcon || !active && inactiveIcon })}>${$.escape(name)}</div></div>`);
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array_1 = $.ensure_array_like(itemWidthArray.filter((n) => n.name === $.store_get($$store_subs ??= {}, '$current', current)));

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let { width, left } = each_array_1[i];

			$$renderer.push(`<div class="active-bar svelte-st05z8"${$.attr_style(`--bar-width: ${width}px;--bar-left: ${left}px;`)}></div>`);
		}

		$$renderer.push(`<!--]--></div> <div${$.attr_class('svelte-st05z8', void 0, { 'padding': bodyPadding })}><div class="tab-body svelte-st05z8">`);
		children?.($$renderer);
		$$renderer.push(`<!----></div></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}