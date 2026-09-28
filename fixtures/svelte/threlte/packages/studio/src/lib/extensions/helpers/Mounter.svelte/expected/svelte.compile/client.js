import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Object3D } from 'three';

export default function Mounter($$anchor, $$props) {
	$.push($$props, true);

	const object = new Object3D();

	object.add = (child) => {
		return $$props.parent.add(child);
	};

	object.remove = (child) => {
		return $$props.parent.remove(child);
	};

	T($$anchor, {
		get is() {
			return object;
		},
		attach: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}