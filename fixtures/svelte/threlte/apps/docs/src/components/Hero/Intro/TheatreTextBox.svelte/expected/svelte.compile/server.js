import * as $ from 'svelte/internal/server';
import { createSheetObjectAction } from '@threlte/theatre';
import Reveal from '../Reveal.svelte';
import FadeOut from '../FadeOut.svelte';

export default function TheatreTextBox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const sheetObject = createSheetObjectAction();
		let { key, children, $$slots, $$events, ...rest } = $$props;
		let reveal = 0;
		let fade = 0;

		$$renderer.push(`<div${$.attributes({ ...rest })}>`);

		Reveal($$renderer, {
			progress: reveal,
			children: ($$renderer) => {
				FadeOut($$renderer, {
					progress: fade,
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}