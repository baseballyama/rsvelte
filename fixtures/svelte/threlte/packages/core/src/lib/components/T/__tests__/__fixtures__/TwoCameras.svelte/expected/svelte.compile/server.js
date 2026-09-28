import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function TwoCameras($$renderer, $$props) {
	let { showSecond } = $$props;

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');
		T.PerspectiveCamera($$renderer, { makeDefault: true, position: [1, 2, 3] });
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
			T.OrthographicCamera($$renderer, { makeDefault: true, position: [4, 5, 6] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}