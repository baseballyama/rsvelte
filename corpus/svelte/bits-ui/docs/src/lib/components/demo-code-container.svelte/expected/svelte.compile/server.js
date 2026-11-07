import * as $ from 'svelte/internal/server';
import { Collapsible, Tabs } from "bits-ui";
import DemoCodeTabs from "./demo-code-tabs.svelte";
import AppCSS from "./code-renders/app-css.svelte";
import ScrollArea from "$lib/components/ui/scroll-area.svelte";
import { cn } from "$lib/utils/styles.js";
import { useCopyToClipboard } from "$lib/utils/copy-to-clipboard.svelte.js";
import { watch } from "runed";

export default function Demo_code_container($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			fileName = "app.svelte",
			class: className,
			nonExpandableItems = [],
			variant = "preview"
		} = $$props;

		const items = $.derived(() => [
			{ label: fileName, value: fileName },
			{ label: "app.css", value: "app.css" }
		]);

		let open = false;
		let activeValue = fileName;
		let codeWrapper = null;
		const expandable = $.derived(() => !nonExpandableItems.includes(activeValue));
		const copyToClipboard = useCopyToClipboard();

		watch([() => activeValue, () => codeWrapper], () => {
			if (!codeWrapper) return;

			copyToClipboard?.setCodeString(codeWrapper.innerText.trim() ?? "");
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Collapsible.Root) {
				$$renderer.push('<!--[-->');

				Collapsible.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						DemoCodeTabs($$renderer, {
							items: items(),
							value: activeValue,
							onValueChange: (v) => {
								activeValue = v;
							},
							expandable: expandable(),
							variant,
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							},

							get ref() {
								return codeWrapper;
							},

							set ref($$value) {
								codeWrapper = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(items());

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let item = each_array[$$index];

									if (Tabs.Content) {
										$$renderer.push('<!--[-->');

										Tabs.Content($$renderer, {
											value: item.value,
											class: 'rounded-b-card bg-background relative overflow-hidden border-x-2 border-b-2',
											'data-llm-ignore': item.value === "app.css" ? "" : undefined,
											children: ($$renderer) => {
												if (Collapsible.Content) {
													$$renderer.push('<!--[-->');

													Collapsible.Content($$renderer, {
														forceMount: true,
														children: ($$renderer) => {
															ScrollArea($$renderer, {
																class: cn("h-full max-h-fit min-h-80 w-full py-0", !open && "max-h-80!", className),
																children: ($$renderer) => {
																	$$renderer.push(`<div${$.attr_class($.clsx(cn("[&_pre]:my-0! [&_pre]:mt-0! [&_pre]:rounded-none! [&_pre]:rounded-tl-none! [&_pre]:rounded-tr-none! [&_pre]:rounded-b-none! [&_pre]:border-t-0! [&_pre]:border-none! [&_pre]:px-2! [&_pre]:pt-2! [&_pre]:pb-5! w-full", className)))}>`);

																	if (item.value === fileName) {
																		$$renderer.push('<!--[0-->');
																		children($$renderer);
																		$$renderer.push(`<!---->`);
																	} else if (item.value === "app.css") {
																		$$renderer.push('<!--[1-->');
																		AppCSS($$renderer, {});
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]--></div>`);
																},
																$$slots: { default: true }
															});
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
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}