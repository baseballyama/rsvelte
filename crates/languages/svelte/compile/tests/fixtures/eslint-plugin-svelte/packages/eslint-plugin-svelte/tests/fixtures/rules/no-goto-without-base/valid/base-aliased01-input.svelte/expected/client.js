import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base as alias } from '$app/paths';
import { goto } from '$app/navigation';

export default function Base_aliased01_input($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line prefer-template -- Testing both variants
	goto(alias + '/foo/');

	goto(`${alias}/foo/`);
	$.pop();
}