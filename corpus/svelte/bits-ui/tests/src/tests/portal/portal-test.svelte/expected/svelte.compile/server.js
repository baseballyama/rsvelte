import * as $ from 'svelte/internal/server';
import { Portal } from "bits-ui";

export default function Portal_test($$renderer, $$props) {
	let {
		to,
		disabled,
		includeTargets = true,
		content = "Portal Content"
	} = $$props;

	let customElement = null;
	let documentFragment = null;

	if (typeof document !== "undefined") {
		documentFragment = document.createDocumentFragment();

		const container = document.createElement("div");

		container.setAttribute("data-testid", "fragment-container");
		documentFragment.appendChild(container);
	}

	$$renderer.push(`<div data-testid="main-container">`);

	Portal($$renderer, {
		to,
		disabled,
		children: ($$renderer) => {
			$$renderer.push(`<div data-testid="portal-content"${$.attr('data-content', content)}>${$.escape(content)}</div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (includeTargets) {
		$$renderer.push(`<!--[0--><div data-testid="custom-target"></div> <div id="string-target" data-testid="string-target"></div> <div class="class-target" data-testid="class-target"></div> <div data-testid="fragment-host"></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div> <div data-testid="outside-portal">Outside portal</div>`);
}