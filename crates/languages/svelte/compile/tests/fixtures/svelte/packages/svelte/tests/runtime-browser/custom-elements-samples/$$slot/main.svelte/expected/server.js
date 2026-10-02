import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$renderer.component(($$renderer) => {
		let data = "";

		if ($$slots.b) {
			data = "foo";
		}

		function getData() {
			return data;
		}

		function toString(data) {
			const result = {};
			const sortedKeys = Object.keys(data).sort();

			sortedKeys.forEach((key) => result[key] = data[key] ? true : false);

			return JSON.stringify(result);
		}

		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--> <!--[-->`);
		$.slot($$renderer, $$props, 'a', {}, null);
		$$renderer.push(`<!--]--> <p>$$slots: ${$.escape(toString($$slots))}</p> `);

		if ($$slots.b) {
			$$renderer.push(`<!--[0--><div><!--[-->`);
			$.slot($$renderer, $$props, 'b', {}, null);
			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><p>Slot b is not available</p>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { getData });
	});
}