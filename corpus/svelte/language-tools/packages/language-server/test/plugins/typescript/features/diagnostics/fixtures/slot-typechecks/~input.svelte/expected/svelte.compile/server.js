import * as $ from 'svelte/internal/server';
import Slots from './diagnostics-slots-imported.svelte';

export default function Input($$renderer) {
	Slots($$renderer, {
		prop: defaultSlotProp,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { defaultSlotProp }) => {
				$$renderer.push(`<!---->${$.escape(defaultSlotProp === 1)}
  ${$.escape(defaultSlotProp === false)} ${$.escape(namedSlotProp)}`);
			},

			named: ($$renderer, { namedSlotProp }) => {
				$$renderer.push(`<p slot="named"${$.attr_class('', void 0, { 'namedSlotProp': namedSlotProp })}>${$.escape(namedSlotProp === 1)}
    ${$.escape(namedSlotProp === false)}
    ${$.escape(defaultSlotProp)}</p>`);
			},

			spread: ($$renderer, { a, b: c, d }) => {
				$$renderer.push(`<p slot="spread">${$.escape(a === true)}
    ${$.escape(c === '')}
    ${$.escape(a === '')}
    ${$.escape(d)}</p>`);
			}
		}
	});
}