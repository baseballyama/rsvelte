import * as $ from 'svelte/internal/server';
import { Progress } from '../../src/index.js';

export default function Progress_1($$renderer) {
	Progress($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (Progress.Label) {
				$$renderer.push('<!--[-->');

				Progress.Label($$renderer, {
					'data-testid': 'label',
					children: ($$renderer) => {
						if (Progress.ValueText) {
							$$renderer.push('<!--[-->');
							Progress.ValueText($$renderer, { 'data-testid': 'value-text' });
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

			if (Progress.Track) {
				$$renderer.push('<!--[-->');

				Progress.Track($$renderer, {
					'data-testid': 'track',
					children: ($$renderer) => {
						if (Progress.Range) {
							$$renderer.push('<!--[-->');
							Progress.Range($$renderer, { 'data-testid': 'range' });
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

			if (Progress.Circle) {
				$$renderer.push('<!--[-->');

				Progress.Circle($$renderer, {
					'data-testid': 'circle',
					children: ($$renderer) => {
						if (Progress.CircleTrack) {
							$$renderer.push('<!--[-->');
							Progress.CircleTrack($$renderer, { 'data-testid': 'circle-track' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Progress.CircleRange) {
							$$renderer.push('<!--[-->');
							Progress.CircleRange($$renderer, { 'data-testid': 'circle-range' });
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