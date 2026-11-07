import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_base_prefixed01_input($$anchor, $$props) {
	$.push($$props, true);

	const value1 = base + '/foo/';
	const value2 = `${base}/foo/`;

	// eslint-disable-next-line prefer-template -- Testing both variants
	pushState(base + '/foo/');

	pushState(`${base}/foo/`);
	pushState(value1);
	pushState(value2);
	$.pop();
}