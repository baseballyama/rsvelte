import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!doctype html=""/> <html><head><meta charset="utf-8"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>Svelte App</title></head> <body><div>Hello World</div></body></html>`, 1);

export default function Output($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}