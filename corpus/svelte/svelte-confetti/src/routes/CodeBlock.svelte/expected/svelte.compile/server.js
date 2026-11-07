import * as $ from 'svelte/internal/server';

export default function CodeBlock($$renderer, $$props) {
	let { svelte4, svelte5 } = $$props;
	const tabs = ["Svelte 4", "Svelte 5"];
	let currentTab = "Svelte 5";

	if (svelte4 && svelte5) {
		$$renderer.push(`<!--[0--><strong class="tabs svelte-1yb6ciw"><!--[-->`);

		const each_array = $.ensure_array_like(tabs);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tab = each_array[$$index];

			$$renderer.push(`<button${$.attr_class('tab svelte-1yb6ciw', void 0, { 'active': currentTab === tab })}>${$.escape(tab)}</button>`);
		}

		$$renderer.push(`<!--]--></strong>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <p><code${$.attr_class('well svelte-1yb6ciw', void 0, { 'has-tabs': svelte4 && svelte5 })}>`);

	if (currentTab === "Svelte 4") {
		$$renderer.push('<!--[0-->');
		svelte4?.($$renderer);
		$$renderer.push(`<!---->`);
	} else if (currentTab === "Svelte 5") {
		$$renderer.push('<!--[1-->');
		svelte5?.($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></code></p>`);
}