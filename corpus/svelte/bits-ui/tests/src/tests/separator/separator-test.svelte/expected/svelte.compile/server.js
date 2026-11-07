import * as $ from 'svelte/internal/server';
import { Separator } from "bits-ui";

export default function Separator_test($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	$$renderer.push(`<main>`);

	if (Separator.Root) {
		$$renderer.push('<!--[-->');
		Separator.Root($$renderer, $.spread_props([{ 'data-testid': 'root' }, restProps]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</main>`);
}