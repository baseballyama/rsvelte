import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pager } from "../../src/index";

var root = $.from_html(`<div class="demo-box"><h3> </h3> <!></div>`);

export default function Pager_1($$anchor) {
	let value = $.state(2);
	let pageSize = $.state(10);
	var div = root();
	var h3 = $.child(div);
	var text = $.only_child(h3);
	var node = $.sibling(h3, 2);

	Pager(node, {
		total: 100,
		get pageSize() {
			return $.get(pageSize);
		},

		set pageSize($$value) {
			$.set(pageSize, $$value, true);
		},

		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.reset(div);
	$.template_effect(() => $.set_text(text, `100 rows (active = ${$.get(value) ?? ''}, page size = ${$.get(pageSize) ?? ''})`));
	$.append($$anchor, div);
}