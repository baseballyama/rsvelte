import * as $ from 'svelte/internal/server';
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import { base } from "$app/paths";

export default function DocsSidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { config, currentSlug, onNavigate } = $$props;

		// Find the group containing the current page (for collapsible groups)
		let initialGroup = $.derived(() => {
			for (const group of config.sidebar) {
				if (group.collapsible && group.pages.some((p) => p.slug === currentSlug || p.pages?.some((sp) => sp.slug === currentSlug))) {
					return group.group;
				}
			}

			return null;
		});

		// Find parent pages that should be expanded based on current slug
		let initialExpandedPages = $.derived(() => {
			const expanded = [];

			for (const group of config.sidebar) {
				for (const page of group.pages) {
					// Expand if current page is the parent OR if current page is a nested page
					if (page.pages && page.pages.length > 0) {
						if (page.slug === currentSlug || page.pages.some((sp) => sp.slug === currentSlug)) {
							expanded.push(page.slug);
						}
					}
				}
			}

			return expanded;
		});

		let expandedGroups = [];
		let expandedPages = [];
		let prevSlug = "";

		// Auto-expand when navigating to a different page (not when manually toggling)
		// Slug changed, do auto-expansion
		function toggleGroup(groupName) {
			if (expandedGroups.includes(groupName)) {
				expandedGroups = expandedGroups.filter((g) => g !== groupName);
			} else {
				expandedGroups = [...expandedGroups, groupName];
			}
		}

		function togglePage(pageSlug) {
			if (expandedPages.includes(pageSlug)) {
				expandedPages = expandedPages.filter((p) => p !== pageSlug);
			} else {
				expandedPages = [...expandedPages, pageSlug];
			}
		}

		function isExpanded(group) {
			// Non-collapsible groups are always expanded
			if (!group.collapsible) return true;

			return expandedGroups.includes(group.group);
		}

		function isPageExpanded(page) {
			return expandedPages.includes(page.slug);
		}

		function isActiveSlug(slug) {
			return currentSlug === slug;
		}

		function handleLinkClick() {
			onNavigate?.();
		}

		function getHref(slug) {
			if (!config.activeVersion) {
				return `${base}/docs/${slug}`;
			}

			if (slug.startsWith(`${config.activeVersion}/`)) {
				return `${base}/docs/${slug}`;
			}

			return `${base}/docs/${config.activeVersion}/${slug}`;
		}

		$$renderer.push(`<nav class="p-6 pr-4 pl-4"><div class="scrollbar-hidden flex flex-col gap-6"><!--[-->`);

		const each_array = $.ensure_array_like(config.sidebar);

		for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
			let group = each_array[$$index_2];

			$$renderer.push(`<div class="mb-2">`);

			if (group.collapsible) {
				$$renderer.push(`<!--[0--><button class="text-foreground hover:text-accent-foreground flex w-full cursor-pointer items-center justify-start gap-2 rounded border-none bg-transparent px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-all duration-200"${$.attr('aria-expanded', isExpanded(group))}><span>${$.escape(group.group)}</span> `);

				if (isExpanded(group)) {
					$$renderer.push('<!--[0-->');
					ChevronDown($$renderer, { class: 'h-3.5 w-3.5' });
				} else {
					$$renderer.push('<!--[-1-->');
					ChevronRight($$renderer, { class: 'h-3.5 w-3.5' });
				}

				$$renderer.push(`<!--]--></button>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="text-foreground flex w-full items-center justify-between px-3 py-0 text-xs font-semibold tracking-wide uppercase"><span>${$.escape(group.group)}</span></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (isExpanded(group)) {
				$$renderer.push(`<!--[0--><ul class="mt-1 list-none p-0"><!--[-->`);

				const each_array_1 = $.ensure_array_like(group.pages);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let docPage = each_array_1[$$index_1];

					$$renderer.push(`<li>`);

					if (docPage.pages && docPage.pages.length > 0) {
						$$renderer.push(`<!--[0--><button${$.attr_class('text-muted-foreground hover:text-accent-foreground flex w-full cursor-pointer items-center justify-start gap-2 rounded border-none bg-transparent px-3 py-1 text-left text-sm transition-all duration-200 svelte-1axxmcs', void 0, { 'active': isActiveSlug(docPage.slug) })}${$.attr('aria-expanded', isPageExpanded(docPage))}><span class="truncate">${$.escape(docPage.title)}</span> `);

						if (isPageExpanded(docPage)) {
							$$renderer.push('<!--[0-->');
							ChevronDown($$renderer, { class: 'h-3.5 w-3.5 shrink-0' });
						} else {
							$$renderer.push('<!--[-1-->');
							ChevronRight($$renderer, { class: 'h-3.5 w-3.5 shrink-0' });
						}

						$$renderer.push(`<!--]--></button> `);

						if (isPageExpanded(docPage)) {
							$$renderer.push(`<!--[0--><ul class="mt-1 ml-3 list-none p-0 pl-1"><!--[-->`);

							const each_array_2 = $.ensure_array_like(docPage.pages);

							for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
								let nestedPage = each_array_2[$$index];

								$$renderer.push(`<li><a${$.attr('href', getHref(nestedPage.slug))}${$.attr_class('text-muted-foreground hover:text-accent-foreground block truncate rounded px-3 py-1 text-sm no-underline transition-all duration-200 svelte-1axxmcs', void 0, { 'active': isActiveSlug(nestedPage.slug) })}>${$.escape(nestedPage.title)}</a></li>`);
							}

							$$renderer.push(`<!--]--></ul>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><a${$.attr('href', getHref(docPage.slug))}${$.attr_class('text-muted-foreground hover:text-accent-foreground block truncate rounded px-3 py-1 text-sm no-underline transition-all duration-200 svelte-1axxmcs', void 0, { 'active': isActiveSlug(docPage.slug) })}>${$.escape(docPage.title)}</a>`);
					}

					$$renderer.push(`<!--]--></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></nav>`);
	});
}