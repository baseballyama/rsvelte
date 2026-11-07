import * as $ from 'svelte/internal/server';
import Menu from '@smui/menu';
import { Anchor } from '@smui/menu-surface';
import List, { Item, Separator, Text, PrimaryText, SecondaryText } from '@smui/list';
import Button, { Label } from '@smui/button';

export default function _TwoLineManunalAnchor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let menu;
		let anchor = void 0;
		let anchorClasses = {};
		let clicked = 'nothing yet';

		$$renderer.push(`<div${$.attr_class($.clsx(Object.keys(anchorClasses).join(' ')))}>`);

		Button($$renderer, {
			onclick: () => menu.setOpen(true),
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Menu`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Menu($$renderer, {
			anchor: false,
			anchorElement: anchor,
			anchorCorner: 'BOTTOM_LEFT',
			children: ($$renderer) => {
				List($$renderer, {
					twoLine: true,
					children: ($$renderer) => {
						Item($$renderer, {
							onSMUIAction: () => clicked = 'Cut',
							children: ($$renderer) => {
								Text($$renderer, {
									children: ($$renderer) => {
										PrimaryText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cut`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										SecondaryText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Copy to clipboard and remove.`);
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

						$$renderer.push(`<!----> `);

						Item($$renderer, {
							onSMUIAction: () => clicked = 'Copy',
							children: ($$renderer) => {
								Text($$renderer, {
									children: ($$renderer) => {
										PrimaryText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Copy`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										SecondaryText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Copy to clipboard.`);
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

						$$renderer.push(`<!----> `);

						Item($$renderer, {
							onSMUIAction: () => clicked = 'Paste',
							children: ($$renderer) => {
								Text($$renderer, {
									children: ($$renderer) => {
										PrimaryText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Paste`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										SecondaryText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Paste from clipboard.`);
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

						$$renderer.push(`<!----> `);
						Separator($$renderer, {});
						$$renderer.push(`<!----> `);

						Item($$renderer, {
							onSMUIAction: () => clicked = 'Delete',
							children: ($$renderer) => {
								Text($$renderer, {
									children: ($$renderer) => {
										PrimaryText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Delete`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										SecondaryText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Remove item.`);
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

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
	});
}