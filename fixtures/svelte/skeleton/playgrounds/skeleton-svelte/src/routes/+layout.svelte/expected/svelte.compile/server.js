import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import './layout.css';
import LightSwitch from './light-switch.svelte';
import { LocaleProvider } from '@skeletonlabs/skeleton-svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children } = $$props;

		const components = Object.keys(import.meta.glob('/src/routes/components/*/+page.svelte')).map((path) => {
			const href = path.replace('/src/routes', '').replace('/+page.svelte', '');
			const name = href.split('/').pop().split('-').map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(' ');

			return { href, name };
		});

		LocaleProvider($$renderer, {
			locale: 'ar-SA',
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid h-screen grid-cols-[320px_minmax(0,1fr)]"><div class="bg-surface-100-900 space-y-8 overflow-y-auto p-8"><header class="flex justify-between items-center"><a class="inline-block text-sm bg-orange-500 p-2 font-mono font-bold text-white"${$.attr('href', resolve('/'))}>skeleton-svelte</a> `);
				LightSwitch($$renderer, {});
				$$renderer.push(`<!----></header> <hr class="hr"/> <div class="flex flex-col gap-4"><div class="font-bold">Components</div> <nav class="text-sm flex flex-col gap-1"><!--[-->`);

				const each_array = $.ensure_array_like(components);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let component = each_array[$$index];

					$$renderer.push(`<a class="anchor"${$.attr('href', component.href)}>${$.escape(component.name)}</a>`);
				}

				$$renderer.push(`<!--]--></nav></div></div> <main class="space-y-8 overflow-y-auto p-8 pb-96">`);
				children?.($$renderer);
				$$renderer.push(`<!----></main></div>`);
			},
			$$slots: { default: true }
		});
	});
}