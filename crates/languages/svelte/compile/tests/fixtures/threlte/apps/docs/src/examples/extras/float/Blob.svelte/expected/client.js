import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Float } from '@threlte/extras';
import { Spring } from 'svelte/motion';

export default function Blob($$anchor, $$props) {
	$.push($$props, true);

	const scale = new Spring(1);
	let hovering = $.state(false);

	const onPointerEnter = () => {
		$.set(hovering, true);
		scale.set(1.1);
	};

	const onPointerLeave = () => {
		$.set(hovering, false);
		scale.set(1);
	};

	Float($$anchor, {
		floatIntensity: 5,
		get scale() {
			return scale.current;
		},
		rotationIntensity: 2,
		rotationSpeed: [1, 0.5, 0.2],
		onpointerenter: onPointerEnter,
		onpointerleave: onPointerLeave,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children ?? $.noop, () => ({ hovering: $.get(hovering) }));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}