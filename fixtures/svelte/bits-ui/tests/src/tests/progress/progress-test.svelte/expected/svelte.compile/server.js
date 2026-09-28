import * as $ from 'svelte/internal/server';
import { Progress } from "bits-ui";

export default function Progress_test($$renderer, $$props) {
	let { value = 0, $$slots, $$events, ...restProps } = $$props;

	$$renderer.push(`<main>`);

	if (Progress.Root) {
		$$renderer.push('<!--[-->');

		Progress.Root($$renderer, $.spread_props([
			{ 'aria-label': 'progress', 'data-testid': 'root', value },
			restProps
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <button data-testid="binding">${$.escape(value)}</button></main>`);
}