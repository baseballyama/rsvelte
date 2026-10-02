import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slots from '../$$slots/input.svelte';

var root = $.from_html(`<div slot="foo"> </div>`);

export default function Input($$anchor) {
	Slots($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const valid1 = $.derived(() => $$slotProps.valid1);
				const validPropWrongType1 = $.derived(() => $$slotProps.validPropWrongType1);
				const invalidProp1 = $.derived(() => $$slotProps.invalidProp1);

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, `${$.get(valid1) === true}
    ${$.get(validPropWrongType1) === true}
    ${$.get(invalidProp1) ?? ''}`));

				$.append($$anchor, text);
			},

			foo: ($$anchor, $$slotProps) => {
				const valid2 = $.derived(() => $$slotProps.valid2);
				const validPropWrongType2 = $.derived(() => $$slotProps.validPropWrongType2);
				const invalidProp2 = $.derived(() => $$slotProps.invalidProp2);
				var div = root();
				var text_1 = $.only_child(div);

				$.template_effect(() => $.set_text(text_1, `${$.get(valid2) === true}
        ${$.get(validPropWrongType2) === true}
        ${$.get(invalidProp2) ?? ''}`));

				$.append($$anchor, div);
			}
		}
	});
}