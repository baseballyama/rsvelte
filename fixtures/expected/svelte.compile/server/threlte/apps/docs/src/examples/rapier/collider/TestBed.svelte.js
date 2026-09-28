import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { HTML } from '@threlte/extras';
import { AutoColliders } from '@threlte/rapier';
import { MathUtils } from 'three';

export default function TestBed($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title, useGround = true, text, children } = $$props;

		if (useGround) {
			$$renderer.push('<!--[0-->');

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [1, -0.5, 0],
					children: ($$renderer) => {
						AutoColliders($$renderer, {
							shape: 'cuboid',
							children: ($$renderer) => {
								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										receiveShadow: true,
										children: ($$renderer) => {
											if (T.BoxGeometry) {
												$$renderer.push('<!--[-->');
												T.BoxGeometry($$renderer, { args: [12, 1, 10] });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (T.MeshStandardMaterial) {
												$$renderer.push('<!--[-->');
												T.MeshStandardMaterial($$renderer, {});
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
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		HTML($$renderer, {
			transform: true,
			'rotation.z': 90 * MathUtils.DEG2RAD,
			'rotation.x': -90 * MathUtils.DEG2RAD,
			'position.x': 5.8,
			pointerEvents: 'none',
			scale: 0.6,
			children: ($$renderer) => {
				$$renderer.push(`<div class="w-[500px] -translate-y-1/2 transform text-black"><h2>${$.escape(title)}</h2> <div class="leading-normal">`);
				text?.($$renderer);
				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}