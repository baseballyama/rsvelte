import * as $ from 'svelte/internal/server';

export default function Style_test_input($$renderer) {
	$$renderer.push(`<div${$.attr_style('color: red;', { width: '32p', height: '32p' })}></div> <div${$.attr_style('color: red;', { height: '32p', width: '32p' })}></div> <div${$.attr_style('color: red;', { height: '32p', width: '32p' })}></div>`);
}