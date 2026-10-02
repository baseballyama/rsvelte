import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Object3D } from 'three';

export default function Mounter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { parent, children } = $$props;
		const object = new Object3D();

		object.add = (child) => {
			return parent.add(child);
		};

		object.remove = (child) => {
			return parent.remove(child);
		};

		T($$renderer, {
			is: object,
			attach: false,
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}