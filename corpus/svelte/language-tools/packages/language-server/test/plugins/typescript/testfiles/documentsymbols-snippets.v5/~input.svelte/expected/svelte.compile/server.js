import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const value = true;
	const items = [1, 2, 3];

	$$renderer.push(`<!---->${$.escape(items.map((item) => item))} <!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		const getter = () => item;

		$$renderer.push(`<!---->${$.escape(getter())}`);
	}

	$$renderer.push(`<!--]--> `);

	{
		function children($$renderer) {
			Child($$renderer, { value });
		}

		Component($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function children($$renderer, { data }) {
			Child($$renderer, { data });
		}

		Component($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!---->`);
}