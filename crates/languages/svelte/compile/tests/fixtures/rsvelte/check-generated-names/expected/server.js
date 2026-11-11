import * as $ from "svelte/internal/server";
export default function Check_generated_names($$renderer) {
	const Foo = null;
	Foo($$renderer, {
		a: 1,
		children: ($$renderer) => {
			$$renderer.push(`<!---->x`);
		},
		$$slots: { default: true }
	});
	$$renderer.push(`<!----> <div this-is="wrong"></div>`);
}
