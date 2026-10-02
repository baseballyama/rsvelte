import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FancyList from './FancyList.svelte';

var root = $.from_html(`<div slot="item"> </div>`);
var root_1 = $.from_html(`<p slot="footer" class="footer">Footer</p>`);

export default function Slot_test_output($$anchor) {
	const items = [1, 2, 3];

	FancyList($$anchor, {
		get items() {
			return items;
		},

		$$slots: {
			item: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				var div = root();
				var text = $.only_child(div, true);

				$.template_effect(() => {
					$.set_attribute(div, 'id', $.get(item).id);
					$.set_text(text, $.get(item).text);
				});

				$.append($$anchor, div);
			},

			footer: ($$anchor, $$slotProps) => {
				var p = root_1();

				$.append($$anchor, p);
			}
		}
	});
}