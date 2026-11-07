import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as navigation from '$app/navigation';

export default function PushState_namespace_import01_input($$anchor, $$props) {
	$.push($$props, true);
	navigation.pushState('/foo');
	$.pop();
}