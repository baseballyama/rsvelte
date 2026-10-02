import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve as alias } from '$app/paths';

var root = $.from_html(`<a>Click me!</a>;`, 1);

export default function Link_resolve_aliased01_input($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var a = $.first_child(fragment);

	$.next();
	$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => alias('/foo/')]);
	$.append($$anchor, fragment);
	$.pop();
}