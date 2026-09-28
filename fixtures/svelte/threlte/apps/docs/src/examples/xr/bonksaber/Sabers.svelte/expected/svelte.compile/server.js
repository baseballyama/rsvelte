import * as $ from 'svelte/internal/server';
import { Vector3, Quaternion, Group } from 'three';
import { T, useTask } from '@threlte/core';
import { FakeGlowMaterial, Outlines } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';
import { Controller, Hand, useController, useXR } from '@threlte/xr';

export default function Sabers($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { isHandTracking } = useXR();
		const leftController = useController('left');
		const rightController = useController('right');

		const pulse = (hand) => {
			const controller = hand === 'left' ? leftController.current : rightController.current;

			controller?.inputSource.gamepad?.hapticActuators[0]?.pulse(0.8, 80);
		};

		let rigidBodyLeft = void 0;
		let rigidBodyRight = void 0;
		const leftSaber = new Group();
		const rightSaber = new Group();
		const leftHandSaber = new Group();
		const rightHandSaber = new Group();
		const left = $.derived(() => isHandTracking.current ? leftHandSaber : leftSaber);
		const right = $.derived(() => isHandTracking.current ? rightHandSaber : rightSaber);
		const vec3 = new Vector3();
		const quaternion = new Quaternion();

		useTask(() => {
			rigidBodyLeft?.setTranslation(left().getWorldPosition(vec3), true);
			rigidBodyLeft?.setRotation(left().getWorldQuaternion(quaternion), true);
			rigidBodyRight?.setTranslation(right().getWorldPosition(vec3), true);
			rigidBodyRight?.setRotation(right().getWorldQuaternion(quaternion), true);
		});

		const saberRadius = 0.02;
		const saberLength = 1.4;

		function saber($$renderer) {
			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					children: ($$renderer) => {
						if (T.CylinderGeometry) {
							$$renderer.push('<!--[-->');
							T.CylinderGeometry($$renderer, { args: [saberRadius, saberRadius, saberLength] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshBasicMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshBasicMaterial($$renderer, { color: 'red' });
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

			$$renderer.push(` `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					position: [0, saberLength / 2 + 0.05, 0],
					children: ($$renderer) => {
						if (T.CylinderGeometry) {
							$$renderer.push('<!--[-->');
							T.CylinderGeometry($$renderer, { args: [saberRadius, saberRadius, 0.1] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshStandardMaterial($$renderer, { color: 'gray', roughness: 0, metalness: 0.5 });
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

			$$renderer.push(` `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					children: ($$renderer) => {
						if (T.CylinderGeometry) {
							$$renderer.push('<!--[-->');
							T.CylinderGeometry($$renderer, { args: [saberRadius, saberRadius, saberLength] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);
						FakeGlowMaterial($$renderer, { glowColor: 'red' });
						$$renderer.push(`<!----> `);
						Outlines($$renderer, { color: 'hotpink', thickness: 0.005 });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Controller($$renderer, {
				left: true,
				children: ($$renderer) => {
					T($$renderer, {
						is: leftSaber,
						'rotation.x': Math.PI / 2,
						'position.z': -saberLength / 2,
						children: ($$renderer) => {
							saber($$renderer);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Controller($$renderer, {
				right: true,
				children: ($$renderer) => {
					T($$renderer, {
						is: rightSaber,
						'rotation.x': Math.PI / 2,
						'position.z': -saberLength / 2,
						children: ($$renderer) => {
							saber($$renderer);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function wrist($$renderer) {
					T($$renderer, {
						is: leftHandSaber,
						'rotation.x': Math.PI / 2,
						'position.z': -saberLength / 2,
						children: ($$renderer) => {
							saber($$renderer);
						},
						$$slots: { default: true }
					});
				}

				Hand($$renderer, { left: true, wrist, $$slots: { wrist: true } });
			}

			$$renderer.push(`<!----> `);

			{
				function wrist($$renderer) {
					T($$renderer, {
						is: rightHandSaber,
						'rotation.x': Math.PI / 2,
						'position.z': -saberLength / 2,
						children: ($$renderer) => {
							saber($$renderer);
						},
						$$slots: { default: true }
					});
				}

				Hand($$renderer, { right: true, wrist, $$slots: { wrist: true } });
			}

			$$renderer.push(`<!----> `);

			RigidBody($$renderer, {
				type: 'kinematicPosition',
				oncollisionenter: () => pulse('left'),
				get rigidBody() {
					return rigidBodyLeft;
				},

				set rigidBody($$value) {
					rigidBodyLeft = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Collider($$renderer, { shape: 'capsule', args: [saberLength / 2, saberRadius] });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			RigidBody($$renderer, {
				type: 'kinematicPosition',
				oncollisionenter: () => pulse('right'),
				get rigidBody() {
					return rigidBodyRight;
				},

				set rigidBody($$value) {
					rigidBodyRight = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Collider($$renderer, { shape: 'capsule', args: [saberLength / 2, saberRadius] });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}