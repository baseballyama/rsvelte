import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as paths from '$app/paths';
import { goto } from '$app/navigation';

export default function Goto_base_namespace_import01_input($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line prefer-template -- Testing both variants
	goto(paths.base + '/foo/');

	goto(`${paths.base}/foo/`);
	$.pop();
}