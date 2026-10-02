import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="col-span-full sm:col-span-2 lg:col-span-1"><span class="rounded-lg bg-blue-50/50 px-3 py-1.5 leading-4 font-semibold tracking-tighter shadow-sm ring-1 shadow-blue-500/20 ring-blue-200/20 sm:text-sm dark:bg-blue-900/20 dark:ring-blue-800/30"><span class="bg-linear-to-b from-blue-400 to-blue-600 bg-clip-text text-transparent dark:from-blue-200 dark:to-blue-400"> </span></span> <dt class="mt-6 font-semibold text-gray-900 dark:text-gray-50"> </dt> <dd class="mt-2 leading-7 text-gray-600 dark:text-gray-400"> </dd></div>`);
var root_1 = $.from_html(`<div class="mx-auto w-full max-w-6xl px-3 py-20"><dl class="grid grid-cols-4 gap-10"></dl></div>`);

export default function Feature_thirteen($$anchor) {
	const features = [
		{
			title: "1. Prototype",
			subtitle: "Build fast, test early",
			description: "Quickly spin up a working model with libraries for popular frameworks like React."
		},

		{
			title: "2. Present",
			subtitle: "Showcase your vision",
			description: "Use intuitive plug & play features to prepare a live demo and deploy from our platform."
		},

		{
			title: "3. Iterate",
			subtitle: "Refine and improve",
			description: "Continuously enhance your product by integrating with over a hundred tools."
		},

		{
			title: "4. Deploy",
			subtitle: "Launch with confidence",
			description: "Deploy securely with encryption, ensuring data compliance and user consent."
		}
	];

	var div = root_1();
	var dl = $.child(div);

	$.each(dl, 21, () => features, $.index, ($$anchor, item) => {
		var div_1 = root();
		var span = $.child(div_1);
		var span_1 = $.child(span);
		var text = $.only_child(span_1, true);

		$.reset(span);

		var dt = $.sibling(span, 2);
		var text_1 = $.only_child(dt, true);
		var dd = $.sibling(dt, 2);
		var text_2 = $.only_child(dd, true);

		$.reset(div_1);

		$.template_effect(() => {
			$.set_text(text, $.get(item).title);
			$.set_text(text_1, $.get(item).subtitle);
			$.set_text(text_2, $.get(item).description);
		});

		$.append($$anchor, div_1);
	});

	$.reset(dl);
	$.reset(div);
	$.append($$anchor, div);
}