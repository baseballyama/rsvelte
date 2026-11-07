import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label } from "$lib/components/ui/label/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import FileTextIcon from "@lucide/svelte/icons/file-text";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> Page Visibility`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p class="text-muted-foreground text-sm">No pages available. Create a page first.</p>`);
var root_3 = $.from_html(`<span class="font-medium"> </span> <span class="text-muted-foreground text-xs"> </span>`, 1);
var root_4 = $.from_html(`<div class="flex h-12 items-center space-x-3 rounded-xl border px-4 py-2"><!> <!></div>`);
var root_5 = $.from_html(`<div class="flex flex-row flex-wrap gap-2 space-y-3"></div>`);

export default function PageVisibilityCard($$anchor, $$props) {
	$.push($$props, true);

	let savingPages = $.state(false);

	// Check if monitor is on a specific page
	function isMonitorOnPage(pageId) {
		const page = $$props.allPages.find((p) => p.id === pageId);

		return page?.monitors?.some((m) => m.monitor_tag === $$props.monitorTag) ?? false;
	}

	// Toggle monitor on a page
	async function toggleMonitorOnPage(pageId, checked) {
		$.set(savingPages, true);

		try {
			const action = checked ? "addMonitorToPage" : "removeMonitorFromPage";

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action,
					data: { page_id: pageId, monitor_tag: $$props.monitorTag }
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(checked ? "Monitor added to page" : "Monitor removed from page");
				$$props.onPagesUpdated();
			}
		} catch(e) {
			toast.error("Failed to update page");
		} finally {
			$.set(savingPages, false);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'flex items-center gap-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										FileTextIcon(node_3, { class: 'size-5' });
										$.next();
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Select which pages this monitor should appear on');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							{
								var consequent = ($$anchor) => {
									var p_1 = root_2();

									$.append($$anchor, p_1);
								};

								var alternate = ($$anchor) => {
									var div = root_5();

									$.each(div, 21, () => $$props.allPages, (page) => page.id, ($$anchor, page) => {
										var div_1 = root_4();
										var node_7 = $.child(div_1);

										{
											let $0 = $.derived(() => isMonitorOnPage($.get(page).id));

											Checkbox(node_7, {
												get id() {
													return `page-${$.get(page).id ?? ''}`;
												},

												get checked() {
													return $.get($0);
												},
												onCheckedChange: (checked) => toggleMonitorOnPage($.get(page).id, !!checked),
												get disabled() {
													return $.get(savingPages);
												}
											});
										}

										var node_8 = $.sibling(node_7, 2);

										Label(node_8, {
											get for() {
												return `page-${$.get(page).id ?? ''}`;
											},
											class: 'flex cursor-pointer flex-row',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_3();
												var span = $.first_child(fragment_5);
												var text_1 = $.only_child(span, true);
												var span_1 = $.sibling(span, 2);
												var text_2 = $.only_child(span_1, true);

												$.template_effect(() => {
													$.set_text(text_1, $.get(page).page_title);
													$.set_text(text_2, $.get(page).page_path);
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});

										$.reset(div_1);
										$.append($$anchor, div_1);
									});

									$.reset(div);
									$.append($$anchor, div);
								};

								$.if(node_6, ($$render) => {
									if ($$props.allPages.length === 0) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}