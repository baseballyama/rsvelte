import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChipInput from '@smui-extra/chip-input';

var root = $.from_html(`<div><!></div>`);

export default function _Validity($$anchor) {
	let letters = $.state($.proxy(['a', 'b', 'c']));
	let value = $.state('');
	var div = root();
	var node = $.child(div);

	{
		const chipTrailingAction = ($$anchor) => {
			$.next();

			var text = $.text('cancel');

			$.append($$anchor, text);
		};

		const label = ($$anchor) => {
			$.next();

			var text_1 = $.text('Letters');

			$.append($$anchor, text_1);
		};

		ChipInput(node, {
			chipTrailingAction$class: 'material-icons',
			'chipTrailingAction$aria-label': 'Remove letter',
			autocomplete$combobox: true,
			input$maxlength: 1,
			input$pattern: '[a-zA-Z]',
			get chips() {
				return $.get(letters);
			},

			set chips($$value) {
				$.set(letters, $$value, true);
			},

			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			chipTrailingAction,
			label,
			$$slots: { chipTrailingAction: true, label: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}