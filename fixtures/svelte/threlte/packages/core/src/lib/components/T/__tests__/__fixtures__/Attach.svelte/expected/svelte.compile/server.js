import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import AttachChild from './AttachChild.svelte';
import { Mesh } from 'three';

export default function Attach($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { attach } = $$props;
		let object3d = $.derived(() => attach ? new Mesh() : undefined);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				name: 'parent',
				children: ($$renderer) => {
					if (object3d()) {
						$$renderer.push('<!--[0-->');
						AttachChild($$renderer, { object3d: object3d() });
					} else {
						$$renderer.push('<!--[-1-->');

						if (T.Group) {
							$$renderer.push('<!--[-->');
							T.Group($$renderer, { name: 'child2' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}