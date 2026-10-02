import * as $ from 'svelte/internal/server';

export default function Fieldset($$renderer, $$props) {
	let { align = 'left', legend = undefined, nowrap = false, children } = $$props;

	$$renderer.push(`<fieldset${$.attr_class($.clsx(align), 'svelte-19pj2h0', { 'nowrap': nowrap })}>`);

	if (legend) {
		$$renderer.push(`<!--[0--><legend class="svelte-19pj2h0">${$.escape(legend)}</legend>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);
	children?.($$renderer);
	$$renderer.push(`<!----></fieldset>`);
}