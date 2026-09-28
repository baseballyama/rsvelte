import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function NestedAttach($$renderer, $$props) {
	let { light, camera } = $$props;

	T($$renderer, {
		is: light,
		children: ($$renderer) => {
			T($$renderer, { is: camera, attach: 'shadow.camera' });
		},
		$$slots: { default: true }
	});
}