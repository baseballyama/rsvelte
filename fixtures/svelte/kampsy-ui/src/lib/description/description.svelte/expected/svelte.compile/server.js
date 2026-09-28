import * as $ from 'svelte/internal/server';
import { InformationFillSmall } from "$lib/icons/index.js";
import { Tooltip } from "$lib/index.js";

export default function Description($$renderer, $$props) {
	let { content = undefined, title = undefined, tooltip = undefined } = $$props;

	$$renderer.push(`<div><dl><dt class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mb-2 flex items-center text-sm leading-3.5">`);

	if (title) {
		$$renderer.push(`<!--[0-->${$.escape(title)}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (tooltip) {
		$$renderer.push(`<!--[0--><span class="ml-1 h-3.5 w-3.5">`);

		Tooltip($$renderer, {
			text: tooltip,
			children: ($$renderer) => {
				$$renderer.push(`<div class="h-3.5 w-3.5">`);
				InformationFillSmall($$renderer, {});
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></dt> `);

	if (content) {
		$$renderer.push(`<!--[0--><dd class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm leading-4 font-medium">${$.escape(content)}</dd>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></dl></div>`);
}