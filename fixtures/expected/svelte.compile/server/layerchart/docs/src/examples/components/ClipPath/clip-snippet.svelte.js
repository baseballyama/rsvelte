import * as $ from 'svelte/internal/server';
import { Chart, ClipPath, Frame, Layer, Pattern } from 'layerchart';

export default function Clip_snippet($$renderer) {
	Chart($$renderer, {
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { pattern }) {
							{
								function clip($$renderer) {
									$$renderer.push(`<circle cx="120" cy="150" r="90"></circle><circle cx="240" cy="150" r="90"></circle><rect x="100" y="130" width="160" height="40"></rect>`);
								}

								ClipPath($$renderer, {
									clip,
									children: ($$renderer) => {
										Frame($$renderer, { fill: pattern, class: 'stroke-surface-content' });
									},
									$$slots: { clip: true, default: true }
								});
							}
						}

						Pattern($$renderer, {
							size: 6,
							lines: [{ rotate: 45 }, { rotate: -45 }],
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}