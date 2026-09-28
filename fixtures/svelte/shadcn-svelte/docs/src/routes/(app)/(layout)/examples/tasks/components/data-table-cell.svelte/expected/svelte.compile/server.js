import * as $ from 'svelte/internal/server';

export default function Data_table_cell($$renderer, $$props) {
	let { children, $$slots, $$events, ...restProps } = $$props;

	$$renderer.push(`<div${$.attributes({ ...restProps })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}