import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<div> </div> <div> </div> <input/> <button>click me</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $s = () => $.store_get(s, '$s', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function action(node, binding) {
		return { update: (value) => s.set(value) };
	}

	let s = writable("simple");
	let v = "";

	function click() {
		s.set('clicked');
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var input = $.sibling(div_1, 2);

	$.remove_input_defaults(input);
	$.effect(() => $.bind_value(input, () => v, ($$value) => v = $$value));
	$.action(input, ($$node, $$action_arg) => action?.($$node, $$action_arg), () => v);

	var button = $.sibling(input, 2);

	$.template_effect(() => {
		$.set_text(text, v);
		$.set_text(text_1, $s());
	});

	$.event('click', button, click);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}