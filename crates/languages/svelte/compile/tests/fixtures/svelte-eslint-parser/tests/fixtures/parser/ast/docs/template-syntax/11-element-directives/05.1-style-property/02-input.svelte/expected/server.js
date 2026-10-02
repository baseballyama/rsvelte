import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	$$renderer.push(`<div${$.attr_style('', { color: 'red' })}>...</div> <div style="color: red;">...</div> <div${$.attr_style('', { color: myColor })}>...</div> <div${$.attr_style('', { color })}>...</div> <div${$.attr_style('', {
		color,
		width: '12rem',
		'background-color': darkMode ? "black" : "white"
	})}>...</div>`);
}