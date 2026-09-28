import * as $ from 'svelte/internal/server';
import { Progress } from '@skeletonlabs/skeleton-svelte';

export default function Centered_content($$renderer) {
	Progress($$renderer, {
		class: 'w-fit relative',
		children: ($$renderer) => {
			$$renderer.push(`<div class="absolute inset-0 flex items-center justify-center">`);

			if (Progress.ValueText) {
				$$renderer.push('<!--[-->');
				Progress.ValueText($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> `);

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
		},
		$$slots: { default: true }
	});
}