import * as $ from 'svelte/internal/server';
import { Input } from '@svelteuidev/core';

export const type = 'demo';
export const configuration = {};

export default function Input_demo_sizes($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(['xs', 'sm', 'md', 'lg', 'xl']);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let size = each_array[$$index];

		Input($$renderer, { size, placeholder: `${size} input size` });
	}

	$$renderer.push(`<!--]-->`);
}