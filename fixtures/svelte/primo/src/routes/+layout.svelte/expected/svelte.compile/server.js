import * as $ from 'svelte/internal/server';
import '$lib/app.css';
import { browser } from '$app/environment';
import { compilers_registered } from '$lib/stores';
import { registerProcessors } from '$lib/builder/component';
import { Toaster } from '$lib/components/ui/sonner';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;

		if (browser) {
			const loader = document.getElementById('app-boot-loader');

			if (loader) {
				loader.classList.add('hidden');
				setTimeout(() => loader.remove(), 250);
			}

			import('$lib/compiler/processors').then(({ html, css }) => {
				registerProcessors({ html, css });
				$.store_set(compilers_registered, true);
			});
		}

		$.head('12qhfyh', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="preconnect" href="https://fonts.bunny.net"/> <link href="https://fonts.bunny.net/css2?family=Fira+Code:wght@300..700&amp;display=swap" rel="stylesheet"/>`);
		});

		Toaster($$renderer, {});
		$$renderer.push(`<!----> `);
		children?.($$renderer);
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}