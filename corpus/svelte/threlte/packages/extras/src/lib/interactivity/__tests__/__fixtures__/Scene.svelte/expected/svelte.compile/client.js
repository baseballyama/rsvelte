import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { useInteractivity } from '../../context.js';
import { BoxGeometry, MeshBasicMaterial } from 'three';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	const ctx = useInteractivity();

	$.user_pre_effect(() => {
		if ($$props.clickTimeThreshold !== undefined) {
			ctx.clickTimeThreshold = props.clickTimeThreshold;
		}

		if ($$props.clickDistanceThreshold !== undefined) {
			ctx.clickDistanceThreshold = props.clickDistanceThreshold;
		}
	});

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
			name: 'A',
			get geometry() {
				return geometry;
			},

			get material() {
				return material;
			},
			'position.z': -5,
			get onclick() {
				return $$props.onclickA;
			},

			get oncontextmenu() {
				return $$props.oncontextmenuA;
			},

			get ondblclick() {
				return $$props.ondblclickA;
			},

			get onwheel() {
				return $$props.onwheelA;
			},

			get onpointerdown() {
				return $$props.onpointerdownA;
			},

			get onpointerup() {
				return $$props.onpointerupA;
			},

			get onpointerover() {
				return $$props.onpointeroverA;
			},

			get onpointerout() {
				return $$props.onpointeroutA;
			},

			get onpointerenter() {
				return $$props.onpointerenterA;
			},

			get onpointerleave() {
				return $$props.onpointerleaveA;
			},

			get onpointermove() {
				return $$props.onpointermoveA;
			},

			get onpointermissed() {
				return $$props.onpointermissedA;
			}
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			name: 'B',
			get geometry() {
				return geometry;
			},

			get material() {
				return material;
			},
			position: [10, 0, -5],
			get onclick() {
				return $$props.onclickB;
			},

			get onpointerover() {
				return $$props.onpointeroverB;
			},

			get onpointerout() {
				return $$props.onpointeroutB;
			},

			get onpointerenter() {
				return $$props.onpointerenterB;
			},

			get onpointerleave() {
				return $$props.onpointerleaveB;
			},

			get onpointermove() {
				return $$props.onpointermoveB;
			},

			get onpointermissed() {
				return $$props.onpointermissedB;
			}
		});
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh_2) => {
		T_Mesh_2($$anchor, {
			name: 'C',
			get geometry() {
				return geometry;
			},

			get material() {
				return material;
			},
			position: [-10, 0, -5],
			get onpointermissed() {
				return $$props.onpointermissedC;
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}