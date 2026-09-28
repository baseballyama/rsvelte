import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChipInput from '@smui-extra/chip-input';

var root = $.from_html(`<div><!></div>`);

export default function _Disabled($$anchor) {
	let tags = $.state($.proxy(['great', 'awesome', 'wonderful']));
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

			var text_1 = $.text('Tags');

			$.append($$anchor, text_1);
		};

		ChipInput(node, {
			disabled: true,
			autocomplete$disabled: true,
			textfield$disabled: true,
			chipTrailingAction$class: 'material-icons',
			'chipTrailingAction$aria-label': 'Remove tag',
			get chips() {
				return $.get(tags);
			},

			set chips($$value) {
				$.set(tags, $$value, true);
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