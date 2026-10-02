import * as $ from 'svelte/internal/server';

export default function Complex_test01_output($$renderer) {
	$$renderer.push(`<div${$.attr_style('', { color: `${$.stringify(r)}e${$.stringify(d)}` })}>...</div>`);
}