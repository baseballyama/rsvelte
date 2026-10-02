import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BufferGeometry, Vector3, Mesh } from 'three';
import { T, useTask } from '@threlte/core';
import { Text, interactivity } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { pointerControls, useXR, Controller, Hand } from '$lib/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $isPresenting = () => $.store_get(isPresenting, '$isPresenting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { isPresenting } = useXR();
	const scale = new Spring(1);
	const eyeScale = new Spring(1, { stiffness: 0.5 });
	const points = [new Vector3(0, 0, 0), new Vector3(0, 0, -1000)];
	let text = $.state('');
	let debug = $.state(false);

	// Each XR controller/hand dispatches pointer events independently, so tracking a
	// single shared `happy` flag would be clobbered when one hand leaves while the
	// other is still hovering. Track per-source and aggregate.
	const hovering = $.proxy({ left: false, right: false, desktop: false });

	const happy = $.derived(() => hovering.left || hovering.right || hovering.desktop);
	const sourceOf = (event) => event.handedness ?? 'desktop';
	const mesh = new Mesh();
	let lookAt = new Vector3();
	let point = new Vector3();

	const handleEvent = (type) => (event) => {
		$.set(text, type, true);

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

					if (!$.get(happy)) scale.set(1);

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
		lookAt.lerp(point, $.get(happy) ? 0.5 : 0.2);
		mesh.lookAt(lookAt.x, lookAt.y, 1);
	});

	interactivity();
	pointerControls('left');
	pointerControls('right');

	let lookIntervalId = 0;
	let blinkIntervalId = setInterval(blink, 3000);

	$.user_effect(() => {
		if ($.get(happy)) {
			clearInterval(lookIntervalId);
		} else {
			lookIntervalId = window.setInterval(lookForCursor, 1000);
		}

		return () => {
			clearInterval(blinkIntervalId);
			clearInterval(lookIntervalId);
		};
	});

	var fragment = root_2();

	$.event('keyup', $.window, (e) => e.key === 'd' && $.set(debug, !$.get(debug)));

	var node = $.first_child(fragment);

	{
		const targetRay = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Text(node_1, {
				fontSize: 0.05,
				get text() {
					return $.get(text);
				},
				'position.x': 0.1
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => T.Line, ($$anchor, T_Line) => {
				T_Line($$anchor, {
					get visible() {
						return $.get(debug);
					},

					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => new BufferGeometry().setFromPoints(points));

							T($$anchor, {
								get is() {
									return $.get($0);
								}
							});
						}
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		Controller(node, { left: true, targetRay, $$slots: { targetRay: true } });
	}

	var node_3 = $.sibling(node, 2);

	{
		const targetRay = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_4 = $.first_child(fragment_3);

			$.component(node_4, () => T.Line, ($$anchor, T_Line_1) => {
				T_Line_1($$anchor, {
					get visible() {
						return $.get(debug);
					},

					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => new BufferGeometry().setFromPoints(points));

							T($$anchor, {
								get is() {
									return $.get($0);
								}
							});
						}
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		};

		Controller(node_3, { right: true, targetRay, $$slots: { targetRay: true } });
	}

	var node_5 = $.sibling(node_3, 2);

	Hand(node_5, { left: true });

	var node_6 = $.sibling(node_5, 2);

	Hand(node_6, { right: true });

	var node_7 = $.sibling(node_6, 2);

	{
		let $0 = $.derived(() => $isPresenting() ? 0.1 : 1);

		$.component(node_7, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				'position.y': 1.5,
				'position.z': -0.5,
				get scale() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => handleEvent('click'));
						let $1 = $.derived(() => handleEvent('pointerdown'));
						let $2 = $.derived(() => handleEvent('pointerup'));
						let $3 = $.derived(() => handleEvent('pointerover'));
						let $4 = $.derived(() => handleEvent('pointerout'));
						let $5 = $.derived(() => handleEvent('pointerenter'));
						let $6 = $.derived(() => handleEvent('pointerleave'));
						let $7 = $.derived(() => handleEvent('pointermove'));
						let $8 = $.derived(() => handleEvent('pointermissed'));

						T($$anchor, {
							get is() {
								return mesh;
							},

							get onclick() {
								return $.get($0);
							},

							get onpointerdown() {
								return $.get($1);
							},

							get onpointerup() {
								return $.get($2);
							},

							get onpointerover() {
								return $.get($3);
							},

							get onpointerout() {
								return $.get($4);
							},

							get onpointerenter() {
								return $.get($5);
							},

							get onpointerleave() {
								return $.get($6);
							},

							get onpointermove() {
								return $.get($7);
							},

							get onpointermissed() {
								return $.get($8);
							},

							get scale() {
								return scale.current;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_8 = $.first_child(fragment_6);

								$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
									T_MeshStandardMaterial($$anchor, { color: 'hotpink' });
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
									T_BoxGeometry($$anchor, {});
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										get 'scale.y'() {
											return eyeScale.current;
										},
										position: [-0.3, 0.25, 0.5],
										raycast: () => false,
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root();
											var node_11 = $.first_child(fragment_7);

											$.component(node_11, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
												T_MeshStandardMaterial_1($$anchor, { color: '#444' });
											});

											var node_12 = $.sibling(node_11, 2);

											$.component(node_12, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
												T_BoxGeometry_1($$anchor, { args: [0.1, 0.325, 0.1] });
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								});

								var node_13 = $.sibling(node_10, 2);

								$.component(node_13, () => T.Mesh, ($$anchor, T_Mesh_1) => {
									T_Mesh_1($$anchor, {
										get 'scale.y'() {
											return eyeScale.current;
										},
										position: [0.05, 0.25, 0.5],
										raycast: () => false,
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root();
											var node_14 = $.first_child(fragment_8);

											$.component(node_14, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
												T_MeshStandardMaterial_2($$anchor, { color: '#444' });
											});

											var node_15 = $.sibling(node_14, 2);

											$.component(node_15, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_2) => {
												T_BoxGeometry_2($$anchor, { args: [0.1, 0.325, 0.1] });
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								var node_16 = $.sibling(node_13, 2);

								$.component(node_16, () => T.Mesh, ($$anchor, T_Mesh_2) => {
									T_Mesh_2($$anchor, {
										get visible() {
											return $.get(happy);
										},
										'position.y': -0.15,
										'position.z': 0.5,
										'rotation.x': Math.PI / 2,
										raycast: () => false,
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root();
											var node_17 = $.first_child(fragment_9);

											$.component(node_17, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_3) => {
												T_MeshStandardMaterial_3($$anchor, { color: '#444' });
											});

											var node_18 = $.sibling(node_17, 2);

											$.component(node_18, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
												T_CylinderGeometry($$anchor, { args: [0.3, 0.3, 0.1, 3] });
											});

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								var node_19 = $.sibling(node_16, 2);

								{
									let $0 = $.derived(() => !$.get(happy));

									$.component(node_19, () => T.Mesh, ($$anchor, T_Mesh_3) => {
										T_Mesh_3($$anchor, {
											get visible() {
												return $.get($0);
											},
											'position.y': -0.15,
											'position.z': 0.5,
											'rotation.x': Math.PI / 2,
											raycast: () => false,
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root();
												var node_20 = $.first_child(fragment_10);

												$.component(node_20, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_4) => {
													T_MeshStandardMaterial_4($$anchor, { color: '#444' });
												});

												var node_21 = $.sibling(node_20, 2);

												$.component(node_21, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry_1) => {
													T_CylinderGeometry_1($$anchor, { args: [0.15, 0.15, 0.1] });
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}