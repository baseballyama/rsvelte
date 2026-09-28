import * as $ from 'svelte/internal/server';
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import Code from "docs/Code.svelte";
import tooltip from "examples/tooltip.txt";

export default function Tooltips($$renderer) {
	Tooltip($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->How are you doing?`);
		},

		$$slots: {
			default: true,
			activator: ($$renderer) => {
				$$renderer.push(`<div slot="activator">`);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Hover me`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Code($$renderer, { code: tooltip });
	$$renderer.push(`<!---->`);
}