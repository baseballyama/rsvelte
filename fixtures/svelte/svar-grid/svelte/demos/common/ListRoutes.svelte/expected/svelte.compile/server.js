import * as $ from 'svelte/internal/server';

export default function ListRoutes($$renderer, $$props) {
	let { routes } = $$props;

	$$renderer.push(`<code><pre class="svelte-67utvj"><!--[-->`);

	const each_array = $.ensure_array_like(routes);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let route = each_array[$$index];

		$$renderer.push(`<!---->
			${$.escape('"' + route + '",\n')}
		`);
	}

	$$renderer.push(`<!--]-->
</pre></code>`);
}