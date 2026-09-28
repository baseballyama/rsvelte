import * as $ from 'svelte/internal/server';

export default function LoremIpsum($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(Array(2));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let _item = each_array[$$index];

		$$renderer.push(`<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
    non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`);
	}

	$$renderer.push(`<!--]-->`);
}