import * as $ from 'svelte/internal/server';
import { Presentation, Slides } from '$lib/index.js';

export default function _page($$renderer) {
	Presentation($$renderer, {
		options: {
			history: true,
			transition: 'slide',
			controls: true,
			progress: true
		},

		children: ($$renderer) => {
			Slides($$renderer, { center: true });
		},
		$$slots: { default: true }
	});
}