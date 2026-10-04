import * as $ from 'svelte/internal/server';

export default function Template_default($$renderer) {
	const f = (x = `a${1}`) => x;
	$$renderer.push(`<p${$.attr_class($.clsx(f()), 'svelte-1mh96db')}></p>`);
}
