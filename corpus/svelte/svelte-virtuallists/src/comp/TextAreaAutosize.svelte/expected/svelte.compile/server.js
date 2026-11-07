import * as $ from 'svelte/internal/server';

export default function TextAreaAutosize($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = '', minRows = 1, maxRows = 40 } = $$props;
		const splitLines = (str) => str.split(/\r?\n/);

		function stripLines(value, max) {
			const array = splitLines(value);

			array.length = max;

			const text = array.reduce(function (previousValue, currentValue) {
				return previousValue + '\n' + currentValue;
			});

			return text;
		}

		let minHeight = $.derived(() => `${1 + minRows * 1.2}em`);
		let maxHeight = $.derived(() => maxRows ? `${1 + maxRows * 1.2}em` : `auto`);

		$$renderer.push(`<div class="container svelte-1taaexb"><pre aria-hidden="true"${$.attr_style(`min-height: ${minHeight()}; max-height: ${maxHeight()}`)} class="svelte-1taaexb">${$.escape(value + '\n')}</pre> <textarea readonly="" style="outline: none;" class="svelte-1taaexb">`);

		const $$body = $.escape(value);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div>`);
	});
}