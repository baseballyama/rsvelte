import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { injectPlugin, isInstanceOf, T, useTask } from '@threlte/core';

import {
	Environment,
	Grid,
	interactivity,
	OrbitControls,
	TransformControls,
	VirtualEnvironment
} from '@threlte/extras';

import { DoubleSide } from 'three';

const lightformer = (
	$$anchor,
	color = $.noop,
	size = $.noop,
	position = $.noop,
	visible = $.noop
) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let ref = () => ($$arg0?.()).ref;
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					TransformControls($$anchor, {
						get object() {
							return ref();
						}
					});
				};

				$.if(node_1, ($$render) => {
					if (visible()) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					lookAt: [0, 0, 0],
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_3 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => [size() / 2]);

							$.component(node_3, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
								T_CircleGeometry($$anchor, {
									get args() {
										return $.get($0);
									}
								});
							});
						}

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
							T_MeshBasicMaterial($$anchor, {
								get color() {
									return color();
								},

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

			$.append($$anchor, fragment_1);
		};

		$.component(node, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get position() {
					return position();
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	interactivity();

	// lookAt plugin from the plugin examples
	injectPlugin('lookAt', (args) => {
		if (!isInstanceOf(args.ref, 'Object3D') || !args.props.lookAt) return;

		useTask(
			() => {
				if (!args.props.lookAt) return;

				args.ref.lookAt(args.props.lookAt[0], args.props.lookAt[1], args.props.lookAt[2]);
			},
			{ autoInvalidate: false }
		);

		return { pluginProps: ['lookAt'] };
	});

	var fragment_4 = root_2();
	var node_5 = $.first_child(fragment_4);

	$.component(node_5, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [10, 10, 10],
			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => !$$props.debug);

					OrbitControls($$anchor, {
						get autoRotate() {
							return $.get($0);
						},
						autoRotateSpeed: 0.15,
						enableDamping: true
					});
				}
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node_5, 2);

	Grid(node_6, { cellColor: 'white', sectionColor: 'white' });

	var node_7 = $.sibling(node_6, 2);

	$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			'position.y': 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root();
				var node_8 = $.first_child(fragment_6);

				$.component(node_8, () => T.TorusGeometry, ($$anchor, T_TorusGeometry) => {
					T_TorusGeometry($$anchor, {});
				});

				var node_9 = $.sibling(node_8, 2);

				$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 'white', roughness: 0.4, metalness: 1 });
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	var node_10 = $.sibling(node_7, 2);

	VirtualEnvironment(node_10, {
		get visible() {
			return $$props.debug;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_1();
			var node_11 = $.first_child(fragment_7);

			{
				var consequent_1 = ($$anchor) => {
					Environment($$anchor, {
						url: '/textures/equirectangular/hdr/mpumalanga_veld_puresky_1k.hdr',
						isBackground: true
					});
				};

				$.if(node_11, ($$render) => {
					if ($$props.mixEnvironment) $$render(consequent_1);
				});
			}

			var node_12 = $.sibling(node_11, 2);

			lightformer(node_12, () => '#FF4F4F', () => 20, () => [0, 0, -20], () => $$props.debug);

			var node_13 = $.sibling(node_12, 2);

			lightformer(node_13, () => '#2223FF', () => 8, () => [-3, 0, 4], () => $$props.debug);
			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment_4);
	$.pop();
}