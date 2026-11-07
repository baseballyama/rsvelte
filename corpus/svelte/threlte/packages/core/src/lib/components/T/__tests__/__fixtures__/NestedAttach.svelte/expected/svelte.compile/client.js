import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

export default function NestedAttach($$anchor, $$props) {
	T($$anchor, {
		get is() {
			return $$props.light;
		},

		children: ($$anchor, $$slotProps) => {
			T($$anchor, {
				get is() {
					return $$props.camera;
				},
				attach: 'shadow.camera'
			});
		},
		$$slots: { default: true }
	});
}