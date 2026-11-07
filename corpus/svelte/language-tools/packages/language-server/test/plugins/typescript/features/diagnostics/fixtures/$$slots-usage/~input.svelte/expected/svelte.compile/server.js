import * as $ from 'svelte/internal/server';
import Slots from '../$$slots/input.svelte';

export default function Input($$renderer) {
	Slots($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { valid1, validPropWrongType1, invalidProp1 }) => {
				$$renderer.push(`<!---->${$.escape(valid1 === true)}
    ${$.escape(validPropWrongType1 === true)}
    ${$.escape(invalidProp1)}`);
			},

			foo: ($$renderer, { valid2, validPropWrongType2, invalidProp2 }) => {
				$$renderer.push(`<div slot="foo">${$.escape(valid2 === true)}
        ${$.escape(validPropWrongType2 === true)}
        ${$.escape(invalidProp2)}</div>`);
			}
		}
	});
}