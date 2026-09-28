import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			label = '',
			type = 'text',
			value = '',
			id,
			$$slots,
			$$events,
			...rest
		} = $$props;

		function typeAction(node) {
			node.type = type;
		}

		$$renderer.push(`<div class="input svelte-1r1hugr">`);

		if (label) {
			$$renderer.push(`<!--[0--><label${$.attr('for', id)} class="svelte-1r1hugr">${$.escape(label)}</label>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <input${$.attributes({ ...rest, value, id, name: id }, 'svelte-1r1hugr', void 0, void 0, 4)}/></div>`);
		$.bind_props($$props, { value });
	});
}