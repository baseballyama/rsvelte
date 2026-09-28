import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<script-foo>foo</script-foo> <style-foo>foo</style-foo>`, 3);

export default function Output($$anchor) {
	var fragment = root();
	var script_foo = $.first_child(fragment);
	var style_foo = $.sibling(script_foo, 2);

	$.append($$anchor, fragment);
}