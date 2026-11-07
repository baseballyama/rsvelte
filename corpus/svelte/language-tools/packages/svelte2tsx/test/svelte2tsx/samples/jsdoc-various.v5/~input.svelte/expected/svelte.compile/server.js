import * as $ from 'svelte/internal/server';

function foo($$renderer, bar) {
	$$renderer.push(`<!---->${$.escape(bar)}`);
}

export default function Input($$renderer, $$props) {
	/** @type {{ b: T }}*/
	let { b } = $$props;

	let rect;

	$$renderer.push(`<div></div> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}