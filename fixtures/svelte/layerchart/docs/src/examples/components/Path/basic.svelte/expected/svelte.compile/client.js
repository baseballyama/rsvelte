import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Path, Layer } from 'layerchart';

export default function Basic($$anchor) {
	Chart($$anchor, {
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Path($$anchor, {
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