import * as $ from 'svelte/internal/server';
import { TOP_NAV, aboutPages, legalPages, SUB_NAV, STANDALONE_PAGES } from '$lib/constants/nav';
import { resolve } from '$app/paths';
import Icon from '$lib/components/global/Icon.svelte';

function nodeLink($$renderer, node) {
	const title = node.description || node.label;
	const ariaLabel = node.description ? `${node.label}: ${node.description}` : node.label;

	if (node.href) {
		$$renderer.push('<!--[0-->');

		if (node.icon) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: node.icon, size: 'xs' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <a${$.attr('href', node.href)}${$.attr('title', title)}${$.attr('aria-label', ariaLabel)} class="svelte-1yxsx9d">${$.escape(node.label)}</a>`);
	} else {
		$$renderer.push(`<!--[-1--><span${$.attr_class($.clsx(node.children.length ? 'section-title' : 'group-title'), 'svelte-1yxsx9d')}${$.attr('title', title)}${$.attr('aria-label', ariaLabel)}>${$.escape(node.label)}</span>`);
	}

	$$renderer.push(`<!--]-->`);
}

function treeNode($$renderer, node, level = 0) {
	if (node.children.length > 0) {
		$$renderer.push(`<!--[0--><details open="" class="svelte-1yxsx9d"><summary class="svelte-1yxsx9d">`);
		nodeLink($$renderer, node);
		$$renderer.push(`<!----></summary> <ul class="svelte-1yxsx9d"><!--[-->`);

		const each_array = $.ensure_array_like(node.children);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let child = each_array[$$index];

			$$renderer.push(`<li class="svelte-1yxsx9d">`);

			if (child.children.length > 0) {
				$$renderer.push('<!--[0-->');
				treeNode($$renderer, child, level + 1);
			} else {
				$$renderer.push('<!--[-1-->');
				nodeLink($$renderer, child);
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ul></details>`);
	} else {
		$$renderer.push('<!--[-1-->');
		nodeLink($$renderer, node);
	}

	$$renderer.push(`<!--]-->`);
}

export default function SiteMapList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { homeMode = false } = $$props;

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

		$$renderer.push(`<div class="sitemap-page card svelte-1yxsx9d"><h1 class="svelte-1yxsx9d">${$.escape(homeMode ? 'Networking Toolbox' : 'Site Map')}</h1> `);

		if (!homeMode) {
			$$renderer.push(`<!--[0--><p>Site-wide page listing.<br/> For machine-readable version, see <a class="xml-link svelte-1yxsx9d"${$.attr('href', resolve('/sitemap.xml'))}>sitemap.xml</a></p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="tree svelte-1yxsx9d"><!--[-->`);

		const each_array_1 = $.ensure_array_like(siteTree);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let node = each_array_1[$$index_1];

			treeNode($$renderer, node);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}