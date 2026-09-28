import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Card, Carousel, Controls } from "flowbite-svelte";

import {
	ArrowRightOutline,
	CheckCircleSolid,
	CheckOutline,
	FireSolid,
	LayersSolid,
	RocketSolid
} from "flowbite-svelte-icons";

import { fly } from "svelte/transition";

var root = $.from_html(`<div class="h-full"><div class="text-primary-600 mb-4 flex items-center gap-2 text-lg font-medium"><!> <span>Insights</span></div> <h3 class="mb-4 text-2xl font-medium text-gray-900 dark:text-white">You are going to grow by 44% next year</h3> <p class="mb-4 text-gray-500 dark:text-gray-300">Get started with a free and open-source admin dashboard layout built with Tailwind CSS and Flowbite featuring charts, widgets, CRUD layouts, authentication pages, and more</p> <p class="mb-2 text-lg font-medium text-gray-900 dark:text-white">Key Takeaways:</p> <ul class="mb-4 list-disc space-y-3 pl-4 text-gray-500 dark:text-gray-300"><li>What are the new challenges in the delivery industry due to new consumer expectations.</li> <li>How the online delivery business model is diversifying to meet new demands.</li> <li>Which new technology requirements must be met to ensure true retail experiences.</li></ul></div>`);
var root_1 = $.from_html(`<div class="h-full"><div class="mb-4 flex items-center text-lg font-medium text-teal-500"><!> Tips to grow</div> <p class="mb-4 text-gray-500 dark:text-gray-300">Marketing, sales &amp; business growth for small business. Improve your marketing &amp; promotion results - and grow your sales!</p> <p class="mb-4 text-lg font-medium text-gray-900 dark:text-white">What you'll learn:</p> <ul role="list" class="mb-4 list-disc space-y-3 pl-2 text-gray-500 dark:text-gray-300"><li class="flex items-center space-x-2"><!> <span class="leading-tight">Dynamic reports and dashboards</span></li> <li class="flex space-x-2"><!> <span class="leading-tight">Learn from competitors about what to do, and not to do</span></li> <li class="flex space-x-2"><!> <span class="leading-tight">Take their business to the next level</span></li> <li class="flex space-x-2"><!> <span class="leading-tight">Limitless business automation</span></li> <li class="flex space-x-2"><!> <span class="leading-tight">Build relationships with other businesses to co-promote</span></li> <li class="flex space-x-2"><!> <span class="leading-tight">Make their customers feel loved and apprecaited</span></li></ul> <a href="#top" class="text-primary-700 dark:text-primary-500 inline-flex items-center rounded-lg p-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Let's start <!></a></div>`);
var root_2 = $.from_html(`View more <!>`, 1);
var root_3 = $.from_html(`<div class="h-full"><div class="mb-4 flex items-center text-lg font-medium text-purple-600"><!>Features</div> <h3 class="mb-4 text-2xl font-medium text-gray-900 dark:text-white">Go next level with Flowbite</h3> <p class="text-gray-500 dark:text-gray-300">Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil, and deploy changes with ease.</p> <ul role="list" class="my-5 mb-4 list-disc space-y-3 pl-2 text-gray-500 dark:text-gray-300"><li class="flex items-center space-x-3"><!> <span class="leading-tight">Dynamic reports and dashboards</span></li> <li class="flex items-center space-x-3"><!> <span class="leading-tight">Templates for everyone</span></li> <li class="flex items-center space-x-3"><!> <span class="leading-tight">Development workflow</span></li> <li class="flex items-center space-x-3"><!> <span class="leading-tight">Limitless business automation</span></li></ul> <!></div>`);

