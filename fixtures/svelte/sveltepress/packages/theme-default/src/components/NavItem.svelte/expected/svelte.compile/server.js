import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import External from './icons/External.svelte';
import NavArrowDown from './icons/NavArrowDown.svelte';
import Self from './NavItem.svelte';
import { getPathFromBase } from './utils';

export default function NavItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {object} Props
		 * @property {string} [title] - Link title
		 * @property {string} [to] - Link URL
		 * @property {any} [items] - Submenu items
		 * @property {string | boolean} [icon] - Icon
		 * @property {boolean} [external] - Whether the link is external
		 * @property {boolean} [builtInIcon] - Whether the icon is built-in
		 * @property {boolean} [brand] - Whether the item is the brand logo (no active indicator)
		 * @property {import('svelte').Snippet} [children] - Children content
		 */
		/** @type {Props & { [key: string]: any }} */
		const {
			title = '',
			to = '/',
			items = [],
			icon = false,
			external = false,
			builtInIcon = false,
			brand = false,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const normalizedTo = to.endsWith('/') ? to.slice(0, -1) : to;
		const isExactMatch = (p) => p === to;
		const isChildMatch = (p) => p.startsWith(`${normalizedTo}/`);
		let active = $.derived(() => isExactMatch(page.url.pathname) || isChildMatch(page.url.pathname));

		// eslint-disable-next-line no-unused-expressions
		rest;

		if (items && items.length) {
			$$renderer.push(`<!--[0--><div${$.attr_class('nav-item svelte-tmo9uq', void 0, {
				'built-in-icon': builtInIcon,
				'nav-item--icon': icon,
				'nav-item--user-icon': icon
			})} role="link"${$.attr('aria-label', title)}>`);

			if (typeof icon === 'string') {
				$$renderer.push(`<!--[0-->${$.html(icon)}`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(title)} <div class="arrow svelte-tmo9uq">`);
				NavArrowDown($$renderer, {});
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--> <div class="dropdown svelte-tmo9uq"><!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let subItem = each_array[$$index];

				Self($$renderer, $.spread_props([subItem]));
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attributes(
				{
					href: external ? to : getPathFromBase(to),
					class: 'nav-item',
					...external ? { target: '_blank' } : {},
					'aria-label': title
				},
				'svelte-tmo9uq',
				{ 'nav-item--icon': icon, active, brand }
			)}>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');

				if (typeof icon === 'string') {
					$$renderer.push(`<!--[0-->${$.html(icon)}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(title)}`);
				}

				$$renderer.push(`<!--]--> `);

				if (external) {
					$$renderer.push('<!--[0-->');
					External($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></a>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}