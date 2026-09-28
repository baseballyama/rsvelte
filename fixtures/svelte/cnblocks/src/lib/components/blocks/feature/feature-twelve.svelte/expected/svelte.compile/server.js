import * as $ from 'svelte/internal/server';
import DatabaseZap from "@lucide/svelte/icons/database-zap";
import Link from "@lucide/svelte/icons/link";
import Plug from "@lucide/svelte/icons/plug";
import Shield from "@lucide/svelte/icons/shield";

export default function Feature_twelve($$renderer) {
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

	$$renderer.push(`<div class="mx-auto w-full max-w-6xl px-3 py-20"><dl class="grid grid-cols-4 gap-10"><!--[-->`);

	const each_array = $.ensure_array_like(features);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		const Icon = item.icon;

		$$renderer.push(`<div class="col-span-full sm:col-span-2 lg:col-span-1"><div class="w-fit rounded-lg p-2 shadow-md ring-1 shadow-blue-400/30 ring-black/5 dark:shadow-blue-600/30 dark:ring-white/5">`);

		if (Icon) {
			$$renderer.push('<!--[-->');

			Icon($$renderer, {
				'aria-hidden': 'true',
				class: 'size-6 text-blue-600 dark:text-blue-400'
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div> <dt class="mt-6 font-semibold text-gray-900 dark:text-gray-50">${$.escape(item.name)}</dt> <dd class="mt-2 leading-7 text-gray-600 dark:text-gray-400">${$.escape(item.description)}</dd></div>`);
	}

	$$renderer.push(`<!--]--></dl></div>`);
}