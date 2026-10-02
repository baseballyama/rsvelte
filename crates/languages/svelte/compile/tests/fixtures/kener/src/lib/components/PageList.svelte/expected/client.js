import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { onMount } from "svelte";
import { page } from "$app/state";
import * as Item from "$lib/components/ui/item/index.js";
import ChevronRight from "@lucide/svelte/icons/chevron-right";

var root = $.from_html(`<img width="32" height="32" class="size-8 rounded object-cover"/>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<a><!> <!> <!></a>`);
var root_3 = $.from_html(`<div class="flex w-full flex-col gap-2"></div>`);
var root_4 = $.from_html(`<div class="flex shrink-0 items-center gap-2"><!></div>`);

export default function PageList($$anchor, $$props) {
	$.push($$props, true);

	let currentPath = $.derived(() => page.params.page_path);
	let pages = $.state($.proxy([]));
	let pagesLoading = $.state(false);
	const defaultHomePage = $.derived(() => $.get(pages).find((p) => p.page_path == ""));
	const currentPage = $.derived(() => $.get(pages).find((p) => p.page_path === $.get(currentPath)) || $.get(defaultHomePage));

	async function fetchPages() {
		$.set(pagesLoading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/dashboard-apis/pages"));

			if (response.ok) {
				$.set(pages, await response.json(), true);
				console.log(">>>>>>----  PageList:25 ", $.get(pages));
			}
		} catch {
			// silently fail, pages dropdown will just not show
		} finally {
			$.set(pagesLoading, false);
		}
	}

	onMount(() => {
		fetchPages();
	});

	var div = root_4();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				variant: 'outline',
				size: 'sm',
				class: 'bg-background/80 dark:bg-background/70 border-foreground/10 flex items-center justify-center rounded-full border text-xs shadow-none backdrop-blur-md',
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					Spinner($$anchor, { class: 'h-4 w-4' });
				},
				$$slots: { default: true }
			});
		};

		var consequent_2 = ($$anchor) => {
			var div_1 = root_3();

			$.each(div_1, 21, () => $.get(pages), $.index, ($$anchor, page, $$index, $$array) => {
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var a = root_2();

						$.attribute_effect(a, ($0) => ({ href: $0, ...props() }), [() => clientResolver(resolve, `/${$.get(page).page_path}`)]);

						var node_2 = $.child(a);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Item.Media, ($$anchor, Item_Media) => {
									Item_Media($$anchor, {
										variant: 'image',
										children: ($$anchor, $$slotProps) => {
											var img = root();

											$.template_effect(() => {
												$.set_attribute(img, 'src', $.get(page).page_logo);
												$.set_attribute(img, 'alt', $.get(page).page_title);
											});

											$.append($$anchor, img);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							};

							$.if(node_2, ($$render) => {
								if ($.get(page).page_logo) $$render(consequent_1);
							});
						}

						var node_4 = $.sibling(node_2, 2);

						$.component(node_4, () => Item.Content, ($$anchor, Item_Content) => {
							Item_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Item.Title, ($$anchor, Item_Title) => {
										Item_Title($$anchor, {
											class: 'line-clamp-1',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, $.get(page).page_title));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Item.Description, ($$anchor, Item_Description) => {
										Item_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, $.get(page).page_header));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_4, 2);

						$.component(node_7, () => Item.Actions, ($$anchor, Item_Actions) => {
							Item_Actions($$anchor, {
								children: ($$anchor, $$slotProps) => {
									ChevronRight($$anchor, { class: 'size-4' });
								},
								$$slots: { default: true }
							});
						});

						$.reset(a);
						$.append($$anchor, a);
					};

					$.component(node_1, () => Item.Root, ($$anchor, Item_Root) => {
						Item_Root($$anchor, {
							variant: 'outline',
							class: 'rounded-3xl',
							child,
							$$slots: { child: true }
						});
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(pagesLoading)) $$render(consequent); else if ($.get(pages).length > 0) $$render(consequent_2, 1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}