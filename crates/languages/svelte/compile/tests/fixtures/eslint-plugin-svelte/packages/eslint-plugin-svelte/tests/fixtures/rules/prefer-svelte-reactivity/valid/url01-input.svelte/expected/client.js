import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Url01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new URL("https://svelte.dev/");

	console.log(variable.hash);
	console.log(variable.host);
	console.log(variable.hostname);
	console.log(variable.href);
	console.log(variable.origin);
	console.log(variable.password);
	console.log(variable.pathname);
	console.log(variable.port);
	console.log(variable.protocol);
	console.log(variable.search);
	console.log(variable.searchParams);
	console.log(variable.username);

	let unused = 30;

	unused = variable.port;
	console.log(URL.canParse("https://svelte.dev/"));
	objectURL = URL.createObjectURL(new MediaSource());
	console.log(URL.parse("https://svelte.dev/"));
	URL.revokeObjectURL(objectURL);
	console.log(variable.toJSON());
	console.log(variable.toString());
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}