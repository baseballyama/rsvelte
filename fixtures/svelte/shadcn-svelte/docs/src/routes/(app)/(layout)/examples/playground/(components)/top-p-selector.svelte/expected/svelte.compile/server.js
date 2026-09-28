import * as $ from 'svelte/internal/server';
import * as HoverCard from "$lib/registry/ui/hover-card/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";

export default function Top_p_selector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2 pt-2">`);

			if (HoverCard.Root) {
				$$renderer.push('<!--[-->');

				HoverCard.Root($$renderer, {
					openDelay: 200,
					closeDelay: 100,
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								$$renderer.push(`<div${$.attributes({ class: 'grid gap-4', ...props })}><div class="flex items-center justify-between">`);

								Label($$renderer, {
									for: 'top-p',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Top P`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> <span class="w-12 rounded-md border border-transparent px-2 py-0.5 text-end text-sm text-muted-foreground hover:border-border">${$.escape(value)}</span></div> `);

								Slider($$renderer, $.spread_props([
									{
										id: 'top-p',
										max: 1,
										step: 0.1,
										class: '[&_[role=slider]]:h-4 [&_[role=slider]]:w-4',
										'aria-label': 'Top P'
									},
									restProps,
									{
										get value() {
											return value;
										},

										set value($$value) {
											value = $$value;
											$$settled = false;
										}
									}
								]));

								$$renderer.push(`<!----></div>`);
							}

							if (HoverCard.Trigger) {
								$$renderer.push('<!--[-->');
								HoverCard.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (HoverCard.Content) {
							$$renderer.push('<!--[-->');

							HoverCard.Content($$renderer, {
								class: 'w-[260px] text-sm',
								side: 'left',
								align: 'start',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Control diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are
			considered.`);
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

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}