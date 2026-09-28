import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

export default function AttachDotNotation($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			name: 'light',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
					T_OrthographicCamera($$anchor, { args: [-1, 1, 1, -1, 0.1, 100], attach: 'shadow.camera' });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}