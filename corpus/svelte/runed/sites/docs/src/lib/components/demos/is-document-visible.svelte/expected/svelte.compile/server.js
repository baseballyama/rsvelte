import * as $ from 'svelte/internal/server';
import { IsDocumentVisible } from "runed";
import { DemoContainer } from "@svecodocs/kit";

export default function Is_document_visible($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const visible = new IsDocumentVisible();

		// Count how many times visibility transitioned from hidden -> visible
		let becameVisibleCount = 0;

		let last = undefined;

		DemoContainer($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<p>Document visible: <b>${$.escape(visible.current ? "true" : "false")}</b></p> <p>Became visible count: <b>${$.escape(becameVisibleCount)}</b></p>`);
			},
			$$slots: { default: true }
		});
	});
}