import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let tortilla = 'Plain';
	let fillings = ['Cheese'];

	$$renderer.push(`<div>${$.escape(fillings.toString())}</div> <input type="radio"${$.attr('checked', tortilla === 'Plain', true)} value="Plain"/> <input type="radio"${$.attr('checked', tortilla === 'Whole wheat', true)} value="Whole wheat"/> <input type="checkbox"${$.attr('checked', fillings.includes('Beans'), true)} value="Beans"/> <input type="checkbox"${$.attr('checked', fillings.includes('Cheese'), true)} value="Cheese"/>`);
}