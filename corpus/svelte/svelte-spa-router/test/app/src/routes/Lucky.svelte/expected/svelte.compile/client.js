import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<h1 id="lucky">You're in!</h1> <p>This route has a pre-condition that stops it from loading 50% of the time. So, you were lucky
    you could load this route! Now, try refreshing the page.</p>`,
	1
);

export default function Lucky($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}