import * as $ from 'svelte/internal/server';

export default function _5_advanced_component_props_input($$renderer, $$props) {
	let { class: classname, $$slots, $$events, ...others } = $$props;

	$$renderer.push(`<pre${$.attr_class($.clsx(classname))}>
	${$.escape(JSON.stringify(others))}
</pre>`);
}