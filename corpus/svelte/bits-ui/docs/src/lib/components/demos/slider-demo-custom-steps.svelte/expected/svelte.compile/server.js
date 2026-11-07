import * as $ from 'svelte/internal/server';
import { Slider } from "bits-ui";

export default function Slider_demo_custom_steps($$renderer) {
	let fontSize = 16;
	const fontSizes = [0, 4, 8, 16, 24];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="w-full md:max-w-[320px]">`);

		{
			function children($$renderer, { tickItems }) {
				$$renderer.push(`<span class="bg-dark-10 relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full">`);

				if (Slider.Range) {
					$$renderer.push('<!--[-->');
					Slider.Range($$renderer, { class: 'bg-foreground absolute h-full' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</span> `);

				if (Slider.Thumb) {
					$$renderer.push('<!--[-->');

					Slider.Thumb($$renderer, {
						index: 0,
						class: 'border-border-input bg-background hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 z-5 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <!--[-->`);

				const each_array = $.ensure_array_like(tickItems);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { index, value } = each_array[$$index];

					if (Slider.Tick) {
						$$renderer.push('<!--[-->');

						Slider.Tick($$renderer, {
							index,
							class: 'dark:bg-background bg-background z-1 h-2 w-[1px]'
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Slider.TickLabel) {
						$$renderer.push('<!--[-->');

						Slider.TickLabel($$renderer, {
							index,
							class: 'text-muted-foreground data-selected:text-foreground mb-5 text-sm font-medium leading-none',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(value)}px`);
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
			}

			if (Slider.Root) {
				$$renderer.push('<!--[-->');

				Slider.Root($$renderer, {
					type: 'single',
					step: fontSizes,
					class: 'relative flex w-full touch-none select-none items-center',
					trackPadding: 3,
					get value() {
						return fontSize;
					},

					set value($$value) {
						fontSize = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`</div> <div class="flex h-[320px] w-full justify-center">`);

		{
			function children($$renderer, { tickItems }) {
				$$renderer.push(`<span class="bg-dark-10 relative h-full w-2 cursor-pointer overflow-hidden rounded-full">`);

				if (Slider.Range) {
					$$renderer.push('<!--[-->');
					Slider.Range($$renderer, { class: 'bg-foreground absolute w-full' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</span> `);

				if (Slider.Thumb) {
					$$renderer.push('<!--[-->');

					Slider.Thumb($$renderer, {
						index: 0,
						class: 'border-border-input bg-background hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 z-5 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <!--[-->`);

				const each_array_1 = $.ensure_array_like(tickItems);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let { index, value } = each_array_1[$$index_1];

					if (Slider.Tick) {
						$$renderer.push('<!--[-->');
						Slider.Tick($$renderer, { index, class: 'dark:bg-background z-1 h-[1px] w-4' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Slider.TickLabel) {
						$$renderer.push('<!--[-->');

						Slider.TickLabel($$renderer, {
							index,
							class: 'text-muted-foreground data-selected:text-foreground mr-5 text-sm font-medium leading-none',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(value)}px`);
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
			}

			if (Slider.Root) {
				$$renderer.push('<!--[-->');

				Slider.Root($$renderer, {
					type: 'single',
					step: fontSizes,
					orientation: 'vertical',
					class: 'relative flex h-full touch-none select-none flex-col items-center',
					trackPadding: 3,
					get value() {
						return fontSize;
					},

					set value($$value) {
						fontSize = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}