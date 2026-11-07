import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from 'svelte/transition';
import themeOptions from 'virtual:sveltepress/theme-default';
import Expansion from './Expansion.svelte';
import TocClose from './icons/TocClose.svelte';
import TocMenu from './icons/TocMenu.svelte';
import { navCollapsed } from './layout';
import Logo from './Logo.svelte';
import NavItem from './NavItem.svelte';

var root = $.from_html(`<div class="text-6"></div>`);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<nav class="navbar-mobile svelte-1axsvz0" aria-label="Menu"><!> <!></nav>`);
var root_3 = $.from_html(`<div class="nav-trigger svelte-1axsvz0" role="menu" tabindex="0"><!></div> <!>`, 1);

export default function NavbarMobile($$anchor, $$props) {
	$.push($$props, true);

	const $navCollapsed = () => $.store_get(navCollapsed, '$navCollapsed', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function toggleNav() {
		$.store_set(navCollapsed, !$navCollapsed());
	}

	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			TocMenu($$anchor, {});
		};

		var alternate = ($$anchor) => {
			TocClose($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($navCollapsed()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		var consequent_3 = ($$anchor) => {
			var nav = root_2();
			var node_2 = $.child(nav);

			Logo(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			$.each(node_3, 17, () => themeOptions.navbar, $.index, ($$anchor, navItem) => {
				var fragment_3 = $.comment();
				var node_4 = $.first_child(fragment_3);

				{
					var consequent_2 = ($$anchor) => {
						{
							const customTitle = ($$anchor) => {
								var div_1 = root_1();
								var node_5 = $.child(div_1);

								{
									var consequent_1 = ($$anchor) => {
										var div_2 = root();

										$.html(div_2, () => $.get(navItem).icon, true);
										$.reset(div_2);
										$.append($$anchor, div_2);
									};

									var alternate_1 = ($$anchor) => {
										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(navItem).title));
										$.append($$anchor, text);
									};

									$.if(node_5, ($$render) => {
										if ($.get(navItem).icon) $$render(consequent_1); else $$render(alternate_1, -1);
									});
								}

								$.reset(div_1);
								$.append($$anchor, div_1);
							};

							Expansion($$anchor, {
								get title() {
									return $.get(navItem).title;
								},
								showIcon: false,
								customTitle,
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_6 = $.first_child(fragment_6);

									$.each(node_6, 17, () => $.get(navItem).items, $.index, ($$anchor, subItem) => {
										NavItem($$anchor, $.spread_props(() => $.get(subItem)));
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { customTitle: true, default: true }
							});
						}
					};

					var alternate_2 = ($$anchor) => {
						NavItem($$anchor, $.spread_props(() => $.get(navItem)));
					};

					$.if(node_4, ($$render) => {
						if ($.get(navItem).items) $$render(consequent_2); else $$render(alternate_2, -1);
					});
				}

				$.append($$anchor, fragment_3);
			});

			$.reset(nav);
			$.transition(3, nav, () => slide);
			$.append($$anchor, nav);
		};

		$.if(node_1, ($$render) => {
			if (!$navCollapsed()) $$render(consequent_3);
		});
	}

	$.delegated('click', div, toggleNav);
	$.event('keypress', div, toggleNav);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);