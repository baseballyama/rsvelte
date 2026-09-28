import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { BoxGeometry, MeshBasicMaterial } from 'three';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!> <!>`, 1);

export default function OverlappingScene($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	const geometry = new BoxGeometry(2, 2, 2);
	const material = new MeshBasicMaterial();
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, args: [75, 1, 0.1, 1000], 'position.z': 0 });
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			name: 'Front',
			get geometry() {
				return geometry;
			},

			get material() {
				return material;
			},
			'position.z': -3,
			get onpointerdown() {
				return $$props.onpointerdownFront;
			},

			get onpointerover() {
				return $$props.onpointeroverFront;
			},

			get onpointerout() {
				return $$props.onpointeroutFront;
			},

			get onpointerenter() {
				return $$props.onpointerenterFront;
			},

			get onpointerleave() {
				return $$props.onpointerleaveFront;
			},

			get onpointermove() {
				return $$props.onpointermoveFront;
			}
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			name: 'Back',
			get geometry() {
				return geometry;
			},

			get material() {
				return material;
			},
			'position.z': -7,
			get onpointerdown() {
				return $$props.onpointerdownBack;
			},

			get onpointerover() {
				return $$props.onpointeroverBack;
			},

			get onpointerout() {
				return $$props.onpointeroutBack;
			},

			get onpointerenter() {
				return $$props.onpointerenterBack;
			},

			get onpointerleave() {
				return $$props.onpointerleaveBack;
			},

			get onpointermove() {
				return $$props.onpointermoveBack;
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}