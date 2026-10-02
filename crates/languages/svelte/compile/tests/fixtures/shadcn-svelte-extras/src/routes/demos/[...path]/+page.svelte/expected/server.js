import * as $ from 'svelte/internal/server';
import Delayed from '$lib/components/delayed.svelte';
import { Spinner } from '$lib/components/ui/spinner/index.js';
import { page } from '$app/state';
import { Button } from '$lib/components/ui/button';
import { MinimizeIcon } from '@lucide/svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const ComponentPromise = import(`$lib/demos/${data.path}.svelte`);
		const from = $.derived(() => page.url.searchParams.get('from'));

		$$renderer.push(`<div class="flex min-h-dvh place-items-center justify-center">`);

		$.await(
			$$renderer,
			ComponentPromise,
			() => {
				Delayed($$renderer, {
					delay: 1000,
					children: ($$renderer) => {
						$$renderer.push(`<span class="text-muted-foreground flex items-center gap-2">`);
						Spinner($$renderer, {});
						$$renderer.push(`<!----> Loading...</span>`);
					},
					$$slots: { default: true }
				});
			},
			({ default: Component }) => {
				if (Component) {
					$$renderer.push('<!--[-->');
					Component($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		);

		$$renderer.push(`<!--]--></div> `);

		if (from() !== null) {
			$$renderer.push(`<!--[0--><div class="fixed top-4 right-4">`);

			Button($$renderer, {
				href: from(),
				size: 'icon',
				variant: 'ghost',
				children: ($$renderer) => {
					MinimizeIcon($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}