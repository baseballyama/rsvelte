import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { RoundedBoxGeometry } from '@threlte/extras';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!>`, 1);

export default function Box($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, $.spread_props(() => props, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				RoundedBoxGeometry(node_1, { radius: 0.2, args: [1.3, 1.3, 1.3] });

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: '#fe3d00' });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
}