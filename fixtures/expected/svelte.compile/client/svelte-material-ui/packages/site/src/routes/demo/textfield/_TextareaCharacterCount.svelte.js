import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';
import CharacterCounter from '@smui/textfield/character-counter';

var root = $.from_html(`<div class="margins"><!></div>`);

export default function _TextareaCharacterCount($$anchor) {
	let value = $.state('');
	var div = root();
	var node = $.child(div);

	{
		const internalCounter = ($$anchor) => {
			CharacterCounter($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('0 / 100');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node, {
			textarea: true,
			input$maxlength: 100,
			label: 'Label',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			internalCounter,
			$$slots: { internalCounter: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}