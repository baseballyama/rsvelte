import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Environment, Grid, interactivity, OrbitControls } from '@threlte/extras';
import { AutoColliders, Debug } from '@threlte/rapier';
import { DoubleSide, MathUtils } from 'three';
import Rope from './Rope.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	interactivity();

	let ropeEnd = $.state($.proxy([0, 0, 0]));

	const onpointermove = (e) => {
		e.point.x -= 0.2;
		$.set(ropeEnd, e.point.toArray(), true);
	};

	var fragment = root_1();
	var node = $.first_child(fragment);

	Environment(node, {
		url: '/textures/equirectangular/hdr/mpumalanga_veld_puresky_1k.hdr'
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Debug($$anchor, {});
		};

		$.if(node_1, ($$render) => {
			if ($$props.debug) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [-10, 5, 10],
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node_2, 2);

	Grid(node_3, {
		sectionColor: '#122036',
		cellColor: '#122036',
		'position.y': -5
	});

	var node_4 = $.sibling(node_3, 2);

	{
		let $0 = $.derived(() => 90 * MathUtils.DEG2RAD);

		$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				onpointermove,
				get 'rotation.y'() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_5 = $.first_child(fragment_3);

					$.component(node_5, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
						T_CircleGeometry($$anchor, { args: [5] });
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
						T_MeshBasicMaterial($$anchor, {
							color: '#0A0F19',
							get side() {
								return DoubleSide;
							}
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_7 = $.sibling(node_4, 2);

	$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			position: [-5, 0, 0],
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_8 = $.first_child(fragment_4);

				$.component(node_8, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
					T_SphereGeometry($$anchor, { args: [0.2] });
				});

				var node_9 = $.sibling(node_8, 2);

				$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: '#335086' });
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	var node_10 = $.sibling(node_7, 2);

	$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_2) => {
		T_Mesh_2($$anchor, {
			get position() {
				return $.get(ropeEnd);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root();
				var node_11 = $.first_child(fragment_5);

				$.component(node_11, () => T.SphereGeometry, ($$anchor, T_SphereGeometry_1) => {
					T_SphereGeometry_1($$anchor, { args: [0.2] });
				});

				var node_12 = $.sibling(node_11, 2);

				$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
					T_MeshStandardMaterial_1($$anchor, { color: '#335086' });
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	var node_13 = $.sibling(node_10, 2);

	AutoColliders(node_13, {
		shape: 'cuboid',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = $.comment();
			var node_14 = $.first_child(fragment_6);

			$.component(node_14, () => T.Mesh, ($$anchor, T_Mesh_3) => {
				T_Mesh_3($$anchor, {
					position: [-2.5, 0, -1],
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root();
						var node_15 = $.first_child(fragment_7);

						$.component(node_15, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
							T_BoxGeometry($$anchor, {});
						});

						var node_16 = $.sibling(node_15, 2);

						$.component(node_16, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
							T_MeshStandardMaterial_2($$anchor, { color: '#335086' });
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_13, 2);

	AutoColliders(node_17, {
		shape: 'cuboid',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = $.comment();
			var node_18 = $.first_child(fragment_8);

			$.component(node_18, () => T.Mesh, ($$anchor, T_Mesh_4) => {
				T_Mesh_4($$anchor, {
					position: [-2.5, 0, 1],
					children: ($$anchor, $$slotProps) => {
						var fragment_9 = root();
						var node_19 = $.first_child(fragment_9);

						$.component(node_19, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
							T_BoxGeometry_1($$anchor, {});
						});

						var node_20 = $.sibling(node_19, 2);

						$.component(node_20, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_3) => {
							T_MeshStandardMaterial_3($$anchor, { color: '#335086' });
						});

						$.append($$anchor, fragment_9);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_17, 2);

	$.key(node_21, () => $$props.segments, ($$anchor) => {
		Rope($$anchor, {
			ballRadius: 0.2,
			ropeStart: [-5, 0, 0],
			get ropeEnd() {
				return $.get(ropeEnd);
			},
			length: 7,
			get segments() {
				return $$props.segments;
			},

			get damping() {
				return $$props.damping;
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}