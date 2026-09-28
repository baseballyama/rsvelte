import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function Plane($$anchor, $$props) {
	let color = $.prop($$props, 'color', 3, 'white'),
		height = $.prop($$props, 'height', 3, 1),
		width = $.prop($$props, 'width', 3, 1),
		depth = $.prop($$props, 'depth', 3, 0);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => depth() * 20);

		$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				get 'position.z'() {
					return $.get($0);
				},

				get renderOrder() {
					return depth();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					{
						let $0 = $.derived(() => [width(), height()]);

						$.component(node_1, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
							T_PlaneGeometry($$anchor, {
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
							},
							transparent: true,
							opacity: 0.5
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
}