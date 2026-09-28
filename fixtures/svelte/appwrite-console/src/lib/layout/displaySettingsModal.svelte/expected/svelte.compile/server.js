import * as $ from 'svelte/internal/server';
import { Confirm, ViewToggle } from '$lib/components';
import ColumnSelector from '$lib/components/columnSelector.svelte';
import { IconViewBoards } from '@appwrite.io/pink-icons-svelte';
import { Button, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

export default function DisplaySettingsModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			show = false,
			hideView = false,
			view = void 0,
			columns,
			hideColumns = false,
			isCustomTable = false
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Confirm($$renderer, {
				title: 'Adjustments',
				canDelete: false,
				get open() {
					return show;
				},

				set open($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							children: ($$renderer) => {
								if (!hideView) {
									$$renderer.push('<!--[0-->');

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'xs',
											children: ($$renderer) => {
												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Layout`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												ViewToggle($$renderer, {
													get view() {
														return view;
													},

													set view($$value) {
														view = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (!hideColumns && $.store_get($$store_subs ??= {}, '$columns', columns)?.length) {
									$$renderer.push('<!--[0-->');

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'xs',
											children: ($$renderer) => {
												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Columns`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												{
													function children($$renderer, toggle, selectedColumnsNumber) {
														if (Button.Button) {
															$$renderer.push('<!--[-->');

															Button.Button($$renderer, {
																size: 's',
																variant: 'secondary',
																badge: selectedColumnsNumber.toString(),
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Columns`);
																},

																$$slots: {
																	default: true,
																	start: ($$renderer) => {
																		Icon($$renderer, { slot: 'start', icon: IconViewBoards });
																	}
																}
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													ColumnSelector($$renderer, {
														ui: 'new',
														columns,
														isCustomTable,
														children,
														$$slots: { default: true }
													});
												}

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { show, view });
	});
}