import * as $ from 'svelte/internal/server';

export default function Field($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			label,
			id = label.toLowerCase().replace(' ', '-'),
			required = false,
			children
		} = $$props;

		$$renderer.push(`<div class="svelte-23lrp4"><label${$.attr('for', id)} class="svelte-23lrp4">${$.escape(label)} `);

		if (required) {
			$$renderer.push(`<!--[0--><span class="svelte-23lrp4">*</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></label> `);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}