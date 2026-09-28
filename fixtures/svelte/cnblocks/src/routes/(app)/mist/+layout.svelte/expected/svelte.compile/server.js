import * as $ from 'svelte/internal/server';
import { scrollY } from "svelte/reactivity/window";
import Button from "$lib/components/ui/button/button.svelte";
import MistCategoryNav from "$lib/web/layouts/MistCategoryNav.svelte";
import { fly } from "svelte/transition";

function scrollToTop($$renderer) {
	$$renderer.push(`<div class="fixed right-4 bottom-4 z-50">`);

	Button($$renderer, {
		size: 'icon',
		variant: 'secondary',
		class: 'rounded-full',
		onclick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
		children: ($$renderer) => {
			$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let visible = $.derived(() => typeof scrollY.current === "undefined" ? 600 : scrollY.current > 1200);

		$$renderer.push(`<div>`);
		MistCategoryNav($$renderer, {});
		$$renderer.push(`<!----> <section><div class="h-6 w-full bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] opacity-35"></div></section> `);
		children($$renderer);
		$$renderer.push(`<!----> `);

		if (visible()) {
			$$renderer.push('<!--[0-->');
			scrollToTop($$renderer);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}