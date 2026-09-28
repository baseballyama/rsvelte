import * as $ from 'svelte/internal/server';
import Fan from "phosphor-svelte/lib/Fan";
import { Tabs } from "bits-ui";
import HomeSlider from "$lib/components/homepage/home-slider.svelte";

export default function Card_air($$renderer) {
	let fanSpeed = 50;
	const temps = [50, 80, 95, 80, 50, 40, 60];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="relative order-2 lg:order-3 lg:-translate-y-3"><div class="line_top_gradient absolute -left-10 top-0 h-[1px] w-[calc(100%+50px)] lg:hidden svelte-yrwm06"></div> <div class="rounded-card-lg mx-1.5 my-3 flex aspect-square flex-col justify-between bg-[#e0f2fe] px-3 pb-6 pt-5 lg:m-2.5 lg:px-5 lg:pb-8 dark:bg-[#C7E6FA]"><div class="flex justify-between">`);

		if (Tabs.Root) {
			$$renderer.push('<!--[-->');

			Tabs.Root($$renderer, {
				value: 'c',
				class: 'flex items-center font-medium',
				children: ($$renderer) => {
					if (Tabs.Content) {
						$$renderer.push('<!--[-->');

						Tabs.Content($$renderer, {
							value: 'c',
							class: 'select-none',
							children: ($$renderer) => {
								$$renderer.push(`<span class="text-[2.70288rem] leading-none text-indigo-950 lg:text-[3.625rem]">21</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Tabs.Content) {
						$$renderer.push('<!--[-->');

						Tabs.Content($$renderer, {
							value: 'f',
							class: 'select-none',
							children: ($$renderer) => {
								$$renderer.push(`<span class="text-[2.70288rem] leading-none text-indigo-950 lg:text-[3.625rem]">69</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Tabs.List) {
						$$renderer.push('<!--[-->');

						Tabs.List($$renderer, {
							class: 'ml-1 flex flex-col gap-[4px] text-[11px] lg:gap-2 lg:text-[14px]',
							children: ($$renderer) => {
								if (Tabs.Trigger) {
									$$renderer.push('<!--[-->');

									Tabs.Trigger($$renderer, {
										value: 'c',
										class: 'cursor-pointer text-indigo-950/30 transition data-[state=active]:text-indigo-950 data-[state=inactive]:hover:text-indigo-950',
										children: ($$renderer) => {
											$$renderer.push(`<!---->°C`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Tabs.Trigger) {
									$$renderer.push('<!--[-->');

									Tabs.Trigger($$renderer, {
										value: 'f',
										class: 'cursor-pointer text-indigo-950/30 transition data-[state=active]:text-indigo-950 data-[state=inactive]:hover:text-indigo-950',
										children: ($$renderer) => {
											$$renderer.push(`<!---->°F`);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <div class="text-right font-semibold text-indigo-950"><div class="spin_anim ml-auto w-min svelte-yrwm06"${$.attr_style(`animation-duration: ${$.stringify((101 - fanSpeed) * 100)}ms;`)}>`);
		Fan($$renderer, { class: 'ml-auto size-6 ' });
		$$renderer.push(`<!----></div> <div class="lg:text-xxs mt-[0.6em] text-[7px] leading-[110%] tracking-[-0.01em]">Air<br/>Conditioner</div></div></div> <div><div class="relative my-5 flex justify-between"><!--[-->`);

		const each_array = $.ensure_array_like(temps);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let temp = each_array[index];

			$$renderer.push(`<div class="outer relative h-12 w-3 rounded-[35px] bg-[#000231]/10 lg:h-16 lg:w-4"><div class="inner absolute bottom-0 w-full rounded-[35px] bg-indigo-950"${$.attr_style(`height: ${$.stringify(temp)}%`)}></div></div>`);
		}

		$$renderer.push(`<!--]--> <div class="aspect-212/30 absolute -left-1.5 top-1/2 w-[calc(100%+10px)] -translate-y-1/2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 30" fill="none" class="absolute left-0 top-0 h-full w-full object-contain"><path d="M1 29C10.3489 20.1254 38.5826 2.10999 76.7262 1.04504C124.406 -0.286151 145.441 28.3343 170.332 28.3344C192.075 28.3345 205.975 13.5804 211 7.36823" stroke="#F43F5E" stroke-width="2"></path></svg></div></div> `);

		HomeSlider($$renderer, {
			get value() {
				return fanSpeed;
			},

			set value($$value) {
				fanSpeed = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}