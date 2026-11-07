import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_base_prefixed01_input($$anchor, $$props) {
	$.push($$props, true);

	const value1 = base + '/foo/';
	const value2 = `${base}/foo/`;

	// eslint-disable-next-line prefer-template -- Testing both variants
	goto(base + '/foo/');

	goto(`${base}/foo/`);
	goto(value1);
	goto(value2);
	$.pop();
}