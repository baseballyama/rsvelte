import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DatabaseZap from "@lucide/svelte/icons/database-zap";
import Link from "@lucide/svelte/icons/link";
import Plug from "@lucide/svelte/icons/plug";
import Shield from "@lucide/svelte/icons/shield";

var root = $.from_html(`<div class="col-span-full sm:col-span-2 lg:col-span-1"><div class="w-fit rounded-lg p-2 shadow-md ring-1 shadow-blue-400/30 ring-black/5 dark:shadow-blue-600/30 dark:ring-white/5"><!></div> <dt class="mt-6 font-semibold text-gray-900 dark:text-gray-50"> </dt> <dd class="mt-2 leading-7 text-gray-600 dark:text-gray-400"> </dd></div>`);
var root_1 = $.from_html(`<div class="mx-auto w-full max-w-6xl px-3 py-20"><dl class="grid grid-cols-4 gap-10"></dl></div>`);

export default function Feature_twelve($$anchor) {
	const features = [
		{
			name: "Use Database with your stack",
			description: "We offer client and server libraries in everything from React and Ruby to iOS.",
			icon: DatabaseZap
		},

		{
			name: "Try plug & play options",
			description: "Customize and deploy data infrastructure directly from the Database Dashboard.",
			icon: Plug
		},

		{
			name: "Explore pre-built integrations",
			description: "Connect Database to over a hundred tools including Stripe, Salesforce, or Quickbooks.",
			icon: Link
		},

		{
			name: "Security & privacy",
			description: "Database supports PII data encrypted with AES-256 at rest or explicit user consent flows.",
			icon: Shield
		}
	];

	var div = root_1();
	var dl = $.child(div);

	$.each(dl, 21, () => features, $.index, ($$anchor, item) => {
		const Icon = $.derived(() => $.get(item).icon);
		var div_1 = root();
		var div_2 = $.child(div_1);
		var node = $.child(div_2);

		$.component(node, () => $.get(Icon), ($$anchor, Icon_1) => {
			Icon_1($$anchor, {
				'aria-hidden': 'true',
				class: 'size-6 text-blue-600 dark:text-blue-400'
			});
		});

		$.reset(div_2);

		var dt = $.sibling(div_2, 2);
		var text = $.only_child(dt, true);
		var dd = $.sibling(dt, 2);
		var text_1 = $.only_child(dd, true);

		$.reset(div_1);

		$.template_effect(() => {
			$.set_text(text, $.get(item).name);
			$.set_text(text_1, $.get(item).description);
		});

		$.append($$anchor, div_1);
	});

	$.reset(dl);
	$.reset(div);
	$.append($$anchor, div);
}