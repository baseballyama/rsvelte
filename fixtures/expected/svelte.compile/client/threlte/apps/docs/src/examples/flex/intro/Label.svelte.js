import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Text } from '@threlte/extras';
import { useReflow } from '@threlte/flex';

export default function Label($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, 'white'),
		z = $.prop($$props, 'z', 3, 0),
		fontStyle = $.prop($$props, 'fontStyle', 3, 'regular'),
		anchorX = $.prop($$props, 'anchorX', 3, '50%'),
		anchorY = $.prop($$props, 'anchorY', 3, '50%'),
		fontSize = $.prop($$props, 'fontSize', 3, 'm');

	const fontSizes = { xs: 4, s: 6, m: 8, l: 10, xl: 12 };
	let fontUrl = $.derived(() => `/fonts/inter/inter-${fontStyle()}.ttf`);
	const reflow = useReflow();

	Text($$anchor, {
		get font() {
			return $.get(fontUrl);
		},

		get 'position.z'() {
			return z();
		},

		get text() {
			return $$props.text;
		},

		get anchorX() {
			return anchorX();
		},

		get anchorY() {
			return anchorY();
		},

		get fontSize() {
			return fontSizes[fontSize()];
		},

		get color() {
			return color();
		},

		get onsync() {
			return reflow;
		}
	});

	$.pop();
}