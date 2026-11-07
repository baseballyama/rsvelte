import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';

var root = $.from_html(`<div>DIV</div>`);

export default function Component($$anchor) {
	var div = root();

	$.transition(5, div, () => fade, () => ({ duration: 100 }));
	$.append($$anchor, div);
}