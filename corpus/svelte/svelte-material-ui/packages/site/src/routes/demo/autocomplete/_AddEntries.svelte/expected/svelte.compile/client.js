import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Autocomplete from '@smui-extra/autocomplete';
import { Text } from '@smui/list';
import Button, { Label } from '@smui/button';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Textfield from '@smui/textfield';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <pre class="status"> </pre> <!></div>`);

export default function _AddEntries($$anchor) {
	let dialogOpen = $.state(false);

	// When options are objects, you need to wrap them in a $state rune, so that
	// Svelte can compare the objects properly.
	let options = $.state($.proxy([
		{ id: 0, label: 'One' },
		{ id: 1, label: 'Two' },
		{ id: 2, label: 'Three' },
		{ id: 3, label: 'Four' },
		{ id: 4, label: 'Five' }
	]));

	let newLabel = $.state('');
	let value = $.state(void 0);
	let text = $.state('');

	function addObject() {
		const newObject = {
			id: $.get(options)[$.get(options).length - 1].id + 1,
			label: $.get(newLabel)
		};

		$.set(options, [...$.get(options), newObject], true);
		$.set(value, newObject, true);
		$.set(dialogOpen, false);
	}

	var div = root_2();
	var node = $.child(div);

	{
		const noMatches = ($$anchor) => {
			Text($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Add item');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		Autocomplete(node, {
			get options() {
				return $.get(options);
			},
			getOptionLabel: (option) => option ? `${option.label} (${option.id})` : '',
			noMatchesActionDisabled: false,
			onSMUIAutocompleteNoMatchesAction: () => {
				$.set(newLabel, $.get(text), true);
				$.set(dialogOpen, true);
			},
			label: 'Dialog',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			get text() {
				return $.get(text);
			},

			set text($$value) {
				$.set(text, $$value, true);
			},
			noMatches,
			$$slots: { noMatches: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text_2 = $.only_child(pre);
	var node_1 = $.sibling(pre, 2);

	Dialog(node_1, {
		'aria-labelledby': 'autocomplete-dialog-title',
		'aria-describedby': 'autocomplete-dialog-content',
		get open() {
			return $.get(dialogOpen);
		},

		set open($$value) {
			$.set(dialogOpen, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Title(node_2, {
				id: 'autocomplete-dialog-title',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('New Item');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Content(node_3, {
				id: 'autocomplete-dialog-content',
				children: ($$anchor, $$slotProps) => {
					Textfield($$anchor, {
						label: 'Label',
						get value() {
							return $.get(newLabel);
						},

						set value($$value) {
							$.set(newLabel, $$value, true);
						}
					});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Actions(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_5 = $.first_child(fragment_3);

					Button(node_5, {
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Cancel');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Button(node_6, {
						onclick: addObject,
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Add');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.template_effect(($0) => $.set_text(text_2, `Selected: ${$0 ?? ''}`), [() => $.get(value) ? JSON.stringify($.get(value)) : '']);
	$.append($$anchor, div);
}