import * as $ from 'svelte/internal/server';
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { cn } from "$lib/utils.js";

export default function Code_collapsible_wrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;
		let open = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Collapsible.Root) {
				$$renderer.push('<!--[-->');

				Collapsible.Root($$renderer, $.spread_props([
					{ class: cn("group/collapsible relative md:-mx-1", className) },
					restProps,
					{
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									$$renderer.push(`<div class="absolute end-9 top-1.5 z-10 flex items-center">`);

									Button($$renderer, $.spread_props([
										{ variant: 'ghost', size: 'sm' },
										props,
										{
											class: 'h-7 rounded-md px-2 text-muted-foreground',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(open ? "Collapse" : "Expand")}`);
											},
											$$slots: { default: true }
										}
									]));

									$$renderer.push(`<!----> `);
									Separator($$renderer, { orientation: 'vertical', class: 'mx-1.5 !h-4' });
									$$renderer.push(`<!----></div>`);
								}

								if (Collapsible.Trigger) {
									$$renderer.push('<!--[-->');
									Collapsible.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (Collapsible.Content) {
								$$renderer.push('<!--[-->');

								Collapsible.Content($$renderer, {
									forceMount: true,
									class: 'relative mt-6 overflow-hidden data-[state=closed]:max-h-64 [&>figure]:mt-0 [&>figure]:md:!mx-0',
									children: ($$renderer) => {
										children?.($$renderer);
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Collapsible.Trigger) {
								$$renderer.push('<!--[-->');

								Collapsible.Trigger($$renderer, {
									class: 'absolute inset-x-0 -bottom-2 flex h-20 items-center justify-center rounded-b-lg bg-gradient-to-b from-code/70 to-code text-sm text-muted-foreground group-data-[state=open]/collapsible:hidden',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(open ? "Collapse" : "Expand")}`);
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
					}
				]));

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