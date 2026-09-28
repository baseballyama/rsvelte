import * as $ from 'svelte/internal/server';

export default function UserOption($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$$renderer.push(`<div class="item svelte-vd97sx"><div class="avatar svelte-vd97sx"><div class="user-avatar svelte-vd97sx">`);

		if (data.avatar) {
			$$renderer.push(`<!--[0--><img class="user-photo svelte-vd97sx" alt=""${$.attr('src', data.avatar)}/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div><div class="name svelte-vd97sx">${$.escape(data.label)}</div> <div class="mail svelte-vd97sx">${$.escape(data.email || "")}</div></div></div>`);
	});
}