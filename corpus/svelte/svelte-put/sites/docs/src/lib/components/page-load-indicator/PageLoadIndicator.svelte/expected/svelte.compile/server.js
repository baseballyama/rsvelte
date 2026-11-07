import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { cubicInOut } from 'svelte/easing';
import { tweened } from 'svelte/motion';

export default function PageLoadIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const p = tweened(0);

		onMount(() => {
			p.set(1, {
				duration: 8000,
				easing(t) {
					const steps = [0, 0.2, 0.6, 0.75, 1];

					for (let i = 0; i < steps.length; i++) {
						if (t < steps[i]) {
							const stepDuration = steps[i] - steps[i - 1];

							return cubicInOut((t - steps[i - 1]) / stepDuration) * stepDuration + steps[i - 1];
						}
					}

					return 1;
				}
			});
		});

		$$renderer.push(`<div class="z-notification fixed left-0 right-0 top-0 h-0.5 w-full"${$.attr_style(`--percentage: ${$.stringify($.store_get($$store_subs ??= {}, '$p', p) * 100)}%`)}><progress max="100"${$.attr('value', $.store_get($$store_subs ??= {}, '$p', p) * 100)} aria-label="page loading indicator" class="invisible">${$.escape($.store_get($$store_subs ??= {}, '$p', p))}%</progress> <div class="absolute left-0 top-0 h-full bg-orange-500" aria-disabled="true"${$.attr_style('', { width: 'var(--percentage)' })}></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}