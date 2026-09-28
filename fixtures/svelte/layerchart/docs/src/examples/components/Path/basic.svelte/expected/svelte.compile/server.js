import * as $ from 'svelte/internal/server';
import { Chart, Path, Layer } from 'layerchart';

export default function Basic($$renderer) {
	Chart($$renderer, {
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Path($$renderer, {
						pathData: 'M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80',
						strokeWidth: 2
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}