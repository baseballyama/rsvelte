import * as $ from 'svelte/internal/server';
import { IsMounted } from "runed";
import { DemoContainer } from "@svecodocs/kit";

export default function Is_mounted($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const isMounted = new IsMounted();

		DemoContainer($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<p>Mounted: <b>${$.escape(isMounted.current ? "true" : "false")}</b></p>`);
			},
			$$slots: { default: true }
		});
	});
}