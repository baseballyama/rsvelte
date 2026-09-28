import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div aria-relevant=""></div> <div aria-relevant="foobar"></div> <div aria-relevant="true"></div> <div${$.attr('aria-relevant', true)}></div> <div aria-relevant="false"></div> <div aria-relevant="additions removals_"></div> <div aria-relevant="additions removals_ "></div>`);
}