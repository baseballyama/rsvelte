import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<template lang="pug"></template>`);

export default function Pug01_input($$anchor, $$props) {
	$.push($$props, true);

	const hello = 'world';
	var $$exports = { hello };
	var template = root();

	template.textContent = `div Posts +each('posts as post')
    a(href="${post.url ?? ''}") ${post.title ?? ''}`;

	$.append($$anchor, template);

	return $.pop($$exports);
}