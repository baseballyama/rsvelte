import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div aria-sort=""></div> <div aria-sort="incorrect"></div> <div aria-sort="true"></div> <div${$.attr('aria-sort', true)}></div> <div aria-sort="false"></div> <div aria-sort="ascending descending"></div>`);
}