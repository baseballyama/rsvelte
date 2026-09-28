import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DatePicker from "components/DatePicker";
import Code from "docs/Code.svelte";
import datepickers from "examples/date-pickers.txt";

var root = $.from_html(`<div><small> </small></div> <!> <!>`, 1);

export default function Date_pickers($$anchor) {
	let selected;
	var fragment = root();
	var div = $.first_child(fragment);
	var small = $.child(div);
	var text = $.only_child(small);

	$.reset(div);

	var node = $.sibling(div, 2);

	DatePicker(node, { $$events: { change: (i) => selected = i.detail } });

	var node_1 = $.sibling(node, 2);

	Code(node_1, {
		get code() {
			return datepickers;
		}
	});

	$.template_effect(($0) => $.set_text(text, `I selected ${$0 ?? ''}`), [() => selected ? selected.toLocaleDateString() : "nothing"]);
	$.append($$anchor, fragment);
}