import * as $ from 'svelte/internal/server';
import { Text } from '@threlte/extras';
import { useReflow } from '@threlte/flex';

export default function Label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text,
			color = 'white',
			z = 0,
			fontStyle = 'regular',
			anchorX = '50%',
			anchorY = '50%',
			fontSize = 'm'
		} = $$props;

		const fontSizes = { xs: 4, s: 6, m: 8, l: 10, xl: 12 };
		let fontUrl = $.derived(() => `/fonts/inter/inter-${fontStyle}.ttf`);
		const reflow = useReflow();

		Text($$renderer, {
			font: fontUrl(),
			'position.z': z,
			text,
			anchorX,
			anchorY,
			fontSize: fontSizes[fontSize],
			color,
			onsync: reflow
		});
	});
}