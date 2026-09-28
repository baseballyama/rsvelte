import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { AutoColliders, Collider, RigidBody } from '@threlte/rapier';
import { Color } from 'three';
import TestBed from './TestBed.svelte';

export default function Sensor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const gray = new Color(0x333333);
		const brand = new Color(0xff3f00);
		let present = false;
		let rigidBody = void 0;
		const offset = Date.now();

		useTask(() => {
			const positionZ = Math.sin(Date.now() / 2000) * 2.5;
			const positionX = Math.sin((Date.now() + offset) / 1500) * 1.2;

			rigidBody?.setNextKinematicTranslation({ x: positionX, y: 1, z: positionZ });
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [0, 1, 0],
					children: ($$renderer) => {
						Collider($$renderer, {
							onsensorenter: () => present = true,
							onsensorexit: () => present = false,
							sensor: true,
							shape: 'cuboid',
							args: [1, 1, 1]
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

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [0, 1, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							type: 'kinematicPosition',
							lockRotations: true,
							get rigidBody() {
								return rigidBody;
							},

							set rigidBody($$value) {
								rigidBody = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								AutoColliders($$renderer, {
									shape: 'ball',
									children: ($$renderer) => {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												children: ($$renderer) => {
													if (T.SphereGeometry) {
														$$renderer.push('<!--[-->');
														T.SphereGeometry($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (T.MeshStandardMaterial) {
														$$renderer.push('<!--[-->');
														T.MeshStandardMaterial($$renderer, { color: present ? brand : gray });
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			{
				function text($$renderer) {
					$$renderer.push(`<div><p>This collider is marked as a sensor and as such does<br/> not participate in contacts and collisions and can be<br/> useful to detect presence in areas.</p></div>`);
				}

				TestBed($$renderer, { title: 'Sensor Collider', text, $$slots: { text: true } });
			}

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