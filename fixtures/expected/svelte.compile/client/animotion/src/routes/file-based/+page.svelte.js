import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Presentation, Slides } from '$lib/index.js';

export default function _page($$anchor) {
	Presentation($$anchor, {
		options: {
			history: true,
			transition: 'slide',
			controls: true,
			progress: true
		},

		children: ($$anchor, $$slotProps) => {
			Slides($$anchor, { center: true });
		},
		$$slots: { default: true }
	});
}