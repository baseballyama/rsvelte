import * as $ from 'svelte/internal/server';

export default function Example($$renderer, $$props) {
	$$renderer.push(`<div class="example"><div class="result"><!--[-->`);
	$.slot($$renderer, $$props, 'result', {}, null);
	$$renderer.push(`<!--]--></div> <div class="code"><!--[-->`);
	$.slot($$renderer, $$props, 'code', {}, null);
	$$renderer.push(`<!--]--></div></div>`);
}