import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form, params } = $$props;
		let comment = '';
		const snapshot = { capture: () => comment, restore: (value) => comment = value };

		$$renderer.push(`<!---->${$.escape(data)}, ${$.escape(errors)} `);

		if (form?.success) {
			$$renderer.push(`<!--[0--><p>Successfully logged in! Welcome back, ${$.escape(data.user.name)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <form method="POST"><textarea>`);

		const $$body = $.escape(comment);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <button>Post comment</button></form>`);
		$.bind_props($$props, { snapshot });
	});
}