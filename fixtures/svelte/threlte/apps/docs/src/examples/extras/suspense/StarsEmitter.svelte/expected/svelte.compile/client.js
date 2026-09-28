import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { InstancedMesh } from '@threlte/extras';
import Star from './Star.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function StarsEmitter($$anchor) {
	InstancedMesh($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
				T_BoxGeometry($$anchor, { args: [0.04, 0.04, 30] });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
				T_MeshBasicMaterial($$anchor, { color: 'white', transparent: true, opacity: 0.2 });
			});

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 16, () => ({ length: 40 }), $.index, ($$anchor, $$item) => {
				Star($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}