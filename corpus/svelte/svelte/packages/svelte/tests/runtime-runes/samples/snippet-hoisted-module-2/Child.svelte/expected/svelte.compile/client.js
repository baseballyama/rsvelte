import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const one = ($$anchor) => {
	two($$anchor);
};

const two = ($$anchor) => {
	$.next();

	var text = $.text();

	text.nodeValue = 'hello';
	$.append($$anchor, text);
};

const message = 'hello';

export { one };

export default function Child($$anchor) {}