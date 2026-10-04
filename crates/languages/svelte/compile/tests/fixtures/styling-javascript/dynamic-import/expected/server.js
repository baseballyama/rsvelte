import * as $ from 'svelte/internal/server';

export default function Dynamic_import($$renderer) {
	const value = "a";
	async function load() {
		return import("./x.js");
	}
	$$renderer.push(`<p${$.attr_class($.clsx(value), 'svelte-gd3g62')}></p>`);
}
