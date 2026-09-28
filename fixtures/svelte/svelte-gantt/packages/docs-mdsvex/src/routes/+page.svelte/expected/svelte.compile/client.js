import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy, onMount } from 'svelte';
import FeatureCard from './FeatureCard.svelte';
import HeroExample from './HeroExample.svelte';
import { base } from '$app/paths';

var root = $.from_html(`<main class="overflow-hidden flex flex-col min-h-screen"><header class="relative"><div class="px-4 sm:px-6 md:px-8 pt-12"><div class="absolute inset-0 bottom-10 bg-bottom bg-no-repeat bg-slate-200"><div class="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5"></div></div> <div class="relative max-w-5xl mx-auto pt-20 sm:pt-24 lg:pt-32"><h1 class="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">Lightweight and fast interactive <span class="bg-clip-text text-transparent bg-gradient-to-tr from-pink-500 to-violet-500">Gantt chart.</span></h1> <p class="mt-6 text-lg text-slate-600 text-center max-w-3xl mx-auto dark:text-slate-400"><span class="font-medium bg-clip-text text-transparent bg-gradient-to-tr from-pink-500 to-violet-500">Svelte-gantt</span> is a lightweight and fast interactive gantt chart/resource booking component
					made with Svelte. Compatible with React, Angular, Vue, Svelte... Zero dependencies.</p> <div class="mt-6 sm:mt-10 flex justify-center space-x-6 text-sm"><a class="group text-white font-medium text-2xl transition-all hover:scale-105 px-6 py-3 text-soft mb-12 bg-gradient-to-tr from-pink-500 to-violet-500 hover:bg-violet-600 mx-auto transition-all"><span class="inline-block transform transition-transform duration-100 group-hover:translate-x-0">Get started</span></a></div></div></div> <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-20 sm:mt-24 lg:mt-32"><div class="-mx-4 sm:mx-0"><div class="relative overflow-hidden shadow-xl flex bg-white max-h-[60vh] sm:rounded-xl lg:h-[34.6875rem] xl:h-[31.625rem] dark:bg-slate-900/70 dark:backdrop-blur dark:ring-1 dark:ring-inset dark:ring-white/10 !h-auto max-h-[none]"><!></div></div></div></header> <section class="grow"><div class="relative max-w-5xl mx-auto pt-20 sm:pt-24 lg:pt-32 mb-20 sm:mb-24 lg:mb-32 px-4 sm:px-6 md:px-8 lg:px-0"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><!> <!> <!> <!></div></div></section> <footer class="h-40 bg-slate-400 flex items-center justify-center"><div class="relative max-w-5xl mx-auto"><div class="text-slate-100">@2024 Ante Novokmet - <a href="https://github.com/ANovokmet/">ANovokmet</a></div></div></footer></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let expansionObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			entry.target.classList.remove('opacity-0', 'translate-y-2');
			entry.target.classList.add('opacity-100', 'translate-y-0');
		});
	});

	onMount(() => {
		document.body.classList.add('landing-page');
		document.querySelectorAll('.loading').forEach((e) => expansionObserver.observe(e));
	});

	onDestroy(() => {
		document.body.classList.remove('landing-page');
	});

	var main = root();
	var header = $.child(main);
	var div = $.child(header);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.sibling($.child(div_1), 4);
	var a = $.only_child(div_2);

	$.reset(div_1);
	$.reset(div);

	var div_3 = $.sibling(div, 2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var node = $.child(div_5);

	HeroExample(node, {});
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(header);

	var section = $.sibling(header, 2);
	var div_6 = $.child(section);
	var div_7 = $.child(div_6);
	var node_1 = $.child(div_7);

	FeatureCard(node_1, {
		$$slots: {
			title: ($$anchor, $$slotProps) => {
				var text = $.text('Interactive');

				$.append($$anchor, text);
			},

			subtitle: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Items can be added, moved and resized. Select multiple to move them at once.');

				$.append($$anchor, text_1);
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	FeatureCard(node_2, {
		$$slots: {
			title: ($$anchor, $$slotProps) => {
				var text_2 = $.text('Fast');

				$.append($$anchor, text_2);
			},

			subtitle: ($$anchor, $$slotProps) => {
				var text_3 = $.text('Display thousands of tasks assigned to thousands of resources. Update them in real-time.');

				$.append($$anchor, text_3);
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	FeatureCard(node_3, {
		$$slots: {
			title: ($$anchor, $$slotProps) => {
				var text_4 = $.text('Zoom');

				$.append($$anchor, text_4);
			},

			subtitle: ($$anchor, $$slotProps) => {
				var text_5 = $.text('Zoom the chart in or out. Display different periods of time.');

				$.append($$anchor, text_5);
			}
		}
	});

	var node_4 = $.sibling(node_3, 2);

	FeatureCard(node_4, {
		$$slots: {
			title: ($$anchor, $$slotProps) => {
				var text_6 = $.text('Layouts');

				$.append($$anchor, text_6);
			},

			subtitle: ($$anchor, $$slotProps) => {
				var text_7 = $.text('Display tasks overlapped or spaced apart.');

				$.append($$anchor, text_7);
			}
		}
	});

	$.reset(div_7);
	$.reset(div_6);
	$.reset(section);
	$.next(2);
	$.reset(main);
	$.template_effect(() => $.set_attribute(a, 'href', `${base ?? ''}/docs/getting-started/installation`));
	$.append($$anchor, main);
	$.pop();
}