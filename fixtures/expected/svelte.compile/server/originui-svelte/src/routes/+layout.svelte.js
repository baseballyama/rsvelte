import * as $ from 'svelte/internal/server';
import Footer from '$lib/demo/layout/footer.svelte';
import '../app.css';
import Header from '$lib/demo/layout/header.svelte';
import interVariableWoff2 from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2';
import { page } from '$app/state';
import { ModeWatcher } from 'mode-watcher';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, data } = $$props;

		$.head('12qhfyh', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="preload"${$.attr('href', interVariableWoff2)} as="font" type="font/woff2" crossorigin="anonymous"/>`);
		});

		ModeWatcher($$renderer, { defaultMode: 'system' });
		$$renderer.push(`<!----> <div class="overflow-hidden px-4 supports-[overflow:clip]:overflow-clip sm:px-6" data-vaul-drawer-wrapper=""${$.attr('data-home', page.url.pathname === '/')}><div class="before:bg-[linear-gradient(to_bottom,--theme(--color-svelte/.3),--theme(--color-border)_200px,--theme(--color-border)_calc(100%-200px),--theme(--color-svelte/.3))] after:bg-[linear-gradient(to_bottom,--theme(--color-svelte/.3),--theme(--color-border)_200px,--theme(--color-border)_calc(100%-200px),--theme(--color-svelte/.3))] relative mx-auto w-full max-w-6xl before:absolute before:inset-y-0 before:-left-12 before:w-px after:absolute after:inset-y-0 after:-right-12 after:w-px"><div class="relative flex min-h-screen flex-col">`);
		Header($$renderer, {});
		$$renderer.push(`<!----> `);
		children($$renderer);
		$$renderer.push(`<!----> `);
		Footer($$renderer, { footerLinks: data.footerLinks });
		$$renderer.push(`<!----></div></div></div>`);
	});
}