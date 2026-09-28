import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Align, OrbitControls, RoundedBoxGeometry, TransformControls } from '@threlte/extras';
import { Box3 } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let box = new Box3();
	let center = $.state(void 0);
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.z': 10,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.key(node_1, () => $$props.autoAlign, ($$anchor) => {
		{
			const children = ($$anchor, $$arg0) => {
				let align = () => ($$arg0?.()).align;
				var fragment_3 = root_1();
				var node_2 = $.first_child(fragment_3);

				TransformControls(node_2, {
					get onobjectChange() {
						return align();
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_3 = $.first_child(fragment_4);

						$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_4 = $.first_child(fragment_5);

									RoundedBoxGeometry(node_4, { args: [1, 2, 1] });

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
										T_MeshStandardMaterial($$anchor, { color: 'white' });
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

				var node_6 = $.sibling(node_2, 2);

				$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
					T_Mesh_1($$anchor, {
						'position.x': -4,
						'position.y': 1,
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_7 = $.first_child(fragment_6);

							RoundedBoxGeometry(node_7, { args: [1, 2, 3] });

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
								T_MeshStandardMaterial_1($$anchor, { color: 'white' });
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_6, 2);

				{
					var consequent = ($$anchor) => {
						var fragment_7 = $.comment();
						var node_10 = $.first_child(fragment_7);

						$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_2) => {
							T_Mesh_2($$anchor, {
								'position.x': -2,
								'position.y': 3,
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_11 = $.first_child(fragment_8);

									$.component(node_11, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
										T_SphereGeometry($$anchor, {});
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
										T_MeshStandardMaterial_2($$anchor, { color: 'white' });
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					};

					$.if(node_9, ($$render) => {
						if ($$props.showSphere) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_3);
			};

			Align($$anchor, {
				get x() {
					return $$props.x;
				},

				get y() {
					return $$props.y;
				},

				get z() {
					return $$props.z;
				},

				get precise() {
					return $$props.precise;
				},

				get auto() {
					return $$props.autoAlign;
				},

				onalign: ({ boundingBox, center: newCenter }) => {
					box.copy(boundingBox);
					$.set(center, newCenter, true);
				},
				children,
				$$slots: { default: true }
			});
		}
	});

	var node_13 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_9 = $.comment();
			var node_14 = $.first_child(fragment_9);

			$.component(node_14, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					get 'position.x'() {
						return $.get(center).x;
					},

					get 'position.y'() {
						return $.get(center).y;
					},

					get 'position.z'() {
						return $.get(center).z;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_10 = $.comment();
						var node_15 = $.first_child(fragment_10);

						{
							let $0 = $.derived(() => [box, 'white']);

							$.component(node_15, () => T.Box3Helper, ($$anchor, T_Box3Helper) => {
								T_Box3Helper($$anchor, {
									get args() {
										return $.get($0);
									},

									oncreate: () => {
										console.log('CREATE!');
									}
								});
							});
						}

						$.append($$anchor, fragment_10);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_9);
		};

		$.if(node_13, ($$render) => {
			if (box && $.get(center)) $$render(consequent_1);
		});
	}

	var node_16 = $.sibling(node_13, 2);

	$.component(node_16, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [3, 10, 5] });
	});

	var node_17 = $.sibling(node_16, 2);

	$.component(node_17, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.1 });
	});

	var node_18 = $.sibling(node_17, 2);

	$.component(node_18, () => T.AxesHelper, ($$anchor, T_AxesHelper) => {
		T_AxesHelper($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}