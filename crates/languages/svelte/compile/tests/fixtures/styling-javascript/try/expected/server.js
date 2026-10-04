import * as $ from 'svelte/internal/server';

export default function Try($$renderer) {
	let value = "a";
	function run() {
		try {
			throw "b";
		} catch (error) {
			value = error;
		} finally {
			console.log(value);
		}
	}
	$$renderer.push(`<p${$.attr_class($.clsx(value), 'svelte-nct6v0')}></p>`);
}
