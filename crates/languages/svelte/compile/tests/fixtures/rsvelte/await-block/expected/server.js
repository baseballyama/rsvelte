import * as $ from "svelte/internal/server";
export default function Await_block($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { load, other } = $$props;
		let count = 0;
		$.await($$renderer, load(count), () => {
			$$renderer.push(`<p>loading 0</p>`);
		}, (value) => {
			$$renderer.push(`<p>${$.escape(value)}</p>`);
		});
		$$renderer.push(`<!--]--> `);
		$.await($$renderer, other, () => {}, ({ name, size = 1 }) => {
			$$renderer.push(`<b>${$.escape(name)} ${$.escape(size)}</b>`);
		});
		$$renderer.push(`<!--]--> `);
		$.await($$renderer, other, () => {}, () => {});
		$$renderer.push(`<!--]--> <div>`);
		$.await($$renderer, other, () => {
			$$renderer.push(`<span>wait</span>`);
		}, () => {});
		$$renderer.push(`<!--]--></div>`);
	});
}
