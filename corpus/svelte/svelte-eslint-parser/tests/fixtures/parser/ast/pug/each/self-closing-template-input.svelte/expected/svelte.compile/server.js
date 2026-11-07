import * as $ from 'svelte/internal/server';

export default function Self_closing_template_input($$renderer) {
	console.log('foo');
	$$renderer.push(`<template src="./fixtures/template.pug"></template>`);
}