import * as $ from 'svelte/internal/server';

export default function Template_nested($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const text = `a${{ value: `b${1}` }.value}`;
		$$renderer.push(`<p${$.attr_class($.clsx(text), 'svelte-d636p3')}></p>`);
	});
}
