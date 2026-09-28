import * as $ from 'svelte/internal/server';

export default function Test($$renderer, $$props) {
	let { children } = $$props;
	let innerText = void 0;

	;;
	$$renderer.push(`<div contenteditable="true">`);

	if (innerText) {
		$$renderer.push(`${innerText}`);
	} else {
		children($$renderer);
		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`</div>`);
}