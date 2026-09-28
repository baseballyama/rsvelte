import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';

var root = $.from_html(`<p> </p> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let n = $.prop($$props, 'n', 3, 0);
	let i = $.state(0);

	function logRender(i) {
		console.log(`render ${i}`);
	}

	$.user_pre_effect(() => {
		console.log(`$effect.pre ${n()}`);
		untrack(() => $.update(i));
	});

	$.user_pre_effect(() => {
		console.log('another $effect.pre ' + $.get(i));
	});

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[() => logRender(`n${n()}`), () => logRender(`i${$.get(i)}`)]
	);

	$.append($$anchor, fragment);
	$.pop();
}