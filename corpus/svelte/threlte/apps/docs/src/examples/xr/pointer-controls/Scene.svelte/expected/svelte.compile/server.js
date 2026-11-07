import * as $ from 'svelte/internal/server';
import { BufferGeometry, Vector3, Mesh } from 'three';
import { T, useTask } from '@threlte/core';
import { Text, interactivity } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { pointerControls, useXR, Controller, Hand } from '@threlte/xr';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { isPresenting } = useXR();
		const scale = new Spring(1);
		const eyeScale = new Spring(1, { stiffness: 0.5 });
		const points = [new Vector3(0, 0, 0), new Vector3(0, 0, -1000)];
		let text = '';
		let debug = false;

		// Each XR controller/hand dispatches pointer events independently, so tracking a
		// single shared `happy` flag would be clobbered when one hand leaves while the
		// other is still hovering. Track per-source and aggregate.
		const hovering = { left: false, right: false, desktop: false };

		const happy = $.derived(() => hovering.left || hovering.right || hovering.desktop);
		const sourceOf = (event) => event.handedness ?? 'desktop';
		const mesh = new Mesh();
		let lookAt = new Vector3();
		let point = new Vector3();

		const handleEvent = (type) => (event) => {
			text = type;

			switch (type) {
				case 'click':
					{
						scale.set(1.5);

						return;
					}

				case 'pointermove':
					{
						point.copy(event.point);

						return;
					}

				case 'pointerenter':
					{
						hovering[sourceOf(event)] = true;
						scale.set(1.1);

						return;
					}

				case 'pointerleave':
					{
						hovering[sourceOf(event)] = false;

						if (!happy()) scale.set(1);

						return;
					}

				case 'pointermissed':
					{
						scale.set(0.5);

						return;
					}
			}
		};

		const blink = () => {
			eyeScale.set(0.1).then(() => eyeScale.set(1));
		};

		const lookForCursor = () => {
			point.set(Math.random() - 0.5, 1.5 + Math.random() - 0.5, 1);
		};

		useTask(() => {
			lookAt.lerp(point, happy() ? 0.5 : 0.2);
			mesh.lookAt(lookAt.x, lookAt.y, 1);
		});

		interactivity();
		pointerControls('left');
		pointerControls('right');

		let lookIntervalId = 0;
		let blinkIntervalId = setInterval(blink, 3000);

		{
			function targetRay($$renderer) {
				Text($$renderer, { fontSize: 0.05, text, 'position.x': 0.1 });
				$$renderer.push(`<!----> `);

				if (T.Line) {
					$$renderer.push('<!--[-->');

					T.Line($$renderer, {
						visible: debug,
						children: ($$renderer) => {
							T($$renderer, { is: new BufferGeometry().setFromPoints(points) });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Controller($$renderer, { left: true, targetRay, $$slots: { targetRay: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function targetRay($$renderer) {
				if (T.Line) {
					$$renderer.push('<!--[-->');

					T.Line($$renderer, {
						visible: debug,
						children: ($$renderer) => {
							T($$renderer, { is: new BufferGeometry().setFromPoints(points) });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Controller($$renderer, { right: true, targetRay, $$slots: { targetRay: true } });
		}

		$$renderer.push(`<!----> `);
		Hand($$renderer, { left: true });
		$$renderer.push(`<!----> `);
		Hand($$renderer, { right: true });
		$$renderer.push(`<!----> `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'position.y': 1.5,
				'position.z': -0.5,
				scale: $.store_get($$store_subs ??= {}, '$isPresenting', isPresenting) ? 0.1 : 1,
				children: ($$renderer) => {
					T($$renderer, {
						is: mesh,
						onclick: handleEvent('click'),
						onpointerdown: handleEvent('pointerdown'),
						onpointerup: handleEvent('pointerup'),
						onpointerover: handleEvent('pointerover'),
						onpointerout: handleEvent('pointerout'),
						onpointerenter: handleEvent('pointerenter'),
						onpointerleave: handleEvent('pointerleave'),
						onpointermove: handleEvent('pointermove'),
						onpointermissed: handleEvent('pointermissed'),
						scale: scale.current,
						children: ($$renderer) => {
							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshStandardMaterial($$renderer, { color: 'hotpink' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.BoxGeometry) {
								$$renderer.push('<!--[-->');
								T.BoxGeometry($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.Mesh) {
								$$renderer.push('<!--[-->');

								T.Mesh($$renderer, {
									'scale.y': eyeScale.current,
									position: [-0.3, 0.25, 0.5],
									raycast: () => false,
									children: ($$renderer) => {
										if (T.MeshStandardMaterial) {
											$$renderer.push('<!--[-->');
											T.MeshStandardMaterial($$renderer, { color: '#444' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (T.BoxGeometry) {
											$$renderer.push('<!--[-->');
											T.BoxGeometry($$renderer, { args: [0.1, 0.325, 0.1] });
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
									'scale.y': eyeScale.current,
									position: [0.05, 0.25, 0.5],
									raycast: () => false,
									children: ($$renderer) => {
										if (T.MeshStandardMaterial) {
											$$renderer.push('<!--[-->');
											T.MeshStandardMaterial($$renderer, { color: '#444' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (T.BoxGeometry) {
											$$renderer.push('<!--[-->');
											T.BoxGeometry($$renderer, { args: [0.1, 0.325, 0.1] });
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
									visible: happy(),
									'position.y': -0.15,
									'position.z': 0.5,
									'rotation.x': Math.PI / 2,
									raycast: () => false,
									children: ($$renderer) => {
										if (T.MeshStandardMaterial) {
											$$renderer.push('<!--[-->');
											T.MeshStandardMaterial($$renderer, { color: '#444' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (T.CylinderGeometry) {
											$$renderer.push('<!--[-->');
											T.CylinderGeometry($$renderer, { args: [0.3, 0.3, 0.1, 3] });
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
									visible: !happy(),
									'position.y': -0.15,
									'position.z': 0.5,
									'rotation.x': Math.PI / 2,
									raycast: () => false,
									children: ($$renderer) => {
										if (T.MeshStandardMaterial) {
											$$renderer.push('<!--[-->');
											T.MeshStandardMaterial($$renderer, { color: '#444' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (T.CylinderGeometry) {
											$$renderer.push('<!--[-->');
											T.CylinderGeometry($$renderer, { args: [0.15, 0.15, 0.1] });
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}