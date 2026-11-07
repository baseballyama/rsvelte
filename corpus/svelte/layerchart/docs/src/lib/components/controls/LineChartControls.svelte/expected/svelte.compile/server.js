import * as $ from 'svelte/internal/server';
import { Button } from 'svelte-ux';
import LucideCirclePlay from '~icons/lucide/circle-play';
import LucideCircleStop from '~icons/lucide/circle-stop';

export default function LineChartControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { config = void 0, onStart, onStop } = $$props;

		$$renderer.push(`<div class="mb-4 flex gap-2 items-center">`);

		if (!config.isListening) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				icon: LucideCirclePlay,
				variant: 'fill-outline',
				color: 'primary',
				size: 'sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Start Microphone`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');

			Button($$renderer, {
				icon: LucideCircleStop,
				variant: 'fill-outline',
				color: 'danger',
				size: 'sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Stop Microphone`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--> `);

		if (config.error) {
			$$renderer.push(`<!--[0--><span class="text-danger">${$.escape(config.error)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { config });
	});
}