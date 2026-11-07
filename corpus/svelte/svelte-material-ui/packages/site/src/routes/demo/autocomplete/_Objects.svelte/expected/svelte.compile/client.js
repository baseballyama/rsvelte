import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Autocomplete from '@smui-extra/autocomplete';

var root = $.from_html(`<div><!> <pre class="status"> </pre></div>`);

export default function _Objects($$anchor) {
	// When options are objects, you need to wrap them in a $state rune, so that
	// Svelte can compare the objects properly.
	let options = $.proxy([
		{ id: 0, label: 'One' },
		{ id: 1, label: 'Two' },
		{ id: 2, label: 'Three' },
		{ id: 3, label: 'Four' },
		{ id: 4, label: 'Five' }
	]);

	let value = $.state(void 0);
	var div = root();
	var node = $.child(div);

	Autocomplete(node, {
		get options() {
			return options;
		},
		getOptionLabel: (option) => option ? `${option.label} (${option.id})` : '',
		label: 'Objects',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var pre = $.sibling(node, 2);
	var text = $.only_child(pre);

	$.reset(div);
	$.template_effect(($0) => $.set_text(text, `Selected: ${$0 ?? ''}`), [() => $.get(value) ? JSON.stringify($.get(value)) : '']);
	$.append($$anchor, div);
}