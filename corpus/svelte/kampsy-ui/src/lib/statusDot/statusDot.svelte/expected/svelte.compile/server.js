import * as $ from 'svelte/internal/server';

export default function StatusDot($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label = false, state = "QUEUED" } = $$props;

		const stateObj = {
			QUEUED: "bg-kui-light-gray-400 dark:bg-kui-dark-gray-400",
			BUILDING: "bg-kui-light-amber-600 dark:bg-kui-dark-amber-600",
			ERROR: "bg-kui-light-red-600 dark:bg-kui-dark-red-600",
			READY: "bg-kui-light-green-600 dark:bg-kui-dark-green-600",
			CANCELED: "bg-kui-light-gray-400 dark:bg-kui-dark-gray-400"
		};

		$$renderer.push(`<div class="flex items-center gap-x-2"><div${$.attr_class(`h-2.5 w-2.5 rounded-full ${$.stringify(stateObj[state])}`)}></div> `);

		if (label) {
			$$renderer.push(`<!--[0--><span class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm leading-4 first-letter:capitalize">${$.escape(state.toLowerCase())}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}