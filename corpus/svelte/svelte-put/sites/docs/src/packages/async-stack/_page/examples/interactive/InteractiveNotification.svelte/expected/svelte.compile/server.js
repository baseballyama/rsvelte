import * as $ from 'svelte/internal/server';
import { fly } from 'svelte/transition';

export default function InteractiveNotification($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item, message } = $$props;

		// :::highlight
		const join = () => item.resolve(true);

		const del = () => item.resolve(false);

		$$renderer.push(`<div class="bg-bg-100 pointer-events-auto rounded-sm px-4 py-2 shadow-lg"><p class="text-xl font-bold">Invitation</p> <p class="text-lg">${$.escape(
			// :::
			message
		)}</p> <div class="flex gap-6"><button class="c-btn w-40">Join</button> <button class="c-btn c-btn--outlined w-40">Delete</button></div></div>`);
	});
}