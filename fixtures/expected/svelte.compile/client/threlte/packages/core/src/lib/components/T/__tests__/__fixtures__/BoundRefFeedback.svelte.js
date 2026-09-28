import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

export default function BoundRefFeedback($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.state(void 0);
	let width = $.state(1);

	$.user_effect(() => {
		if (!$.get(ref)) return;

		$.set(width, 2);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [$.get(width), 1, 1]);

		$.component(node, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
			T_BoxGeometry($$anchor, {
				get args() {
					return $.get($0);
				},

				get ref() {
					return $.get(ref);
				},

				set ref($$value) {
					$.set(ref, $$value);
				}
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}