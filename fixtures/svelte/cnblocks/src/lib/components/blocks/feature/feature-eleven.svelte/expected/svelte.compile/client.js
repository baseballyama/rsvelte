import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="border-l-2 border-blue-100 pl-6 md:border-l md:text-center lg:border-gray-200 lg:first:border-none dark:border-blue-900 lg:dark:border-gray-800"><dd class="inline-block bg-linear-to-t from-blue-900 to-blue-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent lg:text-6xl dark:from-blue-700 dark:to-blue-400"> </dd> <dt class="mt-1 text-gray-600 dark:text-gray-400"> </dt></div>`);

var root_1 = $.from_html(`<div class="mx-auto w-full max-w-6xl px-3 py-20"><span class="z-10 block w-fit rounded-lg border border-blue-200/20 bg-blue-50/50 px-3 py-1.5 leading-4 font-semibold tracking-tighter uppercase sm:text-sm dark:border-blue-800/30 dark:bg-blue-900/20"><span class="bg-linear-to-b from-blue-500 to-blue-600 bg-clip-text text-transparent dark:from-blue-200 dark:to-blue-400">Security at Scale</span></span> <h2 id="features-title" class="mt-2 inline-block bg-linear-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl dark:from-gray-50 dark:to-gray-300">Architected for speed and reliability</h2> <p class="mt-6 max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-400">Database&rsquo; innovative architecture avoids the central bottlenecks of traditional
		systems, enhancing system reliability. This design ensures high productivity and security,
		minimizing the risk of service disruptions and outages.</p> <dl class="mt-12 grid grid-cols-1 gap-y-8 md:grid-cols-3 md:border-y md:border-gray-200 md:py-14 dark:border-gray-800"></dl></div>`);

export default function Feature_eleven($$anchor) {
	const stats = [
		{ name: "Bandwidth increase", value: "+162%" },
		{ name: "Better storage efficiency", value: "2-3x" },
		{ name: "Rows ingested / second", value: "Up to 9M" }
	];

	var div = root_1();
	var dl = $.sibling($.child(div), 6);

	$.each(dl, 21, () => stats, $.index, ($$anchor, stat) => {
		var div_1 = root();
		var dd = $.child(div_1);
		var text = $.only_child(dd, true);
		var dt = $.sibling(dd, 2);
		var text_1 = $.only_child(dt, true);

		$.reset(div_1);

		$.template_effect(() => {
			$.set_text(text, $.get(stat).value);
			$.set_text(text_1, $.get(stat).name);
		});

		$.append($$anchor, div_1);
	});

	$.reset(dl);
	$.reset(div);
	$.append($$anchor, div);
}