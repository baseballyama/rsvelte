import * as $ from 'svelte/internal/server';

export default function Pug01_input($$renderer, $$props) {
	const hello = 'world';

	$$renderer.push(`<template lang="pug">div Posts +each('posts as post')
    a(href="${$.escape(post.url)}") ${$.escape(post.title)}</template>`);

	$.bind_props($$props, { hello });
}