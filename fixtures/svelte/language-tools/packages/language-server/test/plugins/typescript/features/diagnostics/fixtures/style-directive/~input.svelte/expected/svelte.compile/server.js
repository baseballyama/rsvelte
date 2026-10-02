import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let right = 'string';
	let wrong = true;

	$$renderer.push(`<div${$.attr_style('', { right })}></div> <div${$.attr_style('', { right })}></div> <div${$.attr_style('', { right: 12 })}></div> <div${$.attr_style('', { right: 'right' })}></div> <div${$.attr_style('', { right: `right${right}` })}></div> <div${$.attr_style('', { right: 'rightstring' })}></div> <div${$.attr_style('', { undefined })}></div> <div${$.attr_style('', { null: null })}></div> <div${$.attr_style('', { wrong })}></div> <div${$.attr_style('', { wrong })}></div>`);
}