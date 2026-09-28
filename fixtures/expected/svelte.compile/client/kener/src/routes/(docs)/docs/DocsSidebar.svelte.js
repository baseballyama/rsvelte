import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import { base } from "$app/paths";

var root = $.from_html(`<button class="text-foreground hover:text-accent-foreground flex w-full cursor-pointer items-center justify-start gap-2 rounded border-none bg-transparent px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-all duration-200"><span> </span> <!></button>`);
var root_1 = $.from_html(`<div class="text-foreground flex w-full items-center justify-between px-3 py-0 text-xs font-semibold tracking-wide uppercase"><span> </span></div>`);
var root_2 = $.from_html(`<li><a> </a></li>`);
var root_3 = $.from_html(`<ul class="  mt-1 ml-3 list-none p-0 pl-1"></ul>`);
var root_4 = $.from_html(`<button><span class="truncate"> </span> <!></button> <!>`, 1);
var root_5 = $.from_html(`<a> </a>`);
var root_6 = $.from_html(`<li><!></li>`);
var root_7 = $.from_html(`<ul class="mt-1 list-none p-0"></ul>`);
var root_8 = $.from_html(`<div class="mb-2"><!> <!></div>`);
var root_9 = $.from_html(`<nav class="p-6 pr-4 pl-4"><div class="scrollbar-hidden flex flex-col gap-6"></div></nav>`);

