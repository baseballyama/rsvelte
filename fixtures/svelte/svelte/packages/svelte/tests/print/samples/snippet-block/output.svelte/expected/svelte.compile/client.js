import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const name = ($$anchor, param1 = $.noop, param2 = $.noop, paramN = $.noop) => {
	$.next();

	var text = $.text('Foo');

	$.append($$anchor, text);
};

export default function Output($$anchor) {}