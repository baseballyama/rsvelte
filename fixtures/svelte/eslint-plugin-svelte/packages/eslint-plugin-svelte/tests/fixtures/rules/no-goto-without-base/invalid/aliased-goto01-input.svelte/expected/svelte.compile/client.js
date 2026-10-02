import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto as alias } from '$app/navigation';

export default function Aliased_goto01_input($$anchor, $$props) {
	$.push($$props, true);
	alias('/foo');
	$.pop();
}