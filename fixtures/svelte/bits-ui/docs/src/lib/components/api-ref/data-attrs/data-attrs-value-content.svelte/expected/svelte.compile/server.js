import * as $ from 'svelte/internal/server';
import Code from "$lib/components/markdown/code.svelte";
import { Popover } from "bits-ui";
import ScrollArea from "$lib/components/ui/scroll-area.svelte";
import Info from "phosphor-svelte/lib/Info";

export default function Data_attrs_value_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { attr } = $$props;

		$$renderer.push(`<div class="flex items-center gap-1.5">`);

		Code($$renderer, {
			class: 'bg-transparent px-0',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(attr.variant === "enum" ? "enum" : attr.value)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (attr.variant === "enum") {
			$$renderer.push('<!--[0-->');

			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					children: ($$renderer) => {
						if (Popover.Trigger) {
							$$renderer.push('<!--[-->');

							Popover.Trigger($$renderer, {
								'data-llm-ignore': true,
								class: 'rounded-button text-muted-foreground focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
								children: ($$renderer) => {
									Info($$renderer, { class: 'size-4', weight: 'bold' });
									$$renderer.push(`<!----> <span class="sr-only">See enum options</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								preventScroll: false,
								side: 'top',
								sideOffset: 10,
								class: 'rounded-card border-border shadow-popover z-50 border-2 bg-zinc-50 py-1.5 pl-1.5 pr-0.5 dark:bg-[#121212]',
								children: ($$renderer) => {
									ScrollArea($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<div class="**:data-line:pr-2.5! [&amp;_pre]:my-0! [&amp;_pre]:mb-0! [&amp;_pre]:overflow-x-visible! [&amp;_pre]:pt-0! [&amp;_pre]:pb-0! [&amp;_pre]:ring-0! [&amp;_pre]:ring-offset-0! [&amp;_pre]:outline-hidden! [&amp;_pre]:mt-0 [&amp;_pre]:border-0 [&amp;_pre]:p-0">`);

											if (attr.value) {
												$$renderer.push('<!--[-->');
												attr.value($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</div>`);
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

						$$renderer.push(` <span aria-hidden="true" class="hidden">- ${$.escape(attr.stringValue)}</span>`);
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

		$$renderer.push(`<!--]--></div>`);
	});
}