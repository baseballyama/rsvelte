import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { slide } from 'svelte/transition';
import ArrowDown from './icons/ArrowDown.svelte';
import Link from './Link.svelte';
import SidebarGroup from './SidebarGroup.svelte';
import { isLinkActive } from './utils';

var root = $.from_html(`<div class="collapse-control svelte-145wssf" role="button" tabindex="0" aria-label="Collapsable button"><div><!></div></div>`);
var root_1 = $.from_html(`<div class="links svelte-145wssf"></div>`);
var root_2 = $.from_html(`<div><div><div> </div> <!></div> <!></div>`);

export default function SidebarGroup_1($$anchor, $$props) {
	$.push($$props, true);

	const routeId = $.derived(() => page.route.id);

	/**
	 * @typedef {object} Props
	 * @property {any} [items] - Sidebar items
	 * @property {string} [title] - Sidebar title
	 * @property {boolean} [collapsible] - Whether the sidebar is collapsible
	 * @property {boolean} [nested] - Whether the sidebar is nested
	 */
	/** @type {Props} */
	const items = $.prop($$props, 'items', 19, () => []),
		title = $.prop($$props, 'title', 3, ''),
		collapsible = $.prop($$props, 'collapsible', 3, false),
		nested = $.prop($$props, 'nested', 3, false);

	let collapsed = $.state(false);

	function handleToggle() {
		$.set(collapsed, !$.get(collapsed));
	}

	var div = root_2();
	let classes;
	var div_1 = $.child(div);
	let classes_1;
	var div_2 = $.child(div_1);
	var text = $.only_child(div_2, true);
	var node = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();
			var div_4 = $.child(div_3);
			let classes_2;
			var node_1 = $.child(div_4);

			ArrowDown(node_1, {});
			$.reset(div_4);
			$.reset(div_3);
			$.template_effect(() => classes_2 = $.set_class(div_4, 1, 'arrow svelte-145wssf', null, classes_2, { collapsed: $.get(collapsed) }));
			$.delegated('click', div_3, handleToggle);
			$.event('keypress', div_3, handleToggle);
			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if (collapsible()) $$render(consequent);
		});
	}

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_5 = root_1();

			$.each(div_5, 21, items, $.index, ($$anchor, item) => {
				const active = $.derived(() => isLinkActive($.get(item).to, $.get(routeId)));
				var fragment = $.comment();
				var node_3 = $.first_child(fragment);

				{
					var consequent_1 = ($$anchor) => {
						SidebarGroup($$anchor, $.spread_props(() => $.get(item), { nested: true }));
					};

					var d = $.derived(() => Array.isArray($.get(item).items) && $.get(item).items.length);

					var alternate = ($$anchor) => {
						Link($$anchor, {
							get to() {
								return $.get(item).to;
							},

							get active() {
								return $.get(active);
							},

							get label() {
								return $.get(item).title;
							},
							inline: false,
							highlight: false
						});
					};

					$.if(node_3, ($$render) => {
						if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment);
			});

			$.reset(div_5);
			$.transition(3, div_5, () => slide);
			$.append($$anchor, div_5);
		};

		$.if(node_2, ($$render) => {
			if (!$.get(collapsed)) $$render(consequent_2);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'sidebar-group svelte-145wssf', null, classes, { nested: nested() });
		classes_1 = $.set_class(div_1, 1, 'group-title svelte-145wssf', null, classes_1, { 'with-mb': !nested() });
		$.set_text(text, title());
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);