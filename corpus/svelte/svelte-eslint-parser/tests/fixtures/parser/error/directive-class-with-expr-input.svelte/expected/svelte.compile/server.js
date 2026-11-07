import * as $ from 'svelte/internal/server';

export default function Directive_class_with_expr_input($$renderer) {
	$$renderer.push(`<div${$.attr_class('', void 0, { 'Number.EPSILON': Number.EPSILON })}>A</div> <div${$.attr_class('', void 0, { 'Number(2)': Number(2) })}>A</div>`);
}