import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function AttachDotNotation($$renderer) {
	if (T.DirectionalLight) {
		$$renderer.push('<!--[-->');

		T.DirectionalLight($$renderer, {
			name: 'light',
			children: ($$renderer) => {
				if (T.OrthographicCamera) {
					$$renderer.push('<!--[-->');
					T.OrthographicCamera($$renderer, { args: [-1, 1, 1, -1, 0.1, 100], attach: 'shadow.camera' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}