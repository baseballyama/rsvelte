import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	let tortilla = 'Plain';
	let fillings = [];

	$$renderer.push(`<input type="radio"${$.attr('checked', tortilla === 'Plain', true)} value="Plain"/> <input type="radio"${$.attr('checked', tortilla === 'Whole wheat', true)} value="Whole wheat"/> <input type="radio"${$.attr('checked', tortilla === 'Spinach', true)} value="Spinach"/> <input type="checkbox"${$.attr('checked', fillings.includes('Rice'), true)} value="Rice"/> <input type="checkbox"${$.attr('checked', fillings.includes('Beans'), true)} value="Beans"/> <input type="checkbox"${$.attr('checked', fillings.includes('Cheese'), true)} value="Cheese"/> <input type="checkbox"${$.attr('checked', fillings.includes('Guac (extra)'), true)} value="Guac (extra)"/>`);
}