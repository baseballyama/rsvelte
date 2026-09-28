import * as $ from 'svelte/internal/server';
import * as CamerakitPlugin from '@tweakpane/plugin-camerakit';
import { OrthographicCamera, PerspectiveCamera } from 'three';
import TransactionalBinding from './TransactionalBinding.svelte';
import { areOfType } from './utils.js';

export default function Camera($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { objects } = $$props;
		const orthographicKeys = ['bottom', 'left', 'top', 'right'];

		TransactionalBinding($$renderer, { objects, key: 'near', label: 'near' });
		$$renderer.push(`<!----> `);
		TransactionalBinding($$renderer, { objects, key: 'far', label: 'far' });
		$$renderer.push(`<!----> `);
		TransactionalBinding($$renderer, { objects, key: 'zoom', label: 'zoom', options: { min: 0 } });
		$$renderer.push(`<!----> `);

		if (areOfType(objects, 'isPerspectiveCamera')) {
			$$renderer.push('<!--[0-->');

			TransactionalBinding($$renderer, {
				objects,
				key: 'fov',
				label: 'fov',
				plugin: CamerakitPlugin,
				options: { view: 'cameraring', min: 0, max: 180, format: (n) => `${n}°` }
			});

			$$renderer.push(`<!----> `);
			TransactionalBinding($$renderer, { objects, key: 'filmOffset', label: 'filmOffset' });
			$$renderer.push(`<!----> `);
			TransactionalBinding($$renderer, { objects, key: 'filmGauge', label: 'filmGauge' });
			$$renderer.push(`<!---->`);
		} else if (areOfType(objects, 'isOrthographicCamera')) {
			$$renderer.push(`<!--[1--><!--[-->`);

			const each_array = $.ensure_array_like(orthographicKeys);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let key = each_array[$$index];

				TransactionalBinding($$renderer, { objects, key, label: key });
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}