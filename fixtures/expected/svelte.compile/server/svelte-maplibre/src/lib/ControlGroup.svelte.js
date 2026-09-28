import * as $ from 'svelte/internal/server';

export default function ControlGroup($$renderer, $$props) {
	let { class: classNames = '', children } = $$props;

	$$renderer.push(`<div${$.attr_class(`maplibregl-ctrl-group ${$.stringify(classNames)}`)}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}