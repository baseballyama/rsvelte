import * as $ from 'svelte/internal/server';

export default function Dependencies($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { dependencyList = [] } = $$props;

		if (dependencyList.length > 0) {
			$$renderer.push(`<!--[0--><div class="dependencies-section svelte-1c2tki4"><h2 class="demo-title-extra">Dependencies</h2> <div class="demo-details svelte-1c2tki4"><!--[-->`);

			const each_array = $.ensure_array_like(dependencyList);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let dependency = each_array[$$index];

				$$renderer.push(`<span class="svelte-1c2tki4">${$.escape(dependency)}</span>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}