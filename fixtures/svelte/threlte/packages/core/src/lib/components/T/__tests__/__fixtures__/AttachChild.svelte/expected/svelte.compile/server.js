import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function AttachChild($$renderer, $$props) {
	let { object3d } = $$props;

	T($$renderer, { is: object3d, name: 'child' });
	$$renderer.push(`<!----> `);

	if (T.BoxHelper) {
		$$renderer.push('<!--[-->');
		T.BoxHelper($$renderer, { args: [object3d, 'red'] });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}