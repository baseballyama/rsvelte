import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<template shadowrootmode="open"><p><slot></slot></p></template> <template><p><!></p></template> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var template = $.sibling($.first_child(fragment), 2);

	$.hydrate_template(template);

	var p = $.child(template.content);
	var node = $.child(p);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(p);
	$.reset(template);

	var node_1 = $.sibling(template, 2);

	$.slot(node_1, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}