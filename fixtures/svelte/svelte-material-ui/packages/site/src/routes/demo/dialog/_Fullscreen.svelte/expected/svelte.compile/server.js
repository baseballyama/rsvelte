import * as $ from 'svelte/internal/server';
import Dialog, { Header, Title, CloseTooltipWrapper, Content, Actions } from '@smui/dialog';
import IconButton, { Icon } from '@smui/icon-button';
import Button, { Label } from '@smui/button';
import LoremIpsum from '$lib/LoremIpsum.svelte';

export default function _Fullscreen($$renderer) {
	let open = false;
	let response = 'Nothing yet.';

	function closeHandler(e) {
		switch (e.detail.action) {
			case 'close':
				response = 'Closed without response.';
				break;

			case 'reject':
				response = 'Rejected.';
				break;

			case 'accept':
				response = 'Accepted.';
				break;
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Dialog($$renderer, {
			fullscreen: true,
			'aria-labelledby': 'fullscreen-title',
			'aria-describedby': 'fullscreen-content',
			onSMUIDialogClosed: closeHandler,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Header($$renderer, {
					children: ($$renderer) => {
						Title($$renderer, {
							id: 'fullscreen-title',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Terms and Conditions`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

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

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					id: 'fullscreen-content',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(Array(3));

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
							action: 'reject',
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Reject`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							action: 'accept',
							defaultAction: true,
							children: ($$renderer) => {
								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Accept`);
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

		$$renderer.push(`<!----> <pre class="status">Response: ${$.escape(response)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}