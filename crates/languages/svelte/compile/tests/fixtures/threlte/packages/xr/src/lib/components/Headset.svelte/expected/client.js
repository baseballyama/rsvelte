import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { useHeadset } from '../hooks/useHeadset.js';

export default function Headset($$anchor, $$props) {
	$.push($$props, true);

	const { scene } = useThrelte();
	const headset = useHeadset();

	T($$anchor, {
		get is() {
			return headset;
		},

		get attach() {
			return scene;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: headset }));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}