import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fan from "phosphor-svelte/lib/Fan";
import { Tabs } from "bits-ui";
import HomeSlider from "$lib/components/homepage/home-slider.svelte";

var root = $.from_html(`<span class="text-[2.70288rem] leading-none text-indigo-950 lg:text-[3.625rem]">21</span>`);
var root_1 = $.from_html(`<span class="text-[2.70288rem] leading-none text-indigo-950 lg:text-[3.625rem]">69</span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="outer relative h-12 w-3 rounded-[35px] bg-[#000231]/10 lg:h-16 lg:w-4"><div class="inner absolute bottom-0 w-full rounded-[35px] bg-indigo-950"></div></div>`);
var root_5 = $.from_html(`<div class="relative order-2 lg:order-3 lg:-translate-y-3"><div class="line_top_gradient absolute -left-10 top-0 h-[1px] w-[calc(100%+50px)] lg:hidden svelte-yrwm06"></div> <div class="rounded-card-lg mx-1.5 my-3 flex aspect-square flex-col justify-between bg-[#e0f2fe] px-3 pb-6 pt-5 lg:m-2.5 lg:px-5 lg:pb-8 dark:bg-[#C7E6FA]"><div class="flex justify-between"><!> <div class="text-right font-semibold text-indigo-950"><div class="spin_anim ml-auto w-min svelte-yrwm06"><!></div> <div class="lg:text-xxs mt-[0.6em] text-[7px] leading-[110%] tracking-[-0.01em]">Air<br/>Conditioner</div></div></div> <div><div class="relative my-5 flex justify-between"><!> <div class="aspect-212/30 absolute -left-1.5 top-1/2 w-[calc(100%+10px)] -translate-y-1/2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 30" fill="none" class="absolute left-0 top-0 h-full w-full object-contain"><path d="M1 29C10.3489 20.1254 38.5826 2.10999 76.7262 1.04504C124.406 -0.286151 145.441 28.3343 170.332 28.3344C192.075 28.3345 205.975 13.5804 211 7.36823" stroke="#F43F5E" stroke-width="2"></path></svg></div></div> <!></div></div></div>`);

export default function Card_air($$anchor) {
	let fanSpeed = $.state(50);
	const temps = [50, 80, 95, 80, 50, 40, 60];
	var div = root_5();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			value: 'c',
			class: 'flex items-center font-medium',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_3();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						value: 'c',
						class: 'select-none',
						children: ($$anchor, $$slotProps) => {
							var span = root();

							$.append($$anchor, span);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
					Tabs_Content_1($$anchor, {
						value: 'f',
						class: 'select-none',
						children: ($$anchor, $$slotProps) => {
							var span_1 = root_1();

							$.append($$anchor, span_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'ml-1 flex flex-col gap-[4px] text-[11px] lg:gap-2 lg:text-[14px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_2();
							var node_4 = $.first_child(fragment_1);

							$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'c',
									class: 'cursor-pointer text-indigo-950/30 transition data-[state=active]:text-indigo-950 data-[state=inactive]:hover:text-indigo-950',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('°C');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
								Tabs_Trigger_1($$anchor, {
									value: 'f',
									class: 'cursor-pointer text-indigo-950/30 transition data-[state=active]:text-indigo-950 data-[state=inactive]:hover:text-indigo-950',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('°F');

										$.append($$anchor, text_1);
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
			},
			$$slots: { default: true }
		});
	});

	var div_3 = $.sibling(node, 2);
	var div_4 = $.child(div_3);
	var node_6 = $.child(div_4);

	Fan(node_6, { class: 'ml-auto size-6 ' });
	$.reset(div_4);
	$.next(2);
	$.reset(div_3);
	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var div_6 = $.child(div_5);
	var node_7 = $.child(div_6);

	$.each(node_7, 17, () => temps, $.index, ($$anchor, temp) => {
		var div_7 = root_4();
		var div_8 = $.only_child(div_7);

		$.template_effect(() => $.set_style(div_8, `height: ${$.get(temp) ?? ''}%`));
		$.append($$anchor, div_7);
	});

	$.next(2);
	$.reset(div_6);

	var node_8 = $.sibling(div_6, 2);

	HomeSlider(node_8, {
		get value() {
			return $.get(fanSpeed);
		},

		set value($$value) {
			$.set(fanSpeed, $$value, true);
		}
	});

	$.reset(div_5);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_style(div_4, `animation-duration: ${(101 - $.get(fanSpeed)) * 100}ms;`));
	$.append($$anchor, div);
}