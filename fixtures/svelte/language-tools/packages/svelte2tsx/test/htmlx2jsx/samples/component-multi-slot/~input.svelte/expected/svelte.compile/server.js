import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { var: new_var }) => {
				$$renderer.push(`<h1>Hello ${$.escape(new_var)}</h1>`);
			},

			someslot: ($$renderer, { slotvar: newvar }) => {
				$$renderer.push(`<div slot="someslot"${$.attr_class('', void 0, { 'newvar': newvar })}><h2>Hi Slot ${$.escape(newvar)}</h2></div>`);
			},

			slotwithoutchildren: ($$renderer, { newvar2 }) => {
				$$renderer.push(`<div slot="slotwithoutchildren"${$.attr_class('', void 0, { 'newvar2': newvar2 })}></div>`);
			},

			slotwithmultiplelets: ($$renderer, { hi1, hi2, hi3: hi3alias }) => {
				$$renderer.push(`<div slot="slotwithmultiplelets"></div>`);
			},

			desc: ($$renderer) => {
				$$renderer.push(`<p slot="desc">Test</p>`);
			}
		}
	});
}