import * as $ from 'svelte/internal/server';
import { Progress } from '@skeletonlabs/skeleton-svelte';

export default function Format($$renderer) {
	$$renderer.push(`<div class="flex gap-4 justify-evenly items-center w-full">`);

	Progress($$renderer, {
		class: 'items-center w-fit',
		formatOptions: { style: 'percent' },
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

	$$renderer.push(`<!----> `);

	Progress($$renderer, {
		class: 'items-center w-fit',
		formatOptions: { style: 'decimal' },
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

	$$renderer.push(`<!----> `);

	Progress($$renderer, {
		class: 'items-center w-fit',
		formatOptions: { style: 'currency', currency: 'EUR' },
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

	$$renderer.push(`<!----></div>`);
}