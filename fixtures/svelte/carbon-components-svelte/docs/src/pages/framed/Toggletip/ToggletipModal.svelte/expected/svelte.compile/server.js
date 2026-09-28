import * as $ from 'svelte/internal/server';

import {
	Button,
	Link,
	Modal,
	Portal,
	Stack,
	Toggletip,
	ToggletipFooter
} from "carbon-components-svelte";

export default function ToggletipModal($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Portal($$renderer, {
			children: ($$renderer) => {
				Modal($$renderer, {
					passiveModal: true,
					modalHeading: 'Toggletip in modal',
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Stack($$renderer, {
							orientation: 'horizontal',
							align: 'center',
							gap: 3,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Resource list `);

								Toggletip($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Resources are provisioned based on your account's organization. `);

										ToggletipFooter($$renderer, {
											children: ($$renderer) => {
												Link($$renderer, {
													href: '#',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Learn more`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													size: 'small',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Manage`);
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

								$$renderer.push(`<!---->`);
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}