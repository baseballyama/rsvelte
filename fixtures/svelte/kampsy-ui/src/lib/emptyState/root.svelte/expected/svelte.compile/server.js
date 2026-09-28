import * as $ from 'svelte/internal/server';

export default function Root($$renderer, $$props) {
	let {
		title,
		description,
		icon,
		children,
		$$slots,
		$$events,
		...rest
	} = $$props;

	$$renderer.push(`<div${$.attributes({
		...rest,
		class: 'border-kui-light-gray-400 dark:border-kui-dark-gray-200 w-full rounded-lg border px-17.5 py-12'
	})}><div class="grid justify-items-center gap-6">`);

	if (icon) {
		$$renderer.push('<!--[0-->');

		const Icon = icon;

		$$renderer.push(`<div class="flex w-full justify-center"><div class="border-kui-light-gray-400 dark:border-kui-dark-gray-200 flex h-15 w-15.5 items-center justify-center rounded-lg border"><div class="h-8 w-8">`);

		if (Icon) {
			$$renderer.push('<!--[-->');
			Icon($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div></div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div class="mx-auto flex max-w-85 flex-col gap-2"><p class="text-kui-light-dark-gray-1000 dark:text-kui-dark-gray-1000 text-center text-base capitalize"><span>${$.escape(title)}</span></p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-center text-sm"><span class="inline-block text-balance">${$.escape(description)}</span></p></div> `);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div></div>`);
}