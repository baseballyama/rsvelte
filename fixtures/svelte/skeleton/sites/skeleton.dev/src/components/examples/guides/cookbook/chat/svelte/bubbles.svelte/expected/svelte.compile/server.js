import * as $ from 'svelte/internal/server';

export default function Bubbles($$renderer) {
	const messageFeed = [
		{
			id: 0,
			host: true,
			avatar: 48,
			name: 'Jane',
			timestamp: 'Yesterday @ 2:30pm',
			message: 'Some message text.',
			color: 'preset-tonal-primary'
		},

		{
			id: 1,
			host: false,
			avatar: 14,
			name: 'Michael',
			timestamp: 'Yesterday @ 2:45pm',
			message: 'Some message text.',
			color: 'preset-tonal-primary'
		}
	];

	$$renderer.push(`<section class="w-full max-h-[400px] overflow-y-auto space-y-4"><!--[-->`);

	const each_array = $.ensure_array_like(messageFeed);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let bubble = each_array[$$index];

		if (bubble.host) {
			$$renderer.push(`<!--[0--><div class="grid grid-cols-[auto_1fr] gap-2"><div class="card p-4 preset-tonal rounded-tl-none space-y-2"><header class="flex justify-between items-center"><p class="font-bold">${$.escape(bubble.name)}</p> <small class="opacity-50">${$.escape(bubble.timestamp)}</small></header> <p>${$.escape(bubble.message)}</p></div></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="grid grid-cols-[1fr_auto] gap-2"><div${$.attr_class(`card p-4 rounded-tr-none space-y-2 ${bubble.color}`)}><header class="flex justify-between items-center"><p class="font-bold">${$.escape(bubble.name)}</p> <small class="opacity-50">${$.escape(bubble.timestamp)}</small></header> <p>${$.escape(bubble.message)}</p></div></div>`);
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]--></section>`);
}