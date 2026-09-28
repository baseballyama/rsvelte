import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div><!></div>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	let listContext = getContext('list');
	let selected = $.derived(() => listContext?.selectedValue === $$props.value);

	;;

	var div = root();
	let classes;
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.template_effect(() => classes = $.set_class(div, 1, '', null, classes, { selected: $.get(selected) }));
	$.append($$anchor, div);
	$.pop();
}