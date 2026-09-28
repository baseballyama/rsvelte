import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DoubleSide } from 'three';
import { Environment, OrbitControls } from '@threlte/extras';
import { T, useTask } from '@threlte/core';
import { Tween } from 'svelte/motion';
import { quadInOut } from 'svelte/easing';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let positions = $.prop($$props, 'positions', 19, () => []),
		play = $.prop($$props, 'play', 3, true),
		walls = $.prop($$props, 'walls', 19, () => []);

	let positionIndex = 0;
	const positionTween = new Tween(positions()[positionIndex], { duration: 400, easing: quadInOut });
	let time = 0;

	// if `positions` changes, restart
	$.user_effect(() => {
		positions();
		positionIndex = 0;
		positionTween.set(positions()[positionIndex], { duration: 0 });
		time = 0;
	});

	useTask(
		(delta) => {
			time += delta;

			if (time > 0.5) {
				positionIndex += 1;
				positionIndex %= positions().length;
				positionTween.set(positions()[positionIndex]);
				time = 0;
			}
		},
		{ running: () => play() }
	);

	const extrudeOptions = { bevelEnabled: false };
	var fragment = root_1();
	var node = $.first_child(fragment);

	Environment(node, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, {
			makeDefault: true,
			position: [10, 10, 10],
			zoom: 50,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true });
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			'rotation.x': -1 * 0.5 * Math.PI,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_3 = $.first_child(fragment_2);

				$.each(node_3, 17, walls, $.index, ($$anchor, $$item) => {
					let height = () => $.get($$item).height;
					let shape = () => $.get($$item).shape;
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							get 'scale.z'() {
								return height();
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_5 = $.first_child(fragment_4);

								{
									let $0 = $.derived(() => [shape(), extrudeOptions]);

									$.component(node_5, () => T.ExtrudeGeometry, ($$anchor, T_ExtrudeGeometry) => {
										T_ExtrudeGeometry($$anchor, {
											get args() {
												return $.get($0);
											}
										});
									});
								}

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
									T_MeshStandardMaterial($$anchor, { color: 'silver' });
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				});

				var node_7 = $.sibling(node_3, 2);

				{
					let $0 = $.derived(() => positionTween.current ?? positions()[0] ?? [0, 0, 0]);

					$.component(node_7, () => T.Group, ($$anchor, T_Group_1) => {
						T_Group_1($$anchor, {
							get position() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								T($$anchor, {
									get is() {
										return $$props.mesh;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_8 = $.first_child(fragment_6);

										$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
											T_MeshStandardMaterial_1($$anchor, { color: 'gold' });
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
											T_BoxGeometry($$anchor, {});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					});
				}

				var node_10 = $.sibling(node_7, 2);

				$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_1) => {
					T_Mesh_1($$anchor, {
						scale: 100,
						'position.z': -1.01,
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_11 = $.first_child(fragment_7);

							$.component(node_11, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
								T_PlaneGeometry($$anchor, {});
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
								T_MeshStandardMaterial_2($$anchor, {
									color: 'green',
									get side() {
										return DoubleSide;
									}
								});
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}