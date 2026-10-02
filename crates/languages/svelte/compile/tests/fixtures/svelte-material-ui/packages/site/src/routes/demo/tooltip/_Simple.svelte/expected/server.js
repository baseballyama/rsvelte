import * as $ from 'svelte/internal/server';
import Tooltip, { Wrapper } from '@smui/tooltip';
import Button from '@smui/button';
import Fab from '@smui/fab';
import Checkbox from '@smui/checkbox';
import Radio from '@smui/radio';
import { Label, Icon } from '@smui/common';

export default function _Simple($$renderer) {
	let clicked = 0;
	let checked = false;
	let selected = 'on';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="container svelte-1asciut" style="display: flex; flex-wrap: wrap; align-items: center;">`);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					onclick: () => clicked++,
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Button`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tooltip on a button.`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Fab($$renderer, {
					onclick: () => clicked++,
					mini: true,
					children: ($$renderer) => {
						Icon($$renderer, {
							class: 'material-icons',
							children: ($$renderer) => {
								$$renderer.push(`<!---->favorite`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					unbounded: true,
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tooltip on a FAB.`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Checkbox($$renderer, {
					get checked() {
						return checked;
					},

					set checked($$value) {
						checked = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tooltip on a checkbox.`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Radio($$renderer, {
					value: 'on',
					get group() {
						return selected;
					},

					set group($$value) {
						selected = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tooltip on a radio button.`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Radio($$renderer, {
					value: 'off',
					get group() {
						return selected;
					},

					set group($$value) {
						selected = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tooltip on another radio button.`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<span tabindex="0" role="button">I'm a span element.</span> `);

				Tooltip($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tooltip on a span.`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div style="background-color: var(--mdc-theme-secondary); color: var(--mdc-theme-on-secondary); padding: 10px;" tabindex="0" role="button">I'm a div element.</div> `);

				Tooltip($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tooltip on a div.`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Clicked: ${$.escape(clicked)}, Checked: ${$.escape(checked)}, Selected: ${$.escape(selected)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}