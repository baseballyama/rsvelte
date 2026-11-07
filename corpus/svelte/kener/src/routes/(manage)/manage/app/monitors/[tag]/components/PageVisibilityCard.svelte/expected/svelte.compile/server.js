import * as $ from 'svelte/internal/server';
import { Label } from "$lib/components/ui/label/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import FileTextIcon from "@lucide/svelte/icons/file-text";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function PageVisibilityCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { monitorTag, allPages, onPagesUpdated } = $$props;
		let savingPages = false;

		// Check if monitor is on a specific page
		function isMonitorOnPage(pageId) {
			const page = allPages.find((p) => p.id === pageId);

			return page?.monitors?.some((m) => m.monitor_tag === monitorTag) ?? false;
		}

		// Toggle monitor on a page
		async function toggleMonitorOnPage(pageId, checked) {
			savingPages = true;

			try {
				const action = checked ? "addMonitorToPage" : "removeMonitorFromPage";

				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action, data: { page_id: pageId, monitor_tag: monitorTag } })
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success(checked ? "Monitor added to page" : "Monitor removed from page");
					onPagesUpdated();
				}
			} catch(e) {
				toast.error("Failed to update page");
			} finally {
				savingPages = false;
			}
		}

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										class: 'flex items-center gap-2',
										children: ($$renderer) => {
											FileTextIcon($$renderer, { class: 'size-5' });
											$$renderer.push(`<!----> Page Visibility`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Description) {
									$$renderer.push('<!--[-->');

									Card.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Select which pages this monitor should appear on`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							children: ($$renderer) => {
								if (allPages.length === 0) {
									$$renderer.push(`<!--[0--><p class="text-muted-foreground text-sm">No pages available. Create a page first.</p>`);
								} else {
									$$renderer.push(`<!--[-1--><div class="flex flex-row flex-wrap gap-2 space-y-3"><!--[-->`);

									const each_array = $.ensure_array_like(allPages);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let page = each_array[$$index];

										$$renderer.push(`<div class="flex h-12 items-center space-x-3 rounded-xl border px-4 py-2">`);

										Checkbox($$renderer, {
											id: `page-${$.stringify(page.id)}`,
											checked: isMonitorOnPage(page.id),
											onCheckedChange: (checked) => toggleMonitorOnPage(page.id, !!checked),
											disabled: savingPages
										});

										$$renderer.push(`<!----> `);

										Label($$renderer, {
											for: `page-${$.stringify(page.id)}`,
											class: 'flex cursor-pointer flex-row',
											children: ($$renderer) => {
												$$renderer.push(`<span class="font-medium">${$.escape(page.page_title)}</span> <span class="text-muted-foreground text-xs">${$.escape(page.page_path)}</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									}

									$$renderer.push(`<!--]--></div>`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}