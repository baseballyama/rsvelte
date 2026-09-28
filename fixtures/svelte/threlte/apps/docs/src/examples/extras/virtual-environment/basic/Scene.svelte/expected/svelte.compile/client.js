import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { injectPlugin, isInstanceOf, T, useTask } from '@threlte/core';

import {
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
	shape = $.noop,
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
							var consequent_1 = ($$anchor) => {
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								{
									let $0 = $.derived(() => [size() / 2]);

									$.component(node_4, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
										T_CircleGeometry($$anchor, {
											get args() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_4);
							};

							var alternate = ($$anchor) => {
								var fragment_5 = $.comment();
								var node_5 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => [size(), size()]);

									$.component(node_5, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
										T_PlaneGeometry($$anchor, {
											get args() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_5);
							};

							$.if(node_3, ($$render) => {
								if (shape() === 'circle') $$render(consequent_1); else $$render(alternate, -1);
							});
						}

						var node_6 = $.sibling(node_3, 2);

						$.component(node_6, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
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

				args.ref.lookAt(...args.props.lookAt);
			},
			{ autoInvalidate: false }
		);

		return { pluginProps: ['lookAt'] };
	});

	var fragment_6 = root_2();
	var node_7 = $.first_child(fragment_6);

	$.component(node_7, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
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

	var node_8 = $.sibling(node_7, 2);

	Grid(node_8, { cellColor: 'white', sectionColor: 'white' });

	var node_9 = $.sibling(node_8, 2);

	$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			'position.y': 1,
			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root();
				var node_10 = $.first_child(fragment_8);

				$.component(node_10, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
					T_SphereGeometry($$anchor, {});
				});

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 'white', roughness: 0.15 });
				});

				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		});
	});

	var node_12 = $.sibling(node_9, 2);

	VirtualEnvironment(node_12, {
		get visible() {
			return $$props.debug;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_1();
			var node_13 = $.first_child(fragment_9);

			lightformer(node_13, () => '#FF4F4F', () => 'plane', () => 20, () => [0, 0, -20], () => $$props.debug);

			var node_14 = $.sibling(node_13, 2);

			lightformer(node_14, () => '#FFD0CB', () => 'circle', () => 5, () => [0, 5, 0], () => $$props.debug);

			var node_15 = $.sibling(node_14, 2);

			lightformer(node_15, () => '#2223FF', () => 'plane', () => 8, () => [-3, 0, 4], () => $$props.debug);
			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment_6);
	$.pop();
}