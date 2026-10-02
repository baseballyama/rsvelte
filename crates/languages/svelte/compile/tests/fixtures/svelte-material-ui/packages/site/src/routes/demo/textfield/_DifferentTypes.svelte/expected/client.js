import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';

var root = $.from_html(`<div class="columns margins"><div><!></div> <div><!></div> <div><!></div> <div class="hide-file-ui svelte-s8jtzn"><!></div></div>`);

export default function _DifferentTypes($$anchor, $$props) {
	$.push($$props, true);

	let valueTypeNumber = $.state(0);
	let valueTypeNumberStep = $.state(0);
	let valueTypeDate = $.state('');
	let valueTypeFiles = $.state(null);

	// Note: the change and input events fire before the `files` prop is updated.
	$.user_effect(() => {
		if ($.get(valueTypeFiles) != null && $.get(valueTypeFiles).length) {
			alert('Selected ' + $.get(valueTypeFiles).length + ' file(s).');
		}
	});

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Textfield(node, {
		label: 'Number',
		type: 'number',
		get value() {
			return $.get(valueTypeNumber);
		},

		set value($$value) {
			$.set(valueTypeNumber, $$value, true);
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Textfield(node_1, {
		label: 'Number with Step',
		type: 'number',
		input$step: '2',
		get value() {
			return $.get(valueTypeNumberStep);
		},

		set value($$value) {
			$.set(valueTypeNumberStep, $$value, true);
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Textfield(node_2, {
		label: 'DateTime-Local',
		type: 'datetime-local',
		get value() {
			return $.get(valueTypeDate);
		},

		set value($$value) {
			$.set(valueTypeDate, $$value, true);
		}
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_3 = $.child(div_4);

	Textfield(node_3, {
		label: 'File',
		type: 'file',
		get files() {
			return $.get(valueTypeFiles);
		},

		set files($$value) {
			$.set(valueTypeFiles, $$value, true);
		}
	});

	$.reset(div_4);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}