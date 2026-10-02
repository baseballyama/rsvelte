import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const children = ($$anchor) => {
	$.next();

	var text = $.text('Hello');

	$.append($$anchor, text);
};

export default function Standalone_snippet01_input($$anchor) {
	children($$anchor);
}