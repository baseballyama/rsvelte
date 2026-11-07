import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { goto } from '$app/navigation';

export default function Base_prefixed01_input($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line prefer-template -- Testing both variants
	goto(base + '/foo/');

	goto(`${base}/foo/`);
	$.pop();
}