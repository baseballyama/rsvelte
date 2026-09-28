import * as $ from 'svelte/internal/server';
import { Mesh, Vector3 } from 'three';
import { T, useTask } from '@threlte/core';

const createPoints = (count = 50) => {
	const points = [];

	for (let i = 0; i < count; i += 1) {
		points.push(new Vector3());
	}

	return points;
};

export default function CursorLine($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { cursorPosition, children, $$slots, $$events, ...props } = $$props;
		const count = 50;
		let front = createPoints(count);
		let back = createPoints(count);

		useTask((delta) => {
			back[0]?.fromArray(cursorPosition);

			const alpha = 1e-6 ** delta;

			for (let i = 1; i < count; i += 1) {
				const first = back[i - 1];
				const second = back[i];

				if (first) {
					second?.lerp(first, alpha);
				}
			}

			const temp = front;

			front = back;
			back = temp;
		});

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, $.spread_props([
				props,
				{
					children: ($$renderer) => {
						children?.($$renderer, {
							getPoints() {
								return front;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}