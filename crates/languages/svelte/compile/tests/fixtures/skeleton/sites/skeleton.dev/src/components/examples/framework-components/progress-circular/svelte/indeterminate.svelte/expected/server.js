import * as $ from 'svelte/internal/server';
import { Progress } from '@skeletonlabs/skeleton-svelte';

export default function Indeterminate($$renderer) {
	Progress($$renderer, {
		class: 'items-center w-fit',
		value: null,
		children: ($$renderer) => {
			if (Progress.Circle) {
				$$renderer.push('<!--[-->');

				Progress.Circle($$renderer, {
					children: ($$renderer) => {
						if (Progress.CircleTrack) {
							$$renderer.push('<!--[-->');
							Progress.CircleTrack($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Progress.CircleRange) {
							$$renderer.push('<!--[-->');
							Progress.CircleRange($$renderer, {});
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

			$$renderer.push(` `);

			if (Progress.ValueText) {
				$$renderer.push('<!--[-->');
				Progress.ValueText($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}