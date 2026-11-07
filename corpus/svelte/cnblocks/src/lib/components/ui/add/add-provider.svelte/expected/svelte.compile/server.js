import * as $ from 'svelte/internal/server';
import { useAddProvider } from "./add.svelte.js";
import { box } from "svelte-toolbelt";

export default function Add_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { agent = void 0, registry = void 0, registryOptions, children } = $$props;

		useAddProvider({
			registryOptions: box.with(() => registryOptions),
			registry: box.with(() => registry, (v) => registry = v),
			agent: box.with(() => agent, (v) => agent = v)
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { agent, registry });
	});
}