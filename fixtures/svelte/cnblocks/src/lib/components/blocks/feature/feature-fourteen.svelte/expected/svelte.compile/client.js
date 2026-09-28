import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="col-span-4 sm:col-span-2 lg:col-span-1"><dt class="relative font-semibold text-gray-900 dark:text-gray-50"> <div class="absolute top-1 -left-2 h-4 w-0.5 rounded-full bg-blue-500"></div></dt> <dd class="mt-2 leading-7 text-gray-600 dark:text-gray-400"> </dd></div>`);
var root_1 = $.from_html(`<div class="mx-auto px-4 py-20"><h2 id="benefits-title" class="inline-block bg-linear-to-t from-gray-900 to-gray-800 bg-clip-text py-2 text-3xl font-bold tracking-tighter text-transparent md:text-5xl dark:from-gray-50 dark:to-gray-300">What&rsquo;s in for you</h2> <dl class="mt-8 grid grid-cols-4 gap-x-10 gap-y-8 sm:mt-12 sm:gap-y-10"></dl></div>`);

export default function Feature_fourteen($$anchor) {
	let benefits = [
		{
			title: "Work in Zurich",
			description: "We are in-person first and have a fantastic office in Zurich."
		},

		{
			title: "Competitive salary & equity",
			description: "We pay competitive salary and option packages to attract the very best talent."
		},

		{
			title: "Health, dental, vision",
			description: "Database pays all of your health, dental, and vision insurance."
		},

		{
			title: "Yearly off-sites",
			description: "We bring everyone together at an interesting location to discuss the big picture."
		},

		{
			title: "Book budget",
			description: "We provide every employee with a 350 dollar budget for books."
		},

		{
			title: "Tasty snacks",
			description: "The fridge and pantry are stocked + free dinner catered every night (incl. weekends)."
		},

		{
			title: "20 PTO days per year",
			description: "Take time off to recharge and come back refreshed."
		},

		{
			title: "Spotify Premium",
			description: "We really have the best fringe benefits, even a Spotify subscription is included."
		}
	];

	var div = root_1();
	var dl = $.sibling($.child(div), 2);

	$.each(dl, 21, () => benefits, $.index, ($$anchor, benefit) => {
		var div_1 = root();
		var dt = $.child(div_1);
		var text = $.child(dt);

		$.next();
		$.reset(dt);

		var dd = $.sibling(dt, 2);
		var text_1 = $.only_child(dd, true);

		$.reset(div_1);

		$.template_effect(() => {
			$.set_text(text, `${$.get(benefit).title ?? ''} `);
			$.set_text(text_1, $.get(benefit).description);
		});

		$.append($$anchor, div_1);
	});

	$.reset(dl);
	$.reset(div);
	$.append($$anchor, div);
}