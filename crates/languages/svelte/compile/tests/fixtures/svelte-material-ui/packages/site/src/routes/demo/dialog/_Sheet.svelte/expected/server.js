import * as $ from 'svelte/internal/server';
import Dialog, { CloseTooltipWrapper, Content } from '@smui/dialog';
import IconButton, { Icon } from '@smui/icon-button';
import Button, { Label } from '@smui/button';
import LoremIpsum from '$lib/LoremIpsum.svelte';

export default function _Sheet($$renderer) {
	let open = false;
	let openNoPadding = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Dialog($$renderer, {
			sheet: true,
			'aria-describedby': 'sheet-content',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				CloseTooltipWrapper($$renderer, {
					children: ($$renderer) => {
						IconButton($$renderer, {
							action: 'close',
							children: ($$renderer) => {
								Icon($$renderer, {
									class: 'material-icons',
									children: ($$renderer) => {
										$$renderer.push(`<!---->close`);
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

				Content($$renderer, {
					id: 'sheet-content',
					children: ($$renderer) => {
						LoremIpsum($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Dialog($$renderer, {
			noContentPadding: true,
			sheet: true,
			'aria-describedby': 'sheet-no-padding-content',
			get open() {
				return openNoPadding;
			},

			set open($$value) {
				openNoPadding = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				CloseTooltipWrapper($$renderer, {
					children: ($$renderer) => {
						IconButton($$renderer, {
							action: 'close',
							children: ($$renderer) => {
								Icon($$renderer, {
									class: 'material-icons',
									children: ($$renderer) => {
										$$renderer.push(`<!---->close`);
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

				Content($$renderer, {
					id: 'sheet-no-padding-content',
					children: ($$renderer) => {
						LoremIpsum($$renderer, {});
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

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => openNoPadding = true,
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open No Padding Dialog`);
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