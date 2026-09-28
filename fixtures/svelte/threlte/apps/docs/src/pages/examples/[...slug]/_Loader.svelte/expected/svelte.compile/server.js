import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { getAllAppModules } from './_appModules';

export default function _Loader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { slug } = $$props;
		const allAppModules = getAllAppModules();
		let mounted = false;
		const AppModule = Object.entries(allAppModules).find(([key]) => key === '../../../examples/' + slug + '/App.svelte')?.[1];

		onMount(() => {
			mounted = true;
		});

		if (mounted && AppModule) {
			$$renderer.push('<!--[0-->');

			$.await($$renderer, AppModule(), () => {}, (Mod) => {
				if (Mod.default) {
					$$renderer.push('<!--[-->');
					Mod.default($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			});

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}