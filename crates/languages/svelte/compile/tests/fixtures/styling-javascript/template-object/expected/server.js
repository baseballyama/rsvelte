import * as $ from 'svelte/internal/server';

export default function Template_object($$renderer) {
	const items = Array.from({ length: 2 }, (_, i) => ({ text: `a${i}` }));
	$$renderer.push(`<p${$.attr_class($.clsx(items[0].text), 'svelte-im8gsn')}></p>`);
}
