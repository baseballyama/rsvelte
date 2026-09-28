import * as $ from 'svelte/internal/server';
import { Chart, ClipPath, Frame, Layer, Pattern } from 'layerchart';

export default function Basic($$renderer) {
	const cx = 150;
	const cy = 150;
	const r = 100;
	const path = `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;

	Chart($$renderer, {
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					{
						function children($$renderer, { pattern }) {
							ClipPath($$renderer, {
								path,
								children: ($$renderer) => {
									Frame($$renderer, { fill: pattern, class: 'stroke-surface-content' });
								},
								$$slots: { default: true }
							});
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