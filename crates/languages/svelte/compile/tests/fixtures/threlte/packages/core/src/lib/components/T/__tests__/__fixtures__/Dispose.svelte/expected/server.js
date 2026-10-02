import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function Dispose($$renderer, $$props) {
	let { is } = $$props;

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			children: ($$renderer) => {
				T($$renderer, { is });
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}