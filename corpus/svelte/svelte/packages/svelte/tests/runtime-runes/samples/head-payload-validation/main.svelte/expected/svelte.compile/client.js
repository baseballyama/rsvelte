import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const head = ($$anchor) => {
	var title = root();

	$.append($$anchor, title);
};

var root = $.from_html(`<title>Cool</title>`);

export default function Main($$anchor) {
	$.head('1hoxzs8', ($$anchor) => {
		head($$anchor);
	});
}