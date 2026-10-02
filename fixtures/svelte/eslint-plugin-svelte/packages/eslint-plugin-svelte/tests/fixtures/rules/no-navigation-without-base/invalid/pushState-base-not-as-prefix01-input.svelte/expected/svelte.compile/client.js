import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { pushState } from '$app/navigation';

export default function PushState_base_not_as_prefix01_input($$anchor, $$props) {
	$.push($$props, true);
	pushState('/foo/' + base);
	pushState(`/foo/${base}`);
	$.pop();
}