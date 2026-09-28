import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import External from './icons/External.svelte';
import NavArrowDown from './icons/NavArrowDown.svelte';
import Self from './NavItem.svelte';
import { getPathFromBase } from './utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'title',
	'to',
	'items',
	'icon',
	'external',
	'builtInIcon',
	'brand',
	'children'
]);

var root = $.from_html(` <div class="arrow svelte-tmo9uq"><!></div>`, 1);
var root_1 = $.from_html(`<div role="link"><!> <div class="dropdown svelte-tmo9uq"></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<a><!></a>`);

export default function NavItem($$anchor, $$props) {
	$.push($$props, true);

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
	const title = $.prop($$props, 'title', 3, ''),
		to = $.prop($$props, 'to', 3, '/'),
		items = $.prop($$props, 'items', 19, () => []),
		icon = $.prop($$props, 'icon', 3, false),
		external = $.prop($$props, 'external', 3, false),
		builtInIcon = $.prop($$props, 'builtInIcon', 3, false),
		brand = $.prop($$props, 'brand', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	const normalizedTo = to().endsWith('/') ? to().slice(0, -1) : to();
	const isExactMatch = (p) => p === to();
	const isChildMatch = (p) => p.startsWith(`${normalizedTo}/`);
	let active = $.derived(() => isExactMatch(page.url.pathname) || isChildMatch(page.url.pathname));

	// eslint-disable-next-line no-unused-expressions
	rest;

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			let classes;
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.html(node_2, icon);
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var fragment_2 = root();
					var text = $.first_child(fragment_2);
					var div_1 = $.sibling(text);
					var node_3 = $.child(div_1);

					NavArrowDown(node_3, {});
					$.reset(div_1);
					$.template_effect(() => $.set_text(text, `${title() ?? ''} `));
					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if (typeof icon() === 'string') $$render(consequent); else $$render(alternate, -1);
				});
			}

			var div_2 = $.sibling(node_1, 2);

			$.each(div_2, 21, items, $.index, ($$anchor, subItem) => {
				Self($$anchor, $.spread_props(() => $.get(subItem)));
			});

			$.reset(div_2);
			$.reset(div);

			$.template_effect(() => {
				classes = $.set_class(div, 1, 'nav-item svelte-tmo9uq', null, classes, {
					'built-in-icon': builtInIcon(),
					'nav-item--icon': icon(),
					'nav-item--user-icon': icon()
				});

				$.set_attribute(div, 'aria-label', title());
			});

			$.append($$anchor, div);
		};

		var alternate_3 = ($$anchor) => {
			var a = root_3();

			$.attribute_effect(
				a,
				($0) => ({
					href: $0,
					class: 'nav-item',
					...external() ? { target: '_blank' } : {},
					'aria-label': title(),
					[$.CLASS]: {
						'nav-item--icon': icon(),
						active: $.get(active),
						brand: brand()
					}
				}),
				[() => external() ? to() : getPathFromBase(to())],
				void 0,
				void 0,
				'svelte-tmo9uq'
			);

			var node_4 = $.child(a);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_5 = $.first_child(fragment_4);

					$.snippet(node_5, () => $$props.children);
					$.append($$anchor, fragment_4);
				};

				var alternate_2 = ($$anchor) => {
					var fragment_5 = root_2();
					var node_6 = $.first_child(fragment_5);

					{
						var consequent_3 = ($$anchor) => {
							var fragment_6 = $.comment();
							var node_7 = $.first_child(fragment_6);

							$.html(node_7, icon);
							$.append($$anchor, fragment_6);
						};

						var alternate_1 = ($$anchor) => {
							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, title()));
							$.append($$anchor, text_1);
						};

						$.if(node_6, ($$render) => {
							if (typeof icon() === 'string') $$render(consequent_3); else $$render(alternate_1, -1);
						});
					}

					var node_8 = $.sibling(node_6, 2);

					{
						var consequent_4 = ($$anchor) => {
							External($$anchor, {});
						};

						$.if(node_8, ($$render) => {
							if (external()) $$render(consequent_4);
						});
					}

					$.append($$anchor, fragment_5);
				};

				$.if(node_4, ($$render) => {
					if ($$props.children) $$render(consequent_2); else $$render(alternate_2, -1);
				});
			}

			$.reset(a);
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if (items() && items().length) $$render(consequent_1); else $$render(alternate_3, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}