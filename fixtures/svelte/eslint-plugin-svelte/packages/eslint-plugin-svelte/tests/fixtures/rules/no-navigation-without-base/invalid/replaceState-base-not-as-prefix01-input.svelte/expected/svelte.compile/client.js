import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { replaceState } from '$app/navigation';

export default function ReplaceState_base_not_as_prefix01_input($$anchor, $$props) {
	$.push($$props, true);
	replaceState('/foo/' + base);
	replaceState(`/foo/${base}`);
	$.pop();
}