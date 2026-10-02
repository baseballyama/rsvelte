import * as $ from 'svelte/internal/server';
import { Collapsible, Tabs } from "bits-ui";
import CopySimple from "phosphor-svelte/lib/CopySimple";
import Check from "phosphor-svelte/lib/Check";
import { cn } from "$lib/utils/styles.js";
import { useCopyToClipboard } from "$lib/utils/copy-to-clipboard.svelte.js";

export default function Demo_code_tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			open = void 0,
			ref = null,
			onValueChange = () => {},
			items,
			expandable = true,
			variant = "preview",
			children
		} = $$props;

		const copyToClipboard = useCopyToClipboard();

		if (Tabs.Root) {
			$$renderer.push('<!--[-->');

			Tabs.Root($$renderer, {
				value,
				onValueChange,
				children: ($$renderer) => {
					if (variant === "preview" || open) {
						$$renderer.push(`<!--[0--><div class="flex items-center justify-between border-x-2 pb-2 pt-1">`);

						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'flex items-center',
								'data-llm-ignore': true,
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(items);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let item = each_array[$$index];

										if (Tabs.Trigger) {
											$$renderer.push('<!--[-->');

											Tabs.Trigger($$renderer, {
												value: item.value,
												class: 'text-foreground-alt data-[state=active]:border-foreground-alt data-[state=active]:text-foreground flex select-none border-b-2 border-b-transparent  text-sm',
												children: ($$renderer) => {
													$$renderer.push(`<span class="px-4 py-2">${$.escape(item.label)}</span>`);
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

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` <div class="flex items-center gap-2 border-b-2 border-transparent pr-2 text-sm" data-llm-ignore="">`);

						if (expandable) {
							$$renderer.push('<!--[0-->');

							if (Collapsible.Trigger) {
								$$renderer.push('<!--[-->');

								Collapsible.Trigger($$renderer, {
									class: cn("text-foreground ring-offset-background hover:bg-muted focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden hidden select-none items-center justify-center whitespace-nowrap rounded-[7px] px-2.5 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 sm:inline-flex"),
									'aria-label': 'Toggle code expansion',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(open ? "Collapse" : "Expand")} Code`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <button${$.attr_class($.clsx(cn("text-muted-foreground hover:bg-muted focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative inline-flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2")))} aria-label="Copy" data-copy-code="">`);

						if (!copyToClipboard || !copyToClipboard.isCopied) {
							$$renderer.push('<!--[0-->');
							CopySimple($$renderer, { class: 'size-4' });
						} else {
							$$renderer.push('<!--[-1-->');
							Check($$renderer, { class: 'size-4' });
						}

						$$renderer.push(`<!--]--></button></div></div> <div style="display: contents;">`);
						children($$renderer);
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');

						if (Collapsible.Trigger) {
							$$renderer.push('<!--[-->');

							Collapsible.Trigger($$renderer, {
								class: 'rounded-b-card text-foreground-alt bg-background hover:bg-muted/15 hover:text-foreground flex w-full items-center justify-center border-2 border-t-0 py-3 text-sm font-medium transition-colors duration-100',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Expand Code`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` <div class="hidden">`);
						children($$renderer);
						$$renderer.push(`<!----></div>`);
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

		$.bind_props($$props, { value, open, ref });
	});
}