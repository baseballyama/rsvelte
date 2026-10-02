import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	const arr = Array.from({ length: 10001 });

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(arr);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		Component($$renderer, {});
	}

	$$renderer.push(`<!--]-->`);
}