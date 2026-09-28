import * as $ from 'svelte/internal/server';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Button, { Label } from '@smui/button';
import LoremIpsum from '$lib/LoremIpsum.svelte';

export default function _LargeScroll($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Dialog($$renderer, {
			'aria-labelledby': 'large-scroll-title',
			'aria-describedby': 'large-scroll-content',
			surface$style: 'width: 850px; max-width: calc(100vw - 32px);',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Title($$renderer, {
					id: 'large-scroll-title',
					children: ($$renderer) => {
						$$renderer.push(`<!---->A Brief Selection of Placeholder Text`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					id: 'large-scroll-content',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(Array(10));

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let _item = each_array[$$index];

							LoremIpsum($$renderer, {});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Actions($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							action: 'accept',
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Done`);
									},
									$$slots: { default: true }
								});
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

		Button($$renderer, {
			onclick: () => open = true,
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Dialog`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}