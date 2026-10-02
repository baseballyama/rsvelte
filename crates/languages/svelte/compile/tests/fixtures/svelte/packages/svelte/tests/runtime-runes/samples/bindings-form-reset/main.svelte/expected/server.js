import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let text = 'text';
		let checkbox = true;
		let radio_group = 'a';
		let checkbox_group = ['a'];

		// this will be ssrd
		let select = 'a';

		let textarea = 'textarea';

		$$renderer.push(`<p>${$.escape(
			// changing the value of `select` on mount
			JSON.stringify({
				text,
				checkbox,
				radio_group,
				checkbox_group,
				select,
				textarea
			})
		)}</p> <form><input${$.attr('value', text)}/> <input type="checkbox"${$.attr('checked', checkbox, true)}/> <input type="radio" name="radio" value="a"${$.attr('checked', radio_group === 'a', true)}/> <input type="radio" name="radio" value="b"${$.attr('checked', radio_group === 'b', true)}/> <input type="checkbox" name="checkbox" value="a"${$.attr('checked', checkbox_group.includes('a'), true)}/> <input type="checkbox" name="checkbox" value="b"${$.attr('checked', checkbox_group.includes('b'), true)}/> `);

		$$renderer.select({ value: select }, ($$renderer) => {
			$$renderer.option({ value: 'a' }, ($$renderer) => {
				$$renderer.push(`a`);
			});

			$$renderer.option({ value: 'b' }, ($$renderer) => {
				$$renderer.push(`b`);
			});
		});

		$$renderer.push(` <textarea>`);

		const $$body = $.escape(textarea);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <button type="button">Reset</button></form>`);
	});
}