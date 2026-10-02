import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from '.';
import { A, B, C } from '.';

var root = $.from_html(`<template lang="pug"> </template>`);

export default function Input($$anchor) {
	const a = true;
	var template = root();

	$.hydrate_template(template);

	var text = $.child(template.content);

	$.reset(template);

	$.template_effect(
		($0) => $.set_text(text, `+if('typeof a === "number"')
  A(a='${$0 ?? ''}')`),
		[() => a.toFixed(2)]
	);

	$.append($$anchor, template);
}