import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<template id="t"><b>t</b> </template> <template><b></b></template> <div><template><i>static</i></template></div>`, 1);
export default function Template_element($$anchor) {
	let x = 1;
	var fragment = root();
	var template = $.first_child(fragment);
	$.hydrate_template(template);
	var text = $.sibling($.child(template.content), 1, true);
	text.nodeValue = "1";
	$.reset(template);
	var template_1 = $.sibling(template, 2);
	$.hydrate_template(template_1);
	var b = $.child(template_1.content);
	b.textContent = "1";
	$.reset(template_1);
	$.next(2);
	$.append($$anchor, fragment);
}
