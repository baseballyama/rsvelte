import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Mesh, Vector3 } from 'three';
import { T, useTask } from '@threlte/core';

const createPoints = (count = 50) => {
	const points = [];

	for (let i = 0; i < count; i += 1) {
		points.push(new Vector3());
	}

	return points;
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'cursorPosition',
	'children'
]);

export default function CursorLine($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	const count = 50;
	let front = $.state(createPoints(count));
	let back = createPoints(count);

	useTask((delta) => {
		back[0]?.fromArray($$props.cursorPosition);

		const alpha = 1e-6 ** delta;

		for (let i = 1; i < count; i += 1) {
			const first = back[i - 1];
			const second = back[i];

			if (first) {
				second?.lerp(first, alpha);
			}
		}

		const temp = $.get(front);

		$.set(front, back);
		back = temp;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, $.spread_props(() => props, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children ?? $.noop, () => ({
					getPoints() {
						return $.get(front);
					}
				}));

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}