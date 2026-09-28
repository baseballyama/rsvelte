import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingLabelInput, Helper } from "flowbite-svelte";

var root = $.from_html(`<span class="font-medium">Well done!</span> Some success message.`, 1);
var root_1 = $.from_html(`<span class="font-medium">Oh, snapp!</span> Some error message.`, 1);
var root_2 = $.from_html(`<div class="mb-6 grid items-end gap-6 md:grid-cols-3"><div><!> <!></div> <div><!> <!></div> <div><!> <!></div></div> <div class="mb-6 grid items-end gap-6 md:grid-cols-3"><div><!> <!></div> <div><!> <!></div> <div><!> <!></div></div>`, 1);

export default function Validation($$anchor) {
	var fragment = root_2();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	FloatingLabelInput(node, {
		color: 'green',
		variant: 'filled',
		id: 'filled_success',
		'aria-describedby': 'filled_success_help',
		name: 'filled_success',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Filled success');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Helper(node_1, {
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	FloatingLabelInput(node_2, {
		color: 'green',
		variant: 'outlined',
		id: 'outlined_success',
		'aria-describedby': 'outlined_success_help',
		name: 'outlined_success',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Outlined success');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Helper(node_3, {
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();

			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_4 = $.child(div_3);

	FloatingLabelInput(node_4, {
		color: 'green',
		variant: 'standard',
		id: 'standard_success',
		'aria-describedby': 'standard_success_help',
		name: 'standard_success',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Standard success');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Helper(node_5, {
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();

			$.next();
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div);

	var div_4 = $.sibling(div, 2);
	var div_5 = $.child(div_4);
	var node_6 = $.child(div_5);

	FloatingLabelInput(node_6, {
		color: 'red',
		variant: 'filled',
		id: 'filled_error',
		'aria-describedby': 'filled_error_help',
		name: 'filled_error',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Filled error');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Helper(node_7, {
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_1();

			$.next();
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_8 = $.child(div_6);

	FloatingLabelInput(node_8, {
		color: 'red',
		variant: 'outlined',
		id: 'outlined_error',
		'aria-describedby': 'outlined_error_help',
		name: 'outlined_success',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Outlined error');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Helper(node_9, {
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_1();

			$.next();
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_10 = $.child(div_7);

	FloatingLabelInput(node_10, {
		color: 'red',
		variant: 'standard',
		id: 'standard_error',
		'aria-describedby': 'standard_error_help',
		name: 'standard_success',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Standard error');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Helper(node_11, {
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_1();

			$.next();
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_7);
	$.reset(div_4);
	$.append($$anchor, fragment);
}