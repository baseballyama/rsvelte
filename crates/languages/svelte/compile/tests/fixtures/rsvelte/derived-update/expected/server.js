import * as $ from 'svelte/internal/server';

export default function Derived_update($$renderer) {
	let count = $.derived(() => 0);
	let after = $.update_derived(count);
	let before = $.update_derived_pre(count, -1);
	$$renderer.push(`<p>${$.escape(after)} ${$.escape(before)} ${$.escape(count())}</p>`);
}
