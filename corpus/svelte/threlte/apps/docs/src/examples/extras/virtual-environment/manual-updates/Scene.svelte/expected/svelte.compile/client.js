import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

import {
	Grid,
	interactivity,
	OrbitControls,
	TransformControls,
	VirtualEnvironment
} from '@threlte/extras';

import { Checkbox, Pane } from 'svelte-tweakpane-ui';
import { DoubleSide } from 'three';
import RenderIndicator from './RenderIndicator.svelte';

const lightformer = (
	$$anchor,
	update = $.noop,
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
			const lookAtCenter = $.derived(() => () => ref().lookAt(0, 0, 0));
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					TransformControls($$anchor, {
						get object() {
							return ref();
						},
						oncreate: $.get(lookAtCenter),
						onobjectChange: () => {
							$.get(lookAtCenter)();
							update()();
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
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let debug = $.state(true);

	interactivity();

	var fragment_6 = root_2();
	var node_7 = $.first_child(fragment_6);

	Pane(node_7, {
		position: 'fixed',
		title: 'Render Indicator',
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root();
			var node_8 = $.first_child(fragment_7);

			Checkbox(node_8, {
				label: 'debug',
				get value() {
					return $.get(debug);
				},

				set value($$value) {
					$.set(debug, $$value, true);
				}
			});

			var node_9 = $.sibling(node_8, 2);

			RenderIndicator(node_9, {});
			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_7, 2);

	$.component(node_10, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [10, 10, 10],
			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => !$.get(debug));

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

	var node_11 = $.sibling(node_10, 2);

	Grid(node_11, { cellColor: 'white', sectionColor: 'white' });

	var node_12 = $.sibling(node_11, 2);

	$.component(node_12, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			'position.y': 1,
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root();
				var node_13 = $.first_child(fragment_9);

				$.component(node_13, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
					T_SphereGeometry($$anchor, {});
				});

				var node_14 = $.sibling(node_13, 2);

				$.component(node_14, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 'white', roughness: 0.15 });
				});

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	});

	var node_15 = $.sibling(node_12, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let update = () => ($$arg0?.()).update;
			var fragment_10 = $.comment();
			var node_16 = $.first_child(fragment_10);

			$.component(node_16, () => T.Group, ($$anchor, T_Group_1) => {
				T_Group_1($$anchor, {
					oncreate: () => {
						update()();
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root_1();
						var node_17 = $.first_child(fragment_11);

						lightformer(node_17, update, () => '#FF4F4F', () => 'plane', () => 20, () => [0, 0, -20], () => $.get(debug));

						var node_18 = $.sibling(node_17, 2);

						lightformer(node_18, update, () => '#FFD0CB', () => 'circle', () => 5, () => [0, 5, 0], () => $.get(debug));

						var node_19 = $.sibling(node_18, 2);

						lightformer(node_19, update, () => '#2223FF', () => 'plane', () => 8, () => [-3, 0, 4], () => $.get(debug));
						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_10);
		};

		VirtualEnvironment(node_15, {
			frames: 0,
			get visible() {
				return $.get(debug);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment_6);
	$.pop();
}