import * as $ from 'svelte/internal/server';
import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';

export default function _DisabledNonInteractive($$renderer) {
	let disabled = true;
	let nonInteractive = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div style="margin-bottom: 1em;">`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Disable the second panel.`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						get checked() {
							return disabled;
						},

						set checked($$value) {
							disabled = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->No interaction with the third panel.`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						get checked() {
							return nonInteractive;
						},

						set checked($$value) {
							nonInteractive = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <div class="accordion-container">`);

		Accordion($$renderer, {
			multiple: true,
			children: ($$renderer) => {
				Panel($$renderer, {
					children: ($$renderer) => {
						Header($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Normal Panel`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->The content for normal panel.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Panel($$renderer, {
					disabled,
					children: ($$renderer) => {
						Header($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Disabled Panel`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->The content for disabled panel.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Panel($$renderer, {
					nonInteractive,
					children: ($$renderer) => {
						Header($$renderer, {
							ripple: !nonInteractive,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Non-Interactive Panel`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->The content for non-interactive panel.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Panel($$renderer, {
					nonInteractive: true,
					open: true,
					children: ($$renderer) => {
						Header($$renderer, {
							ripple: false,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Non-Interactive Open Panel`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->The content for non-interactive open panel.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}