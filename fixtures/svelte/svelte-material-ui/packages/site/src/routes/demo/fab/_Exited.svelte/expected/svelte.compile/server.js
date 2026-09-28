import * as $ from 'svelte/internal/server';
import Fab, { Icon } from '@smui/fab';
import FormField from '@smui/form-field';
import Checkbox from '@smui/checkbox';

export default function _Exited($$renderer) {
	let clicked = 0;
	let exited = false;
	let exitedPrimary = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flexy"><div class="margins">`);

		Fab($$renderer, {
			onclick: () => clicked++,
			exited,
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

		$$renderer.push(`<!----></div> <div class="margins">`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Exited`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						get checked() {
							return exited;
						},

						set checked($$value) {
							exited = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div></div> <div class="flexy"><div class="margins">`);

		Fab($$renderer, {
			color: 'primary',
			onclick: () => clicked++,
			exited: exitedPrimary,
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

		$$renderer.push(`<!----></div> <div class="margins">`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Exited`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						get checked() {
							return exitedPrimary;
						},

						set checked($$value) {
							exitedPrimary = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div></div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}