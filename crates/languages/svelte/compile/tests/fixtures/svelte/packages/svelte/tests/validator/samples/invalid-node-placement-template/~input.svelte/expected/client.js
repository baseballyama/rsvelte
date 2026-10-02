import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<template><tr><td></td><td></td></tr></template>`);

export default function Input($$anchor) {
	var template = root();

	$.append($$anchor, template);
}