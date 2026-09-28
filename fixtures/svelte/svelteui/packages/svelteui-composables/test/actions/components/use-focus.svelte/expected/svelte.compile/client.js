import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { focus } from '$clib/actions/use-focus/use-focus';

var root = $.from_html(`<input id="focus"/>`);

export default function Use_focus($$anchor) {
	var input = root();

	$.action(input, ($$node) => focus?.($$node));
	$.append($$anchor, input);
}