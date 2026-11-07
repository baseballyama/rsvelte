import * as $ from 'svelte/internal/server';
import { value } from "package";

export default function Class_dynamic_prefix01_input($$renderer) {
	const derived = "link-three-" + value;

	$$renderer.push(`<a>Click me!</a> <a${$.attr_class("link-one-" + value, 'svelte-1iqqopw')}>Click me two!</a> <a${$.attr_class("link-one-" + value, 'svelte-1iqqopw')}>Click me two!</a> <a${$.attr_class(`link-two-${value}`, 'svelte-1iqqopw')}>Click me three!</a> <a${$.attr_class(`link-two-${value}`, 'svelte-1iqqopw')}>Click me three!</a> <a${$.attr_class($.clsx(derived), 'svelte-1iqqopw')}>Click me four!</a> <a${$.attr_class($.clsx(derived), 'svelte-1iqqopw')}>Click me four!</a>`);
}