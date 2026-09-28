import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { class: cls } = $$props;

	$$renderer.push(`<div${$.attr_class($.clsx(cls))}>child</div>`);
}