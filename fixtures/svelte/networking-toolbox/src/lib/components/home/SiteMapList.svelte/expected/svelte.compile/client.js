import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TOP_NAV, aboutPages, legalPages, SUB_NAV, STANDALONE_PAGES } from '$lib/constants/nav';
import { resolve } from '$app/paths';
import Icon from '$lib/components/global/Icon.svelte';

const nodeLink = ($$anchor, node = $.noop) => {
	const title = $.derived(() => node().description || node().label);

	const ariaLabel = $.derived(() => node().description
		? `${node().label}: ${node().description}`
		: node().label);

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Icon($$anchor, {
						get name() {
							return node().icon;
						},
						size: 'xs'
					});
				};

				$.if(node_2, ($$render) => {
					if (node().icon) $$render(consequent);
				});
			}

			var a = $.sibling(node_2, 2);
			var text = $.only_child(a, true);

			$.template_effect(() => {
				$.set_attribute(a, 'href', node().href);
				$.set_attribute(a, 'title', $.get(title));
				$.set_attribute(a, 'aria-label', $.get(ariaLabel));
				$.set_text(text, node().label);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var span = root_1();
			var text_1 = $.only_child(span, true);

			$.template_effect(() => {
				$.set_class(span, 1, $.clsx(node().children.length ? 'section-title' : 'group-title'), 'svelte-1yxsx9d');
				$.set_attribute(span, 'title', $.get(title));
				$.set_attribute(span, 'aria-label', $.get(ariaLabel));
				$.set_text(text_1, node().label);
			});

			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if (node().href) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
};

const treeNode = ($$anchor, node = $.noop, $$arg1) => {
	let level = $.derived_safe_equal(() => $.fallback($$arg1?.(), 0));
	var fragment_3 = $.comment();
	var node_3 = $.first_child(fragment_3);

	{
		var consequent_3 = ($$anchor) => {
			var details = root_3();
			var summary = $.child(details);
			var node_4 = $.child(summary);

			nodeLink(node_4, node);
			$.reset(summary);

			var ul = $.sibling(summary, 2);

			$.each(ul, 21, () => node().children, (child) => child.label, ($$anchor, child) => {
				var li = root_2();
				var node_5 = $.child(li);

				{
					var consequent_2 = ($$anchor) => {
						treeNode($$anchor, () => $.get(child), () => $.get(level) + 1);
					};

					var alternate_1 = ($$anchor) => {
						nodeLink($$anchor, () => $.get(child));
					};

					$.if(node_5, ($$render) => {
						if ($.get(child).children.length > 0) $$render(consequent_2); else $$render(alternate_1, -1);
					});
				}

				$.reset(li);
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(details);
			$.append($$anchor, details);
		};

		var alternate_2 = ($$anchor) => {
			nodeLink($$anchor, node);
		};

		$.if(node_3, ($$render) => {
			if (node().children.length > 0) $$render(consequent_3); else $$render(alternate_2, -1);
		});
	}

	$.append($$anchor, fragment_3);
};

var root = $.from_html(`<!> <a class="svelte-1yxsx9d"> </a>`, 1);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<li class="svelte-1yxsx9d"><!></li>`);
var root_3 = $.from_html(`<details open="" class="svelte-1yxsx9d"><summary class="svelte-1yxsx9d"><!></summary> <ul class="svelte-1yxsx9d"></ul></details>`);
var root_4 = $.from_html(`<p>Site-wide page listing.<br/> For machine-readable version, see <a class="xml-link svelte-1yxsx9d">sitemap.xml</a></p>`);
var root_5 = $.from_html(`<div class="sitemap-page card svelte-1yxsx9d"><h1 class="svelte-1yxsx9d"> </h1> <!> <div class="tree svelte-1yxsx9d"></div></div>`);

export default function SiteMapList($$anchor, $$props) {
	$.push($$props, true);

	let homeMode = $.prop($$props, 'homeMode', 3, false);

	const mapToNode = (item) => ({
		label: 'label' in item ? item.label : item.title,
		href: 'href' in item ? item.href : null,
		description: item.description,
		icon: 'icon' in item ? item.icon : undefined,
		children: []
	});

	// Build tree structure from navigation data
	const siteTree = [
		...TOP_NAV.map((topItem) => {
			const section = mapToNode(topItem);
			const subNavData = SUB_NAV[topItem.href];

			if (subNavData) {
				section.children = subNavData.map((item) => {
					if ('items' in item) {
						// It's a NavGroup with items - might have an href for the category page
						const groupNode = mapToNode(item);

						groupNode.children = item.items.map(mapToNode);

						return groupNode;
					} else {
						// It's a NavItem
						return mapToNode(item);
					}
				});
			}

			return section;
		}),

		...STANDALONE_PAGES.length
			? [
				{
					label: 'Other Pages',
					href: resolve('/'),
					description: 'Additional tools and utilities',
					children: STANDALONE_PAGES.map(mapToNode)
				}
			]
			: [],

		...aboutPages.length
			? [
				{
					label: 'About',
					href: resolve('/about'),
					description: 'Information about the project and documentation',
					children: [
						...aboutPages.filter((page) => !page.href.includes('/about/legal/')).map(mapToNode),
						{
							label: 'Legal',
							href: resolve('/about/legal'),
							description: 'Legal documentation and policies',
							children: legalPages.map(mapToNode)
						}
					]
				}
			]
			: []
	];

	var div = root_5();
	var h1 = $.child(div);
	var text_2 = $.only_child(h1, true);
	var node_6 = $.sibling(h1, 2);

	{
		var consequent_4 = ($$anchor) => {
			var p = root_4();
			var a_1 = $.sibling($.child(p), 3);

			$.reset(p);
			$.template_effect(($0) => $.set_attribute(a_1, 'href', $0), [() => resolve('/sitemap.xml')]);
			$.append($$anchor, p);
		};

		$.if(node_6, ($$render) => {
			if (!homeMode()) $$render(consequent_4);
		});
	}

	var div_1 = $.sibling(node_6, 2);

	$.each(div_1, 21, () => siteTree, (node) => node.label, ($$anchor, node) => {
		treeNode($$anchor, () => $.get(node));
	});

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text_2, homeMode() ? 'Networking Toolbox' : 'Site Map'));
	$.append($$anchor, div);
	$.pop();
}