import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { slide } from 'svelte/transition';
import ArrowDown from './icons/ArrowDown.svelte';
import Link from './Link.svelte';
import SidebarGroup from './SidebarGroup.svelte';
import { isLinkActive } from './utils';

export default function SidebarGroup_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const routeId = $.derived(() => page.route.id);

		/**
		 * @typedef {object} Props
		 * @property {any} [items] - Sidebar items
		 * @property {string} [title] - Sidebar title
		 * @property {boolean} [collapsible] - Whether the sidebar is collapsible
		 * @property {boolean} [nested] - Whether the sidebar is nested
		 */
		/** @type {Props} */
		const { items = [], title = '', collapsible = false, nested = false } = $$props;

		let collapsed = false;

		function handleToggle() {
			collapsed = !collapsed;
		}

		$$renderer.push(`<div${$.attr_class('sidebar-group svelte-145wssf', void 0, { 'nested': nested })}><div${$.attr_class('group-title svelte-145wssf', void 0, { 'with-mb': !nested })}><div>${$.escape(title)}</div> `);

		if (collapsible) {
			$$renderer.push(`<!--[0--><div class="collapse-control svelte-145wssf" role="button" tabindex="0" aria-label="Collapsable button"><div${$.attr_class('arrow svelte-145wssf', void 0, { 'collapsed': collapsed })}>`);
			ArrowDown($$renderer, {});
			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!collapsed) {
			$$renderer.push(`<!--[0--><div class="links svelte-145wssf"><!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				const active = isLinkActive(item.to, routeId());

				if (Array.isArray(item.items) && item.items.length) {
					$$renderer.push('<!--[0-->');
					SidebarGroup($$renderer, $.spread_props([item, { nested: true }]));
				} else {
					$$renderer.push('<!--[-1-->');

					Link($$renderer, {
						to: item.to,
						active,
						label: item.title,
						inline: false,
						highlight: false
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}