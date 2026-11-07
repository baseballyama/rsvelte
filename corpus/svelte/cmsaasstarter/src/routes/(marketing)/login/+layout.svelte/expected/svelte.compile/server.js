import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let isEurope = false;

		try {
			isEurope = Intl.DateTimeFormat().resolvedOptions().timeZone.startsWith("Europe/");
		} catch {
			/* continue */
		}

		$$renderer.push(`<div class="text-center content-center max-w-lg mx-auto min-h-[70vh] pb-12 flex items-center place-content-center"><div class="flex flex-col w-64 lg:w-80">`);
		children?.($$renderer);
		$$renderer.push(`<!----> <div${$.attr_class(`mt-8 ${isEurope ? 'block' : 'hidden'}`)}>🍪 Logging in uses Cookies 🍪</div></div></div>`);
	});
}