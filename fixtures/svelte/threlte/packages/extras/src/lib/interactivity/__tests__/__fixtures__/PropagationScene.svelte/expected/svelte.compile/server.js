import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { BoxGeometry, MeshBasicMaterial } from 'three';

export default function PropagationScene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;
		const geometry = new BoxGeometry(2, 2, 2);
		const material = new MeshBasicMaterial();

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');
			T.PerspectiveCamera($$renderer, { makeDefault: true, args: [75, 1, 0.1, 1000], 'position.z': 0 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				name: 'Parent',
				onpointerdown: props.onpointerdownParent,
				onpointerover: props.onpointeroverParent,
				onpointerout: props.onpointeroutParent,
				onpointerleave: props.onpointerleaveParent,
				onpointerenter: props.onpointerenterParent,
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							name: 'Child',
							geometry,
							material,
							'position.z': -5,
							onpointerdown: props.onpointerdownChild,
							onpointerover: props.onpointeroverChild,
							onpointerout: props.onpointeroutChild,
							onpointerleave: props.onpointerleaveChild,
							onpointerenter: props.onpointerenterChild
						});

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
	});
}