export default function Insights($$anchor) {
	const items = [{}, {}, {}];
	let transitionSlideIn = { x: "100%", opacity: 0.5, duration: 200 };
	let transitionSlideOut = { x: "-100%", opacity: 0.5, duration: 200 };

	Card($$anchor, {
		size: 'xl',
		class: 'p-4 sm:p-6',
		children: ($$anchor, $$slotProps) => {
			{
				const slide = ($$anchor, $$arg0) => {
					let index = () => ($$arg0?.()).index;
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var div = root();
							var div_1 = $.child(div);
							var node_1 = $.child(div_1);

							LayersSolid(node_1, {});
							$.next(2);
							$.reset(div_1);
							$.next(8);
							$.reset(div);
							$.transition(1, div, () => fly, () => transitionSlideIn);
							$.transition(2, div, () => fly, () => transitionSlideOut);
							$.append($$anchor, div);
						};

						var consequent_1 = ($$anchor) => {
							var div_2 = root_1();
							var div_3 = $.child(div_2);
							var node_2 = $.child(div_3);

							RocketSolid(node_2, { class: 'me-2' });
							$.next();
							$.reset(div_3);

							var ul = $.sibling(div_3, 6);
							var li = $.child(ul);
							var node_3 = $.child(li);

							CheckOutline(node_3, { size: 'lg' });
							$.next(2);
							$.reset(li);

							var li_1 = $.sibling(li, 2);
							var node_4 = $.child(li_1);

							CheckOutline(node_4, { size: 'lg' });
							$.next(2);
							$.reset(li_1);

							var li_2 = $.sibling(li_1, 2);
							var node_5 = $.child(li_2);

							CheckOutline(node_5, { size: 'lg' });
							$.next(2);
							$.reset(li_2);

							var li_3 = $.sibling(li_2, 2);
							var node_6 = $.child(li_3);

							CheckOutline(node_6, { size: 'lg' });
							$.next(2);
							$.reset(li_3);

							var li_4 = $.sibling(li_3, 2);
							var node_7 = $.child(li_4);

							CheckOutline(node_7, { size: 'lg' });
							$.next(2);
							$.reset(li_4);

							var li_5 = $.sibling(li_4, 2);
							var node_8 = $.child(li_5);

							CheckOutline(node_8, { size: 'lg' });
							$.next(2);
							$.reset(li_5);
							$.reset(ul);

							var a = $.sibling(ul, 2);
							var node_9 = $.sibling($.child(a));

							ArrowRightOutline(node_9, { size: 'sm', class: 'ms-2' });
							$.reset(a);
							$.reset(div_2);
							$.transition(1, div_2, () => fly, () => transitionSlideIn);
							$.transition(2, div_2, () => fly, () => transitionSlideOut);
							$.append($$anchor, div_2);
						};

						var alternate = ($$anchor) => {
							var div_4 = root_3();
							var div_5 = $.child(div_4);
							var node_10 = $.child(div_5);

							FireSolid(node_10, { class: 'me-2' });
							$.next();
							$.reset(div_5);

							var ul_1 = $.sibling(div_5, 6);
							var li_6 = $.child(ul_1);
							var node_11 = $.child(li_6);

							CheckCircleSolid(node_11, { class: 'text-purple-600 dark:text-purple-500', size: 'sm' });
							$.next(2);
							$.reset(li_6);

							var li_7 = $.sibling(li_6, 2);
							var node_12 = $.child(li_7);

							CheckCircleSolid(node_12, { class: 'text-purple-600 dark:text-purple-500', size: 'sm' });
							$.next(2);
							$.reset(li_7);

							var li_8 = $.sibling(li_7, 2);
							var node_13 = $.child(li_8);

							CheckCircleSolid(node_13, { class: 'text-purple-600 dark:text-purple-500', size: 'sm' });
							$.next(2);
							$.reset(li_8);

							var li_9 = $.sibling(li_8, 2);
							var node_14 = $.child(li_9);

							CheckCircleSolid(node_14, { class: 'text-purple-600 dark:text-purple-500', size: 'sm' });
							$.next(2);
							$.reset(li_9);
							$.reset(ul_1);

							var node_15 = $.sibling(ul_1, 2);

							Button(node_15, {
								color: 'alternative',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_3 = root_2();
									var node_16 = $.sibling($.first_child(fragment_3));

									ArrowRightOutline(node_16, { size: 'sm', class: 'ms-2' });
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});

							$.reset(div_4);
							$.transition(1, div_4, () => fly, () => transitionSlideIn);
							$.transition(2, div_4, () => fly, () => transitionSlideOut);
							$.append($$anchor, div_4);
						};

						$.if(node, ($$render) => {
							if (index() == 0) $$render(consequent); else if (index() == 1) $$render(consequent_1, 1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				Carousel($$anchor, {
					get images() {
						return items;
					},
					class: 'flex h-full',
					slide,
					children: ($$anchor, $$slotProps) => {
						Controls($$anchor, {});
					},
					$$slots: { slide: true, default: true }
				});
			}
		},
		$$slots: { default: true }
	});
}