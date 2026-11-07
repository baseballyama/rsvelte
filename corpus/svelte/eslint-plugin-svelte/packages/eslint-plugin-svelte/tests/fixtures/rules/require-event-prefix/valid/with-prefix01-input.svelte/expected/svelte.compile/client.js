import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function With_prefix01_input($$anchor, $$props) {
	$.push($$props, true);
	$$props.oncustom();
	$.pop();
}