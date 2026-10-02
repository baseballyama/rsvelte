import * as $ from 'svelte/internal/server';

export default function Youtube($$renderer, $$props) {
	let { id, title } = $$props;

	$$renderer.push(`<div><lite-youtube${$.attr('videoid', id)}${$.attr('playlabel', title)}></lite-youtube></div>`);
}