import * as $ from 'svelte/internal/server';
import { Progress } from '@skeletonlabs/skeleton-svelte';

export default function Height($$renderer) {
	$$renderer.push(`<div class="flex w-full flex-col gap-8">`);

	Progress($$renderer, {
		children: ($$renderer) => {
			if (Progress.Track) {
				$$renderer.push('<!--[-->');

				Progress.Track($$renderer, {
					class: 'h-1',
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

	$$renderer.push(`<!----> `);

	Progress($$renderer, {
		children: ($$renderer) => {
			if (Progress.Track) {
				$$renderer.push('<!--[-->');

				Progress.Track($$renderer, {
					class: 'h-4',
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

	$$renderer.push(`<!----> `);

	Progress($$renderer, {
		children: ($$renderer) => {
			if (Progress.Track) {
				$$renderer.push('<!--[-->');

				Progress.Track($$renderer, {
					class: 'h-6',
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

	$$renderer.push(`<!----></div>`);
}