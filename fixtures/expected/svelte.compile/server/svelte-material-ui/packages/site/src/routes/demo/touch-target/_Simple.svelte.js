import * as $ from 'svelte/internal/server';
import Wrapper from '@smui/touch-target';
import Button from '@smui/button';
import IconButton from '@smui/icon-button';
import Fab from '@smui/fab';
import Chip, { ChipSet, Text } from '@smui/chips';
import Checkbox from '@smui/checkbox';
import Radio from '@smui/radio';
import Switch from '@smui/switch';
import { Label, Icon } from '@smui/common';

export default function _Simple($$renderer) {
	let clicked = 0;
	let checked = false;
	let selected = 'on';
	let switchChecked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div style="display: flex; flex-wrap: wrap; align-items: center;">`);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					onclick: () => clicked++,
					touch: true,
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				IconButton($$renderer, {
					onclick: () => clicked++,
					touch: true,
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Fab($$renderer, {
					onclick: () => clicked++,
					mini: true,
					touch: true,
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				{
					function chip($$renderer, chip) {
						Chip($$renderer, {
							chip,
							onclick: () => clicked++,
							touch: true,
							children: ($$renderer) => {
								Text($$renderer, {
									tabindex: 0,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(chip)}`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					}

					ChipSet($$renderer, {
						chips: ['Chip'],
						style: 'display: inline-flex;',
						chip,
						$$slots: { chip: true }
					});
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Checkbox($$renderer, {
					touch: true,
					get checked() {
						return checked;
					},

					set checked($$value) {
						checked = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Radio($$renderer, {
					value: 'on',
					touch: true,
					get group() {
						return selected;
					},

					set group($$value) {
						selected = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Radio($$renderer, {
					value: 'off',
					touch: true,
					get group() {
						return selected;
					},

					set group($$value) {
						selected = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Wrapper($$renderer, {
			children: ($$renderer) => {
				Switch($$renderer, {
					get checked() {
						return switchChecked;
					},

					set checked($$value) {
						switchChecked = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <pre class="status">Clicked: ${$.escape(clicked)}, Checked: ${$.escape(checked)}, Selected: ${$.escape(selected)}, Switched: ${$.escape(switchChecked)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}