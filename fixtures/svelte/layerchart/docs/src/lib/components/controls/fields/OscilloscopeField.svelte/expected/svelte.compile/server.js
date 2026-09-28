import * as $ from 'svelte/internal/server';
import { Button } from 'svelte-ux';
import LucideCirclePlay from '~icons/lucide/circle-play';
import LucideCircleStop from '~icons/lucide/circle-stop';

export default function OscilloscopeField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			isListening = void 0,
			error = void 0,
			startMicrophone,
			stopMicrophone
		} = $$props;

		$$renderer.push(`<div class="mb-4 flex gap-2 items-center">`);

		if (!isListening) {
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

		if (error) {
			$$renderer.push(`<!--[0--><span class="text-danger">${$.escape(error)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { isListening, error });
	});
}