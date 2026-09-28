import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor, $$props) {
	const attributes = { "data-test": $$props.browser ? undefined : "" };
	var div = root();

	$.attribute_effect(div, () => ({ ...attributes }));
	$.append($$anchor, div);
}