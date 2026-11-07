import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiBomb } from '@mdi/js';
import ChipInput from '@smui-extra/chip-input';

var root = $.from_svg(`<svg style="display: block;" viewBox="0 0 24 24"><path fill="currentColor"></path></svg>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function _SvgRemoveIcons($$anchor) {
	let tags = $.state($.proxy(['great', 'awesome', 'wonderful']));
	let value = $.state('');
	var div = root_1();
	var node = $.child(div);

	{
		const chipTrailingAction = ($$anchor) => {
			var svg = root();
			var path = $.only_child(svg);

			$.template_effect(() => $.set_attribute(path, 'd', mdiBomb));
			$.append($$anchor, svg);
		};

		const label = ($$anchor) => {
			$.next();

			var text = $.text('Tags');

			$.append($$anchor, text);
		};

		ChipInput(node, {
			autocomplete$combobox: true,
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