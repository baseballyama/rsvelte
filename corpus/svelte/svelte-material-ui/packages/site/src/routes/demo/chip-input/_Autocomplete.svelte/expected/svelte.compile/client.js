import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChipInput from '@smui-extra/chip-input';

var root = $.from_html(`<div><!></div>`);

export default function _Autocomplete($$anchor) {
	let categories = $.state($.proxy(['Productivity', 'Audio & Video']));
	let value = $.state('');

	const categoryList = [
		'Productivity',
		'Graphics & Photography',
		'Audio & Video',
		'Education',
		'Games',
		'Networking',
		'Developer Tools',
		'Science',
		'System',
		'Utilities'
	];

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

			var text_1 = $.text('Categories');

			$.append($$anchor, text_1);
		};

		let $0 = $.derived(() => categoryList.filter((category) => !$.get(categories).find((cat) => cat === category)));

		ChipInput(node, {
			chipTrailingAction$class: 'material-icons',
			'chipTrailingAction$aria-label': 'Remove category',
			get autocomplete$options() {
				return $.get($0);
			},
			autocomplete$showMenuWithNoInput: true,
			get chips() {
				return $.get(categories);
			},

			set chips($$value) {
				$.set(categories, $$value, true);
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