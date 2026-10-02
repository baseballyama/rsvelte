import * as $ from 'svelte/internal/server';

export default function Directive_style_with_expr_input($$renderer) {
	$$renderer.push(`<div${$.attr_style('', { 'number.epsilon': Number.EPSILON })}>A</div> <div${$.attr_style('', { 'number(2)': Number(2) })}>A</div>`);
}