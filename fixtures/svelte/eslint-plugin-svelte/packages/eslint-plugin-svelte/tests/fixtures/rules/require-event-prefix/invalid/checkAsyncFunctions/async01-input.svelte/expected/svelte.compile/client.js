import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Async01_input($$anchor, $$props) {
	$.push($$props, true);
	void $$props.custom();
	$.pop();
}