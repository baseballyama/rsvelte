import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";

var root = $.from_html(`Set your budget range ($<span class="font-medium tabular-nums"> </span> - <span class="font-medium tabular-nums"> </span>).`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="w-full max-w-md"><!></div>`);

export default function Field_slider($$anchor) {
	let value = $.state($.proxy([200, 800]));
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
		Field_Field($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
					Field_Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Price Range');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Field.Description, ($$anchor, Field_Description) => {
					Field_Description($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_1 = root();
							var span = $.sibling($.first_child(fragment_1));
							var text_1 = $.only_child(span, true);
							var span_1 = $.sibling(span, 2);
							var text_2 = $.only_child(span_1, true);

							$.next();

							$.template_effect(() => {
								$.set_text(text_1, $.get(value)[0]);
								$.set_text(text_2, $.get(value)[1]);
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				Slider(node_3, {
					type: 'multiple',
					max: 1000,
					min: 0,
					step: 10,
					class: 'mt-2 w-full',
					'aria-label': 'Price Range',
					get value() {
						return $.get(value);
					},

					set value($$value) {
						$.set(value, $$value, true);
					}
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}