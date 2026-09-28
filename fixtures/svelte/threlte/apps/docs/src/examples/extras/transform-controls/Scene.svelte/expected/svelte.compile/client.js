import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

import {
	CameraControls,
	OrbitControls,
	TrackballControls,
	TransformControls
} from '@threlte/extras';

import { PerspectiveCamera } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	let controls = $.prop($$props, 'controls', 3, '<OrbitControls>'),
		autoPauseControls = $.prop($$props, 'autoPauseControls', 3, true);

	let camera = $.state(void 0);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.key(node, controls, ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
			T_PerspectiveCamera($$anchor, {
				makeDefault: true,
				position: [10, 5, 10],
				get ref() {
					return $.get(camera);
				},

				set ref($$value) {
					$.set(camera, $$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							TrackballControls($$anchor, {});
						};

						var consequent_1 = ($$anchor) => {
							OrbitControls($$anchor, {});
						};

						var consequent_2 = ($$anchor) => {
							CameraControls($$anchor, {});
						};

						$.if(node_2, ($$render) => {
							if (controls() === '<TrackballControls>') $$render(consequent); else if (controls() === '<OrbitControls>') $$render(consequent_1, 1); else if (controls() === '<CameraControls>') $$render(consequent_2, 2);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_1);
	});

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { 'position.y': 10, 'position.z': 10 });
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.3 });
	});

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, { args: [10, 10] });
	});

	var node_6 = $.sibling(node_5, 2);

	TransformControls(node_6, {
		get autoPauseControls() {
			return autoPauseControls();
		},
		translationSnap: 1,
		'position.y': 1,
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = $.comment();
			var node_7 = $.first_child(fragment_6);

			$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root();
						var node_8 = $.first_child(fragment_7);

						$.component(node_8, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
							T_BoxGeometry($$anchor, { args: [2, 2, 2] });
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
							T_MeshStandardMaterial($$anchor, {});
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
}