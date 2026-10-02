import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as paths from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_base_namespace_import01_input($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line prefer-template -- Testing both variants
	pushState(paths.base + '/foo/');

	pushState(`${paths.base}/foo/`);
	$.pop();
}