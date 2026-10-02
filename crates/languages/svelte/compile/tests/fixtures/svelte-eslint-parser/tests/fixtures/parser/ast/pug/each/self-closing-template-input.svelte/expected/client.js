import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<template src="./fixtures/template.pug"></template>`);

export default function Self_closing_template_input($$anchor) {
	console.log('foo');

	var template = root();

	$.append($$anchor, template);
}