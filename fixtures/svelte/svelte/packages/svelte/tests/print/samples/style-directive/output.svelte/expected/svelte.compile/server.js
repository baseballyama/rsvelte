import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	$$renderer.push(`<div${$.attr_style('', { color: 'red' })}>...</div> <div${$.attr_style('', {
		color,
		width: '12rem',
		'background-color': darkMode ? 'black' : 'white'
	})}>...</div>`);
}