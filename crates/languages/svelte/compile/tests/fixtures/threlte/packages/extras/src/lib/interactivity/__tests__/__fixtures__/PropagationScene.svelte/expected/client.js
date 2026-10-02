import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { BoxGeometry, MeshBasicMaterial } from 'three';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!>`, 1);

export default function PropagationScene($$anchor, $$props) {
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

	$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			name: 'Parent',
			get onpointerdown() {
				return $$props.onpointerdownParent;
			},

			get onpointerover() {
				return $$props.onpointeroverParent;
			},

			get onpointerout() {
				return $$props.onpointeroutParent;
			},

			get onpointerleave() {
				return $$props.onpointerleaveParent;
			},

			get onpointerenter() {
				return $$props.onpointerenterParent;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						name: 'Child',
						get geometry() {
							return geometry;
						},

						get material() {
							return material;
						},
						'position.z': -5,
						get onpointerdown() {
							return $$props.onpointerdownChild;
						},

						get onpointerover() {
							return $$props.onpointeroverChild;
						},

						get onpointerout() {
							return $$props.onpointeroutChild;
						},

						get onpointerleave() {
							return $$props.onpointerleaveChild;
						},

						get onpointerenter() {
							return $$props.onpointerenterChild;
						}
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}