import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, Portal } from "carbon-components-svelte";

export default function MultiplePortals($$renderer) {
	let showPortal1 = false;
	let showPortal2 = false;

	ButtonSet($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(showPortal1 ? "Unmount portal 1" : "Mount portal 1")}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(showPortal2 ? "Unmount portal 2" : "Mount portal 2")}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (showPortal1) {
		$$renderer.push('<!--[0-->');

		Portal($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Portal content 1`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (showPortal2) {
		$$renderer.push('<!--[0-->');

		Portal($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Portal content 2`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}