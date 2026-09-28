import * as $ from 'svelte/internal/server';
import { modalStack } from './modal-stack';

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let confirmed = undefined;

		async function confirm() {
			const pushed = modalStack.push('confirm');

			({ confirmed } = await pushed.resolution ?? {});
		}

		$$renderer.push(`<div class="not-prose flex items-center gap-2"><button class="c-btn">Trigger Modal</button> `);

		if (confirmed === true) {
			$$renderer.push(`<!--[0--><p class="text-sm font-bold text-green-500">We have an accord.</p>`);
		} else if (confirmed === false) {
			$$renderer.push(`<!--[1--><p class="text-sm font-bold text-red-500">We don't have an accord.</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}