import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Gizmo, TrackballControls } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [10, 5, 10],
			'lookAt.y': 0.5,
			children: ($$anchor, $$slotProps) => {
				TrackballControls($$anchor, {
					get staticMoving() {
						return $$props.staticMoving;
					},

					get noRotate() {
						return $$props.noRotate;
					},

					get rotateSpeed() {
						return $$props.rotateSpeed;
					},

					get noZoom() {
						return $$props.noZoom;
					},

					get zoomSpeed() {
						return $$props.zoomSpeed;
					},

					get noPan() {
						return $$props.noPan;
					},

					get panSpeed() {
						return $$props.panSpeed;
					},

					children: ($$anchor, $$slotProps) => {
						Gizmo($$anchor, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { 'position.y': 10, 'position.z': 10 });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.3 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, { args: [10, 10] });
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 1,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_5 = $.first_child(fragment_3);

				$.component(node_5, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, { args: [2, 2, 2] });
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}