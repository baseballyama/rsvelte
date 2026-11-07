import * as $ from 'svelte/internal/server';
import { Progress } from '@skeletonlabs/skeleton-svelte';

export default function Orientation($$renderer) {
	Progress($$renderer, {
		orientation: 'vertical',
		children: ($$renderer) => {
			if (Progress.Track) {
				$$renderer.push('<!--[-->');

				Progress.Track($$renderer, {
					children: ($$renderer) => {
						if (Progress.Range) {
							$$renderer.push('<!--[-->');
							Progress.Range($$renderer, {});
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