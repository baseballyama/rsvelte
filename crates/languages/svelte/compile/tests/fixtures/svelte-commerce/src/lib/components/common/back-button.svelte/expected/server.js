import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import Button from '$lib/components/ui/button/button.svelte';

export default function Back_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title = 'Dashboard', to = '/dash' } = $$props;

		function go() {
			if (to) {
				goto(to);
			} else {
				history.back();
				goto('/dash');
			}
		}

		if (title) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'outline',
				class: 'h-auto px-4 py-2',
				onclick: go,
				children: ($$renderer) => {
					$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-black"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path></svg> <div class="flex flex-col text-left leading-3"><span class="hidden font-medium text-gray-600 sm:block">Prev</span> <span class="font-semibold text-xs pt-1">${$.escape(title)}</span></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}