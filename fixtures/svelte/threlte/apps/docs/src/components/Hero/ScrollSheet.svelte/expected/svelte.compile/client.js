import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Sheet } from '@threlte/theatre';
import { mapLinear } from 'three/src/math/MathUtils.js';
import { scrollPos, springScrollPos } from './scrollPos';

export default function ScrollSheet($$anchor, $$props) {
	$.push($$props, true);

	const $springScrollPos = () => $.store_get(springScrollPos, '$springScrollPos', $$stores);
	const $scrollPos = () => $.store_get(scrollPos, '$scrollPos', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let useSpring = $.prop($$props, 'useSpring', 3, true),
		startAtScrollPosition = $.prop($$props, 'startAtScrollPosition', 3, 0),
		endAtScrollPosition = $.prop($$props, 'endAtScrollPosition', 3, 1);

	let sheet = $.state(void 0);
	let sheetProgress = $.derived(() => Math.max(mapLinear(useSpring() ? $springScrollPos() : $scrollPos(), startAtScrollPosition(), endAtScrollPosition(), 0, 10), 0));

	$.user_effect(() => {
		if ($.get(sheet)) {
			$.get(sheet).sequence.position = $.get(sheetProgress);
		}
	});

	Sheet($$anchor, {
		get name() {
			return $$props.name;
		},

		get sheet() {
			return $.get(sheet);
		},

		set sheet($$value) {
			$.set(sheet, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}