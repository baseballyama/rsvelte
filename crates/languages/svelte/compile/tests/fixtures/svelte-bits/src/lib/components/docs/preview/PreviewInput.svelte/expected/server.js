import * as $ from 'svelte/internal/server';

export default function PreviewInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			title = '',
			value = '',
			placeholder = '',
			maxlength,
			isDisabled = false,
			onChange
		} = $$props;

		$$renderer.push(`<div class="scrubber"><div class="scrubber-track scrubber-track--input"${$.attr('data-disabled', isDisabled)}><span class="scrubber-label">${$.escape(title)}</span> <input class="scrubber-input" type="text"${$.attr('value', value)}${$.attr('placeholder', placeholder)}${$.attr('maxlength', maxlength)}${$.attr('disabled', isDisabled, true)}${$.attr('aria-label', title)}/></div></div>`);
	});
}