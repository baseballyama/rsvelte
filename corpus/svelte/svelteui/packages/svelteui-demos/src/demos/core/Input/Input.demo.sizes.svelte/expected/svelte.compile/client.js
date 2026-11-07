import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from '@svelteuidev/core';

export const type = 'demo';
export const configuration = {};

export default function Input_demo_sizes($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => ['xs', 'sm', 'md', 'lg', 'xl'], $.index, ($$anchor, size) => {
		{
			let $0 = $.derived(() => `${size} input size`);

			Input($$anchor, {
				get size() {
					return size;
				},

				get placeholder() {
					return $.get($0);
				}
			});
		}
	});

	$.append($$anchor, fragment);
}