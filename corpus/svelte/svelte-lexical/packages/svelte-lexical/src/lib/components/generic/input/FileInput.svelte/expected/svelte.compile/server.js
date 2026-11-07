import * as $ from 'svelte/internal/server';

export default function FileInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { dataTestId, accept = undefined, label, onChange, id = '' } = $$props;

		$$renderer.push(`<div class="Input__wrapper"><label class="Input__label"${$.attr('for', id)}>${$.escape(label)}</label> <input type="file"${$.attr('accept', accept)} class="Input__input"${$.attr(
			'data-test-id',
			/* @ts-ignore TS not supported in Svelte Html */
			dataTestId
		)}${$.attr('id', id)}/></div>`);
	});
}