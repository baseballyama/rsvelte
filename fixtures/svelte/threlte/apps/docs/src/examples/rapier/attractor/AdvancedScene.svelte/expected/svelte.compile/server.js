import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { Attractor, Collider, RigidBody } from '@threlte/rapier';
import { MeshBasicMaterial, SphereGeometry } from 'three';

const geometry = new SphereGeometry(1);
const material = new MeshBasicMaterial({ color: 'red' });

export default function AdvancedScene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { type = 'static' } = $$props;
		let hide = false;

		const reset = () => {
			hide = true;
			setTimeout(() => hide = false);
		};

		const config = {
			static: {
				type: 'static',
				strength: 3,
				range: 100,
				gravitationalConstant: undefined
			},
			linear: {
				type: 'linear',
				strength: 1,
				range: 100,
				gravitationalConstant: undefined
			},
			newtonian: {
				type: 'newtonian',
				strength: 10,
				range: 100,
				gravitationalConstant: 10
			}
		};

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				'position.y': 50,
				'position.z': 100,
				makeDefault: true,
				fov: 70,
				far: 10000,
				children: ($$renderer) => {
					OrbitControls($$renderer, { 'target.y': 20 });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { castShadow: true, position: [8, 20, -3] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.GridHelper) {
			$$renderer.push('<!--[-->');
			T.GridHelper($$renderer, { args: [100] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (!hide) {
			$$renderer.push('<!--[0-->');

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [-50, 0, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							linearVelocity: [5, -5, 0],
							children: ($$renderer) => {
								Collider($$renderer, { shape: 'ball', args: [1], mass: config[type].strength });
								$$renderer.push(`<!----> `);

								if (T.Mesh) {
									$$renderer.push('<!--[-->');
									T.Mesh($$renderer, { geometry, material });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								Attractor($$renderer, {
									range: config[type].range,
									gravitationalConstant: config[type].gravitationalConstant,
									strength: config[type].strength,
									gravityType: type
								});

								$$renderer.push(`<!---->`);
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

			$$renderer.push(` `);

			RigidBody($$renderer, {
				linearVelocity: [0, 5, 0],
				children: ($$renderer) => {
					Collider($$renderer, { shape: 'ball', args: [1], mass: config[type].strength });
					$$renderer.push(`<!----> `);

					if (T.Mesh) {
						$$renderer.push('<!--[-->');
						T.Mesh($$renderer, { geometry, material });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Attractor($$renderer, {
						range: config[type].range,
						gravitationalConstant: config[type].gravitationalConstant,
						strength: config[type].strength,
						gravityType: type
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [50, 0, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							linearVelocity: [-5, 0, 5],
							children: ($$renderer) => {
								Collider($$renderer, { shape: 'ball', args: [1], mass: config[type].strength });
								$$renderer.push(`<!----> `);

								if (T.Mesh) {
									$$renderer.push('<!--[-->');
									T.Mesh($$renderer, { geometry, material });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								Attractor($$renderer, {
									range: config[type].range,
									gravitationalConstant: config[type].gravitationalConstant,
									strength: config[type].strength,
									gravityType: type
								});

								$$renderer.push(`<!---->`);
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

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { reset });
	});
}