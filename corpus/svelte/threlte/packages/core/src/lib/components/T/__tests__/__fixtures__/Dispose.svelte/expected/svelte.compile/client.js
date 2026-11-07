import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

export default function Dispose($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			children: ($$anchor, $$slotProps) => {
				T($$anchor, {
					get is() {
						return $$props.is;
					}
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}