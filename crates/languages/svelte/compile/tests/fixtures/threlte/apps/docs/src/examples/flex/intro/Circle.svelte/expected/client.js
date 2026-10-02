import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function Circle($$anchor, $$props) {
	let color = $.prop($$props, 'color', 3, 'white'),
		radius = $.prop($$props, 'radius', 3, 5),
		z = $.prop($$props, 'z', 3, 0);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get 'position.z'() {
				return z();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => [radius()]);

					$.component(node_1, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
						T_CircleGeometry($$anchor, {
							get args() {
								return $.get($0);
							}
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, {
						get color() {
							return color();
						}
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}