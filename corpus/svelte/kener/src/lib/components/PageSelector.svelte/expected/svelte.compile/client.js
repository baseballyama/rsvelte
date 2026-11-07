import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { onMount } from "svelte";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import { page } from "$app/state";

var root = $.from_html(`<span class="hidden max-w-[16rem] truncate sm:inline"> </span> <span class="sr-only sm:hidden"> </span> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex shrink-0 items-center gap-2"><!></div>`);

export default function PageSelector($$anchor, $$props) {
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

	var div = root_2();
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

		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_1 = $.first_child(fragment_2);

			$.component(node_1, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_2 = $.first_child(fragment_3);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props(props, {
									variant: 'outline',
									size: 'sm',
									class: 'bg-background/80 dark:bg-background/70 border-foreground/10 flex items-center justify-center rounded-full border text-xs shadow-none backdrop-blur-md',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var span = $.first_child(fragment_5);
										var text = $.only_child(span, true);
										var span_1 = $.sibling(span, 2);
										var text_1 = $.only_child(span_1, true);
										var node_3 = $.sibling(span_1, 2);

										ChevronDown(node_3, { class: 'h-4 w-4' });

										$.template_effect(() => {
											$.set_text(text, $.get(currentPage)?.page_title || "Home");
											$.set_text(text_1, $.get(currentPage)?.page_title || "Home");
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_4 = $.sibling(node_2, 2);

						$.component(node_4, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
							DropdownMenu_Content($$anchor, {
								align: 'start',
								class: 'bg-background/30 supports-backdrop-filter:bg-background/20 flex flex-col gap-1 rounded-3xl border p-2 shadow-2xl backdrop-blur-2xl',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_5 = $.first_child(fragment_6);

									$.each(node_5, 17, () => $.get(pages), (page) => page.page_path, ($$anchor, page, $$index, $$array) => {
										{
											let $0 = $.derived(() => $.get(page).page_path === $.get(currentPath) ? "outline" : "ghost");
											let $1 = $.derived(() => clientResolver(resolve, `/${$.get(page).page_path}`));

											Button($$anchor, {
												get variant() {
													return $.get($0);
												},
												size: 'sm',
												get href() {
													return $.get($1);
												},
												class: 'w-full justify-start rounded-full text-xs shadow-none',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, $.get(page).page_title));
													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										}
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($.get(pagesLoading)) $$render(consequent); else if ($.get(pages).length > 0) $$render(consequent_1, 1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}