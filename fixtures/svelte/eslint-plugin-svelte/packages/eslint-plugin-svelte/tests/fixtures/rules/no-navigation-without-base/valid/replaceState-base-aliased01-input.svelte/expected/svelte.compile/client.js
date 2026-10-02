import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base as alias } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_base_aliased01_input($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line prefer-template -- Testing both variants
	replaceState(alias + '/foo/');

	replaceState(`${alias}/foo/`);
	$.pop();
}