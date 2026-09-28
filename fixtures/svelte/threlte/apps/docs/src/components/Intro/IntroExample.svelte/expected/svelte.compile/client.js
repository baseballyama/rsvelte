import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, T } from '@threlte/core';
import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><!></div>`);

export default function IntroExample($$anchor, $$props) {
	$.push($$props, true);

	let _class = '';

	var $$exports = {
		get class() {
			return _class;
		},

		set class($$value) {
			_class = $$value;
		}
	};

	var div = root_2();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					position: [-10, 10, 10],
					fov: 15,
					children: ($$anchor, $$slotProps) => {
						OrbitControls($$anchor, {
							autoRotate: true,
							enableZoom: false,
							enableDamping: true,
							autoRotateSpeed: 0.5,
							'target.y': 1.5
						});
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
				T_DirectionalLight($$anchor, { intensity: 0.8, 'position.x': 5, 'position.y': 10 });
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
				T_AmbientLight($$anchor, { intensity: 0.2 });
			});

			var node_4 = $.sibling(node_3, 2);

			Grid(node_4, {
				'position.y': -0.001,
				cellColor: '#ffffff',
				sectionColor: '#ffffff',
				sectionThickness: 0,
				fadeDistance: 25,
				cellSize: 2
			});

			var node_5 = $.sibling(node_4, 2);

			ContactShadows(node_5, { scale: 10, blur: 2, far: 2.5, opacity: 0.5 });

			var node_6 = $.sibling(node_5, 2);

			Float(node_6, {
				floatIntensity: 1,
				floatingRange: [0, 1],
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_7 = $.first_child(fragment_2);

					$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							'position.y': 1.2,
							'position.z': -0.75,
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_8 = $.first_child(fragment_3);

								$.component(node_8, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
									T_BoxGeometry($$anchor, {});
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
									T_MeshStandardMaterial($$anchor, { color: '#0059BA' });
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_6, 2);

			Float(node_10, {
				floatIntensity: 1,
				floatingRange: [0, 1],
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_11 = $.first_child(fragment_4);

					$.component(node_11, () => T.Mesh, ($$anchor, T_Mesh_1) => {
						T_Mesh_1($$anchor, {
							position: [1.2, 1.5, 0.75],
							'rotation.x': 5,
							'rotation.y': 71,
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_12 = $.first_child(fragment_5);

								$.component(node_12, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry) => {
									T_TorusKnotGeometry($$anchor, { args: [0.5, 0.15, 100, 12, 2, 3] });
								});

								var node_13 = $.sibling(node_12, 2);

								$.component(node_13, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
									T_MeshStandardMaterial_1($$anchor, { color: '#F85122' });
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_10, 2);

			Float(node_14, {
				floatIntensity: 1,
				floatingRange: [0, 1],
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = $.comment();
					var node_15 = $.first_child(fragment_6);

					$.component(node_15, () => T.Mesh, ($$anchor, T_Mesh_2) => {
						T_Mesh_2($$anchor, {
							position: [-1.4, 1.5, 0.75],
							rotation: [-5, 128, 10],
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root();
								var node_16 = $.first_child(fragment_7);

								$.component(node_16, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry) => {
									T_IcosahedronGeometry($$anchor, { args: [1, 0] });
								});

								var node_17 = $.sibling(node_16, 2);

								$.component(node_17, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
									T_MeshStandardMaterial_2($$anchor, { color: '#F8EBCE' });
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

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, $.clsx(_class)));
	$.append($$anchor, div);

	return $.pop($$exports);
}