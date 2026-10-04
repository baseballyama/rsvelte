import * as $ from 'svelte/internal/server';

export default function Getter($$renderer) {
	let name = "a";
	const obj = { get name() {
		return name;
	}, set name(value) {
		name = value;
	} };
	$$renderer.push(`<p${$.attr_class($.clsx(obj.name), 'svelte-en5ll0')}></p>`);
}
