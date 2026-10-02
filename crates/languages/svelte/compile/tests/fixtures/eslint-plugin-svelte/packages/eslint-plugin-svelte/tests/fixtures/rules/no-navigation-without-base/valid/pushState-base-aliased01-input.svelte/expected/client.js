import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base as alias } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_base_aliased01_input($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line prefer-template -- Testing both variants
	pushState(alias + '/foo/');

	pushState(`${alias}/foo/`);
	$.pop();
}