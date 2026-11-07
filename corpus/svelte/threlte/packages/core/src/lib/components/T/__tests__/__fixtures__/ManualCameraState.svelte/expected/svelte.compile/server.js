import * as $ from 'svelte/internal/server';
import { T, useCamera } from '@threlte/core';

export default function ManualCameraState($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			firstMakeDefault = true,
			firstManual = true,
			onmanual,
			secondManual = true,
			showSecond = false
		} = $$props;

		const camera = useCamera();

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');
			T.PerspectiveCamera($$renderer, { makeDefault: firstMakeDefault, manual: firstManual });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (showSecond) {
			$$renderer.push('<!--[0-->');

			if (T.OrthographicCamera) {
				$$renderer.push('<!--[-->');
				T.OrthographicCamera($$renderer, { makeDefault: true, manual: secondManual });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}