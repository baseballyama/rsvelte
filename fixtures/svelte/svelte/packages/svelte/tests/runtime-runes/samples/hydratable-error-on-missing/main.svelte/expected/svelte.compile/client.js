import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { hydratable } from "svelte";

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let value;

	if ($$props.environment === 'server') {
		value = 'server';
	} else {
		value = hydratable('environment', () => $$props.environment);
	}

	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `The current environment is: ${value ?? ''}`));
	$.append($$anchor, p);
	$.pop();
}