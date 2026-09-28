import * as $ from 'svelte/internal/server';

export default function UserCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row } = $$props;

		$$renderer.push(`<div class="container svelte-1x76k6c"><div class="avatar svelte-1x76k6c"><div class="user-avatar svelte-1x76k6c">`);

		if (row.avatar) {
			$$renderer.push(`<!--[0--><img class="user-photo svelte-1x76k6c" alt=""${$.attr('src', row.avatar)}/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div class="info"><div class="name svelte-1x76k6c">${$.escape(row.lastName)}</div> <div class="mail svelte-1x76k6c">${$.escape(row.email || "")}</div></div></div>`);
	});
}