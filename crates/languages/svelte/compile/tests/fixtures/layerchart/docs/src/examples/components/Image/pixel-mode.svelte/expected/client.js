import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Image, Layer } from 'layerchart';

export default function Pixel_mode($$anchor) {
	Chart($$anchor, {
		padding: { top: 10, bottom: 10, left: 10, right: 10 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Image($$anchor, {
						href: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Meteosat-12-after-eqnx_04-b.jpg/250px-Meteosat-12-after-eqnx_04-b.jpg',
						x: 150,
						y: 140,
						width: 120,
						height: 120,
						r: 60,
						preserveAspectRatio: 'xMidYMid slice'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}