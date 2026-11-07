import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from "./Component.svelte";
import { onMount } from "svelte";

var root = $.from_html(`<div> </div> <div> </div> <div> </div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let d2 = $.derived(() => s.d1.filter((x) => x > 2));
	let d3 = $.derived(() => s.all.filter((x) => x > 2));

	onMount(() => {
		queueMicrotask(() => {
			s.update_value();
		});
	});

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, `d2: ${$0 ?? ''}`);
			$.set_text(text_1, `d3: ${$1 ?? ''}`);
			$.set_text(text_2, `d4: ${$2 ?? ''}`);
		},
		[
			() => $.get(d2).join(','),
			() => $.get(d3).join(','),
			() => $.get(d3).join(',')
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}