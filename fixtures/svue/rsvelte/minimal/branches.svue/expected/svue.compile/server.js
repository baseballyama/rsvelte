import * as $ from 'svelte/internal/server';

export default function Branches_svue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { user, items = [] } = $$props;
		let open = false;

		$$renderer.push(`<section class="card"${$.attr('title', user?.name)}>`);

		if (user) {
			$$renderer.push(`<!--[0--><h2>Hello ${$.escape(user.name)}</h2>`);
		} else if (items.length > 0) {
			$$renderer.push(`<!--[1--><h2>${$.escape(items.length)} items &amp; more</h2>`);
		} else {
			$$renderer.push(`<!--[-1--><h2>Nobody</h2>`);
		}

		$$renderer.push(`<!--]--> <button>toggle</button> `);

		if (open) {
			$$renderer.push(`<!--[0--><p>open</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></section>`);
	});
}