import * as $ from 'svelte/internal/server';

export default function Generic_arrow($$renderer) {
	const identity = (value) => value;
	const value = identity("a");
	$$renderer.push(`<p${$.attr_class($.clsx(value), 'svelte-2bhnvg')}></p>`);
}
