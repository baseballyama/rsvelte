import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';

export default function KeyboardControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			translationSnap = 1,
			rotationSnap = 15 * MathUtils.DEG2RAD,
			scaleSnap = 0.1,
			children
		} = $$props;

		let useSnap = false;
		let mode = 'translate';
		let space = 'local';

		const onKeyDown = (e) => {
			// toggle snap on Shift
			if (e.key === 'Shift') {
				useSnap = true;
			}
		};

		const onKeyUp = (e) => {
			if (e.key === 'Shift') {
				useSnap = false;
			}
		};

		const onKeyPress = (e) => {
			if (e.key === 't') mode = 'translate';
			if (e.key === 'r') mode = 'rotate';
			if (e.key === 's') mode = 'scale';

			if (e.key === 'g') {
				if (space === 'world') {
					space = 'local';
				} else {
					space = 'world';
				}
			}
		};

		children?.($$renderer, {
			transform: {
				translationSnap: useSnap ? translationSnap : undefined,
				rotationSnap: useSnap ? rotationSnap : undefined,
				scaleSnap: useSnap ? scaleSnap : undefined,
				mode,
				space
			}
		});

		$$renderer.push(`<!---->`);
	});
}