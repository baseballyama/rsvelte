import * as $ from 'svelte/internal/server';
import { Mesh, MeshPhongMaterial, CylinderGeometry } from 'three';
import { T } from '@threlte/core';
import { XR, Controller, Hand, useHitTest } from '@threlte/xr';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const geometry = new CylinderGeometry(0.1, 0.1, 0.2, 32).translate(0, 0.1, 0);
		let meshes = [];
		let cursors = { left: new Mesh(), right: new Mesh() };
		const hands = ['left', 'right'];

		const handleSelect = (hand) => {
			return () => {
				if (!cursors[hand].visible) return;

				const material = new MeshPhongMaterial({ color: 0xffffff * Math.random() });
				const mesh = new Mesh(geometry, material);

				cursors[hand].matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
				mesh.scale.y = Math.random() * 2 + 1;
				meshes.push(mesh);
			};
		};

		const handleHitTest = (hand) => {
			return (hitMatrix, hit) => {
				if (hit) {
					cursors[hand].visible = true;
					cursors[hand].matrix.copy(hitMatrix);
				} else {
					cursors[hand].visible = false;
				}
			};
		};

		useHitTest(handleHitTest('left'), { source: 'leftInput' });
		useHitTest(handleHitTest('right'), { source: 'rightInput' });

		XR($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(hands);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let hand = each_array[$$index];

					Controller($$renderer, { hand, onselect: handleSelect(hand) });
					$$renderer.push(`<!----> `);
					Hand($$renderer, { hand, onpinchend: handleSelect(hand) });
					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		T($$renderer, {
			is: cursors.left,
			matrixAutoUpdate: false,
			children: ($$renderer) => {
				if (T.RingGeometry) {
					$$renderer.push('<!--[-->');

					T.RingGeometry($$renderer, {
						args: [0.15, 0.2, 32],
						oncreate: (ref) => {
							ref.rotateX(-Math.PI / 2);
						}
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshBasicMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshBasicMaterial($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		T($$renderer, {
			is: cursors.right,
			matrixAutoUpdate: false,
			children: ($$renderer) => {
				if (T.RingGeometry) {
					$$renderer.push('<!--[-->');

					T.RingGeometry($$renderer, {
						args: [0.15, 0.2, 32],
						oncreate: (ref) => {
							ref.rotateX(-Math.PI / 2);
						}
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshBasicMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshBasicMaterial($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (T.HemisphereLight) {
			$$renderer.push('<!--[-->');
			T.HemisphereLight($$renderer, { args: [0xffffff, 0xbbbbff, 1], position: [0.5, 1, 0.25] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.5 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <!--[-->`);

		const each_array_1 = $.ensure_array_like(meshes);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let mesh = each_array_1[$$index_1];

			T($$renderer, { is: mesh });
		}

		$$renderer.push(`<!--]-->`);
	});
}