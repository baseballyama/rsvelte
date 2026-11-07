import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_base_prefixed01_input($$anchor, $$props) {
	$.push($$props, true);

	const value1 = base + '/foo/';
	const value2 = `${base}/foo/`;

	// eslint-disable-next-line prefer-template -- Testing both variants
	replaceState(base + '/foo/');

	replaceState(`${base}/foo/`);
	replaceState(value1);
	replaceState(value2);
	$.pop();
}