export default function DocsSidebar($$anchor, $$props) {
	$.push($$props, true);

	// Find the group containing the current page (for collapsible groups)
	let initialGroup = $.derived(() => {
		for (const group of $$props.config.sidebar) {
			if (group.collapsible && group.pages.some((p) => p.slug === $$props.currentSlug || p.pages?.some((sp) => sp.slug === $$props.currentSlug))) {
				return group.group;
			}
		}

		return null;
	});

	// Find parent pages that should be expanded based on current slug
	let initialExpandedPages = $.derived(() => {
		const expanded = [];

		for (const group of $$props.config.sidebar) {
			for (const page of group.pages) {
				// Expand if current page is the parent OR if current page is a nested page
				if (page.pages && page.pages.length > 0) {
					if (page.slug === $$props.currentSlug || page.pages.some((sp) => sp.slug === $$props.currentSlug)) {
						expanded.push(page.slug);
					}
				}
			}
		}

		return expanded;
	});

	let expandedGroups = $.state($.proxy([]));
	let expandedPages = $.state($.proxy([]));
	let prevSlug = $.state("");

	// Auto-expand when navigating to a different page (not when manually toggling)
	$.user_effect(() => {
		if ($$props.currentSlug !== $.get(prevSlug)) {
			// Slug changed, do auto-expansion
			if ($.get(initialGroup) && !$.get(expandedGroups).includes($.get(initialGroup))) {
				$.set(expandedGroups, [...$.get(expandedGroups), $.get(initialGroup)], true);
			}

			for (const slug of $.get(initialExpandedPages)) {
				if (!$.get(expandedPages).includes(slug)) {
					$.set(expandedPages, [...$.get(expandedPages), slug], true);
				}
			}

			$.set(prevSlug, $$props.currentSlug, true);
		}
	});

	function toggleGroup(groupName) {
		if ($.get(expandedGroups).includes(groupName)) {
			$.set(expandedGroups, $.get(expandedGroups).filter((g) => g !== groupName), true);
		} else {
			$.set(expandedGroups, [...$.get(expandedGroups), groupName], true);
		}
	}

	function togglePage(pageSlug) {
		if ($.get(expandedPages).includes(pageSlug)) {
			$.set(expandedPages, $.get(expandedPages).filter((p) => p !== pageSlug), true);
		} else {
			$.set(expandedPages, [...$.get(expandedPages), pageSlug], true);
		}
	}

	function isExpanded(group) {
		// Non-collapsible groups are always expanded
		if (!group.collapsible) return true;

		return $.get(expandedGroups).includes(group.group);
	}

	function isPageExpanded(page) {
		return $.get(expandedPages).includes(page.slug);
	}

	function isActiveSlug(slug) {
		return $$props.currentSlug === slug;
	}

	function handleLinkClick() {
		$$props.onNavigate?.();
	}

	function getHref(slug) {
		if (!$$props.config.activeVersion) {
			return `${base}/docs/${slug}`;
		}

		if (slug.startsWith(`${$$props.config.activeVersion}/`)) {
			return `${base}/docs/${slug}`;
		}

		return `${base}/docs/${$$props.config.activeVersion}/${slug}`;
	}

	var nav = root_9();
	var div = $.child(nav);

	$.each(div, 21, () => $$props.config.sidebar, (group) => group.group, ($$anchor, group) => {
		var div_1 = root_8();
		var node = $.child(div_1);

		{
			var consequent_1 = ($$anchor) => {
				var button = root();
				var span = $.child(button);
				var text = $.only_child(span, true);
				var node_1 = $.sibling(span, 2);

				{
					var consequent = ($$anchor) => {
						ChevronDown($$anchor, { class: 'h-3.5 w-3.5' });
					};

					var d = $.derived(() => isExpanded($.get(group)));

					var alternate = ($$anchor) => {
						ChevronRight($$anchor, { class: 'h-3.5 w-3.5' });
					};

					$.if(node_1, ($$render) => {
						if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(button);

				$.template_effect(
					($0) => {
						$.set_attribute(button, 'aria-expanded', $0);
						$.set_text(text, $.get(group).group);
					},
					[() => isExpanded($.get(group))]
				);

				$.delegated('click', button, () => toggleGroup($.get(group).group));
				$.append($$anchor, button);
			};

			var alternate_1 = ($$anchor) => {
				var div_2 = root_1();
				var span_1 = $.child(div_2);
				var text_1 = $.only_child(span_1, true);

				$.reset(div_2);
				$.template_effect(() => $.set_text(text_1, $.get(group).group));
				$.append($$anchor, div_2);
			};

			$.if(node, ($$render) => {
				if ($.get(group).collapsible) $$render(consequent_1); else $$render(alternate_1, -1);
			});
		}

		var node_2 = $.sibling(node, 2);

		{
			var consequent_5 = ($$anchor) => {
				var ul = root_7();

				$.each(ul, 21, () => $.get(group).pages, (docPage) => docPage.slug, ($$anchor, docPage) => {
					var li = root_6();
					var node_3 = $.child(li);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_2 = root_4();
							var button_1 = $.first_child(fragment_2);
							let classes;
							var span_2 = $.child(button_1);
							var text_2 = $.only_child(span_2, true);
							var node_4 = $.sibling(span_2, 2);

							{
								var consequent_2 = ($$anchor) => {
									ChevronDown($$anchor, { class: 'h-3.5 w-3.5 shrink-0' });
								};

								var d_1 = $.derived(() => isPageExpanded($.get(docPage)));

								var alternate_2 = ($$anchor) => {
									ChevronRight($$anchor, { class: 'h-3.5 w-3.5 shrink-0' });
								};

								$.if(node_4, ($$render) => {
									if ($.get(d_1)) $$render(consequent_2); else $$render(alternate_2, -1);
								});
							}

							$.reset(button_1);

							var node_5 = $.sibling(button_1, 2);

							{
								var consequent_3 = ($$anchor) => {
									var ul_1 = root_3();

									$.each(ul_1, 21, () => $.get(docPage).pages, (nestedPage) => nestedPage.slug, ($$anchor, nestedPage) => {
										var li_1 = root_2();
										var a = $.child(li_1);
										let classes_1;
										var text_3 = $.only_child(a, true);

										$.reset(li_1);

										$.template_effect(
											($0, $1) => {
												$.set_attribute(a, 'href', $0);
												classes_1 = $.set_class(a, 1, 'text-muted-foreground hover:text-accent-foreground block truncate rounded px-3 py-1 text-sm no-underline transition-all duration-200 svelte-1axxmcs', null, classes_1, { active: $1 });
												$.set_text(text_3, $.get(nestedPage).title);
											},
											[
												() => getHref($.get(nestedPage).slug),
												() => isActiveSlug($.get(nestedPage).slug)
											]
										);

										$.delegated('click', a, handleLinkClick);
										$.append($$anchor, li_1);
									});

									$.reset(ul_1);
									$.append($$anchor, ul_1);
								};

								var d_2 = $.derived(() => isPageExpanded($.get(docPage)));

								$.if(node_5, ($$render) => {
									if ($.get(d_2)) $$render(consequent_3);
								});
							}

							$.template_effect(
								($0, $1) => {
									classes = $.set_class(button_1, 1, 'text-muted-foreground hover:text-accent-foreground flex w-full cursor-pointer items-center justify-start gap-2 rounded border-none bg-transparent px-3 py-1 text-left text-sm transition-all duration-200 svelte-1axxmcs', null, classes, { active: $0 });
									$.set_attribute(button_1, 'aria-expanded', $1);
									$.set_text(text_2, $.get(docPage).title);
								},
								[
									() => isActiveSlug($.get(docPage).slug),
									() => isPageExpanded($.get(docPage))
								]
							);

							$.delegated('click', button_1, () => togglePage($.get(docPage).slug));
							$.append($$anchor, fragment_2);
						};

						var alternate_3 = ($$anchor) => {
							var a_1 = root_5();
							let classes_2;
							var text_4 = $.only_child(a_1, true);

							$.template_effect(
								($0, $1) => {
									$.set_attribute(a_1, 'href', $0);
									classes_2 = $.set_class(a_1, 1, 'text-muted-foreground hover:text-accent-foreground block truncate rounded px-3 py-1 text-sm no-underline transition-all duration-200 svelte-1axxmcs', null, classes_2, { active: $1 });
									$.set_text(text_4, $.get(docPage).title);
								},
								[
									() => getHref($.get(docPage).slug),
									() => isActiveSlug($.get(docPage).slug)
								]
							);

							$.delegated('click', a_1, handleLinkClick);
							$.append($$anchor, a_1);
						};

						$.if(node_3, ($$render) => {
							if ($.get(docPage).pages && $.get(docPage).pages.length > 0) $$render(consequent_4); else $$render(alternate_3, -1);
						});
					}

					$.reset(li);
					$.append($$anchor, li);
				});

				$.reset(ul);
				$.append($$anchor, ul);
			};

			var d_3 = $.derived(() => isExpanded($.get(group)));

			$.if(node_2, ($$render) => {
				if ($.get(d_3)) $$render(consequent_5);
			});
		}

		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.reset(nav);
	$.append($$anchor, nav);
	$.pop();
}

$.delegate(['click']);