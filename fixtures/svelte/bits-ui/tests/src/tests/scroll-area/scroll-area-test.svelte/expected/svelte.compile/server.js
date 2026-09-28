import * as $ from 'svelte/internal/server';
import { ScrollArea } from "bits-ui";

export default function Scroll_area_test($$renderer, $$props) {
	let {
		type = "hover",
		wrapText = true,
		numParagraphs = 3,
		height = 200,
		width = 250,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	$$renderer.push(`<div class="flex w-[500px] max-w-[500px] flex-col gap-4">`);

	$$renderer.select({ value: type, id: 'type', 'data-testid': 'type' }, ($$renderer) => {
		$$renderer.option({ value: 'auto' }, ($$renderer) => {
			$$renderer.push(`auto`);
		});

		$$renderer.option({ value: 'hover' }, ($$renderer) => {
			$$renderer.push(`hover`);
		});

		$$renderer.option({ value: 'scroll' }, ($$renderer) => {
			$$renderer.push(`scroll`);
		});

		$$renderer.option({ value: 'always' }, ($$renderer) => {
			$$renderer.push(`always`);
		});
	});

	$$renderer.push(` <input type="number"${$.attr('value', height)} id="height" data-testid="height"/> <input type="number"${$.attr('value', width)} id="width" data-testid="width"/> <input type="checkbox"${$.attr('checked', wrapText, true)} id="wrap"/> <input type="number"${$.attr('value', numParagraphs)} id="num-p" data-testid="numParagraphs"/></div> `);

	if (ScrollArea.Root) {
		$$renderer.push('<!--[-->');

		ScrollArea.Root($$renderer, $.spread_props([
			restProps,
			{
				class: 'border-dark-10 bg-background-alt shadow-card relative overflow-hidden rounded-[10px] border px-4 py-4',
				type,
				'data-testid': 'root',
				children: ($$renderer) => {
					if (ScrollArea.Viewport) {
						$$renderer.push('<!--[-->');

						ScrollArea.Viewport($$renderer, {
							class: 'h-full w-full',
							'data-testid': 'viewport',
							style: `width: ${$.stringify(width)}px; height: ${$.stringify(height)}px;`,
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(Array(numParagraphs));

								for (let i = 0, $$length = each_array.length; i < $$length; i++) {
									let _ = each_array[i];

									$$renderer.push(`<p class="w-full"${$.attr_style('', { 'text-wrap': wrapText ? "wrap" : "nowrap" })}>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dignissimos impedit rem,
				repellat deserunt ducimus quasi nisi voluptatem cumque aliquid esse ea deleniti
				eveniet incidunt! Deserunt minus laborum accusamus iusto dolorum. Lorem ipsum dolor
				sit, amet consectetur adipisicing elit. Blanditiis officiis error minima eos fugit
				voluptate excepturi eveniet dolore et, ratione impedit consequuntur dolorem hic quae
				corrupti autem? Dolorem, sit voluptatum.</p>`);
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

					$$renderer.push(` `);

					if (ScrollArea.Scrollbar) {
						$$renderer.push('<!--[-->');

						ScrollArea.Scrollbar($$renderer, {
							orientation: 'vertical',
							'data-testid': 'scrollbar-y',
							class: 'h-full w-2 bg-blue-500',
							children: ($$renderer) => {
								if (ScrollArea.Thumb) {
									$$renderer.push('<!--[-->');
									ScrollArea.Thumb($$renderer, { 'data-testid': 'thumb-y', class: 'h-full w-full bg-blue-200' });
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

					if (ScrollArea.Scrollbar) {
						$$renderer.push('<!--[-->');

						ScrollArea.Scrollbar($$renderer, {
							orientation: 'horizontal',
							'data-testid': 'scrollbar-x',
							class: 'h-2 w-full bg-red-500',
							children: ($$renderer) => {
								if (ScrollArea.Thumb) {
									$$renderer.push('<!--[-->');
									ScrollArea.Thumb($$renderer, { 'data-testid': 'thumb-x', class: 'h-full w-full bg-red-200' });
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

					if (ScrollArea.Corner) {
						$$renderer.push('<!--[-->');
						ScrollArea.Corner($$renderer, { 'data-testid': 'corner' });
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

	$$renderer.push(` <div data-testid="outside">outside</div>`);
}