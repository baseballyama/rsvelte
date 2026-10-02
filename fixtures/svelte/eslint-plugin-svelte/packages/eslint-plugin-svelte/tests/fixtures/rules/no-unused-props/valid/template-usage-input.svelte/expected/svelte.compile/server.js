import * as $ from 'svelte/internal/server';

export default function Template_usage_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		$$renderer.push(`<h1>${$.escape(props.title)}</h1> <p>${$.escape(props.description)}</p> <ul><!--[-->`);

		const each_array = $.ensure_array_like(props.items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<li>${$.escape(item)}</li>`);
		}

		$$renderer.push(`<!--]--></ul>`);
	});
}