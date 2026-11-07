import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, ClipPath, Frame, Layer, Pattern } from 'layerchart';

export default function Basic($$anchor) {
	const cx = 150;
	const cy = 150;
	const r = 100;
	const path = `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;

	Chart($$anchor, {
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;

							ClipPath($$anchor, {
								path,
								children: ($$anchor, $$slotProps) => {
									Frame($$anchor, {
										get fill() {
											return pattern();
										},
										class: 'stroke-surface-content'
									});
								},
								$$slots: { default: true }
							});
						};

						Pattern($$anchor, {
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