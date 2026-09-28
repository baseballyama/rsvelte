import * as $ from 'svelte/internal/server';
import { onMount, onDestroy } from 'svelte';
import LinearProgress from '@smui/linear-progress';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import Button from '@smui/button';

export default function _Simple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let progress = 0;
		let closed = false;
		let timer;

		onMount(reset);

		onDestroy(() => {
			clearInterval(timer);
		});

		function reset() {
			progress = 0;
			closed = false;
			clearInterval(timer);

			timer = setInterval(
				() => {
					progress += 0.01;

					if (progress >= 1) {
						progress = 1;
						closed = true;
						clearInterval(timer);
					}
				},
				100
			);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			LinearProgress($$renderer, { progress, closed });
			$$renderer.push(`<!----> <br/> `);

			Button($$renderer, {
				onclick: reset,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Reset`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function label($$renderer) {
					$$renderer.push(`<!---->Closed`);
				}

				FormField($$renderer, {
					label,
					children: ($$renderer) => {
						Checkbox($$renderer, {
							get checked() {
								return closed;
							},

							set checked($$value) {
								closed = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { label: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}