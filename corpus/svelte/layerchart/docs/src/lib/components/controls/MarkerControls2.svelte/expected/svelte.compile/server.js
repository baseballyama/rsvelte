import * as $ from 'svelte/internal/server';
import { Field, Switch } from 'svelte-ux';

export default function MarkerControls2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { markerStart = true, markerEnd = true } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[60px_60px] gap-2 mb-2 screenshot-hidden">`);

			Field($$renderer, {
				label: 'Start',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return markerStart;
							},

							set checked($$value) {
								markerStart = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'End',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return markerEnd;
							},

							set checked($$value) {
								markerEnd = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { markerStart, markerEnd });
	});
}