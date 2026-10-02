import * as $ from 'svelte/internal/server';
import { value } from "package";

export default function Class_dynamic_suffix01_input($$renderer) {
	const derived = value + "-link-three";

	$$renderer.push(`<a>Click me!</a> <a${$.attr_class(value + "-link-one", 'svelte-1yi7u1b')}>Click me two!</a> <a${$.attr_class(value + "-link-one", 'svelte-1yi7u1b')}>Click me two!</a> <a${$.attr_class(`${value}-link-two`, 'svelte-1yi7u1b')}>Click me three!</a> <a${$.attr_class(`${value}-link-two`, 'svelte-1yi7u1b')}>Click me three!</a> <a${$.attr_class($.clsx(derived), 'svelte-1yi7u1b')}>Click me four!</a> <a${$.attr_class($.clsx(derived), 'svelte-1yi7u1b')}>Click me four!</a> <!--[-->`);

	const each_array = $.ensure_array_like(["one", "two"]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let count = each_array[$$index];

		$$renderer.push(`<b${$.attr_class("bold-" + count, 'svelte-1yi7u1b')}>Bold in each</b>`);
	}

	$$renderer.push(`<!--]-->`);
}