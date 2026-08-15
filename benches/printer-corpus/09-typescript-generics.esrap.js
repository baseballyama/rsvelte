import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><span> </span> <small> </small></button>`);
var root_1 = $.from_html(`<div class="results svelte-138j00e"></div>`);
var root_2 = $.from_html(`<p>No typed rows match.</p>`);
var root_3 = $.from_html(`<section class="svelte-138j00e"><label>Filter <input/></label> <!></section>`);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	const result = ($$anchor, row = $.noop, index = $.noop) => {
		var button = root();
		let classes;
		var span = $.child(button);
		var text = $.child(span);

		$.reset(span);

		var small = $.sibling(span, 2);
		var text_1 = $.child(small, true);

		$.reset(small);
		$.reset(button);

		$.template_effect(() => {
			$.set_attribute(button, 'aria-pressed', $.get(selected)?.id === row().id);
			classes = $.set_class(button, 1, 'svelte-138j00e', null, classes, { selected: $.get(selected)?.id === row().id });
			$.set_text(text, `${index() + 1}. ${row().label ?? ''}`);
			$.set_text(text_1, row().id);
		});

		$.delegated('click', button, () => choose(row()));
		$.append($$anchor, button);
	};

	let initial = $.prop($$props, 'initial', 3, null),
		onselect = $.prop($$props, 'onselect', 3, () => {});

	let query = $.state('');
	let selected = $.state($.proxy(initial()));
	let visible = $.derived(() => $$props.rows.filter((row) => row.active !== false && row.label.toLowerCase().includes($.get(query).toLowerCase())));

	function choose(row) {
		$.set(selected, row, true);
		onselect()(row);
	}

	var section = root_3();
	var label = $.child(section);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var node = $.sibling(label, 2);

	{
		var consequent = ($$anchor) => {
			var div = root_1();

			$.each(div, 23, () => $.get(visible), (row) => row.id, ($$anchor, row, index) => {
				result($$anchor, () => $.get(row), () => $.get(index));
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var p = root_2();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(visible).length) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(section);
	$.bind_value(input, () => $.get(query), ($$value) => $.set(query, $$value));
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);
