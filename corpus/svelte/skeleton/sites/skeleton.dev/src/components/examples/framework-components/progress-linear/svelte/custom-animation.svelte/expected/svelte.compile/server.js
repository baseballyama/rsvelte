import * as $ from 'svelte/internal/server';
import { Progress } from '@skeletonlabs/skeleton-svelte';

export default function Custom_animation($$renderer) {
	Progress($$renderer, {
		value: null,
		children: ($$renderer) => {
			if (Progress.Track) {
				$$renderer.push('<!--[-->');

				Progress.Track($$renderer, {
					children: ($$renderer) => {
						if (Progress.Range) {
							$$renderer.push('<!--[-->');
							Progress.Range($$renderer, { class: 'animate-[custom-animation_2s_ease-in-out_infinite]' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}