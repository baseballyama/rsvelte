import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Edge from '$lib/components/generator/Edges/EdgeOption.svelte';

var root = $.from_html(`<div><input type="hidden"/> <div class="grid gap-4"></div></div>`);

export default function Edges($$anchor, $$props) {
	$.push($$props, true);

	let mode = $.prop($$props, 'mode', 3, 'radius'),
		value = $.prop($$props, 'value', 15),
		items = $.prop($$props, 'items', 19, () => []);

	function setValue(v) {
		value(v);
	}

	var div = root();
	var input = $.child(div);
	var div_1 = $.sibling(input, 2);

	$.each(div_1, 20, items, (itemValue) => itemValue, ($$anchor, itemValue) => {
		Edge($$anchor, {
			get value() {
				return itemValue;
			},

			get active() {
				return value();
			},
			onselect: setValue,
			get mode() {
				return mode();
			}
		});
	});

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(input, 'name', $$props.name);
		$.set_style(div_1, `grid-template-columns: repeat(${items().length ?? ''}, minmax(0, 1fr));`);
	});

	$.append($$anchor, div);
	$.pop();
}