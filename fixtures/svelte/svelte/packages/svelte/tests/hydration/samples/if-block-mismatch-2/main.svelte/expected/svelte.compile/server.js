import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { condition } = $$props;

	if (condition) {
		$$renderer.push(`<!--[0--><!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div> hello`);
}