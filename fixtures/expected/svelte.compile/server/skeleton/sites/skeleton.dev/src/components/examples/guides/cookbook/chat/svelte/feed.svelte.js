import * as $ from 'svelte/internal/server';

export default function Feed($$renderer) {
	const messageFeed = [
		{
			id: 0,
			host: true,
			avatar: 48,
			name: 'Jane',
			timestamp: 'Yesterday @ 2:30pm',
			message: 'Some message text.',
			color: 'variant-soft-primary'
		},

		{
			id: 1,
			host: false,
			avatar: 14,
			name: 'Michael',
			timestamp: 'Yesterday @ 2:45pm',
			message: 'Some message text.',
			color: 'variant-soft-primary'
		}
	];

	$$renderer.push(`<section class="w-full max-h-[400px] overflow-y-auto space-y-4"><!--[-->`);

	const each_array = $.ensure_array_like(messageFeed);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let bubble = each_array[$$index];
		const role = bubble.host === true ? 'host' : 'guest';

		$$renderer.push(`<pre class="pre">${$.escape(JSON.stringify({ role, ...bubble }, null, 2))}</pre>`);
	}

	$$renderer.push(`<!--]--></section>`);
}