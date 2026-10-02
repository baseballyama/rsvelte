import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as paths from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_base_namespace_import01_input($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line prefer-template -- Testing both variants
	replaceState(paths.base + '/foo/');

	replaceState(`${paths.base}/foo/`);
	$.pop();
}