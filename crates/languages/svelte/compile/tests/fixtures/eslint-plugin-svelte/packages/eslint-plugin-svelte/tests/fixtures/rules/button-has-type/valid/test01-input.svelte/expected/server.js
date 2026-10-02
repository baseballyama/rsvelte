import * as $ from 'svelte/internal/server';
import Button from './my-button';

export default function Test01_input($$renderer) {
	let buttonType = 'button';

	$$renderer.push(`<button type="button">Hello World</button> <button type="submit">Hello World</button> <button type="reset">Hello World</button> <button${$.attr('type', buttonType)}>Hello World</button> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Hello World`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}