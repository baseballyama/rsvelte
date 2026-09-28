import * as $ from 'svelte/internal/server';

export default function Col($$renderer, $$props) {
	let { class: klass = "" } = $$props;

	$$renderer.push(`<col${$.attr_class($.clsx(klass))}/>`);
}