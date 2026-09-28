import * as $ from 'svelte/internal/server';
import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
import BedDoubleIcon from '@lucide/svelte/icons/bed-double';
import BikeIcon from '@lucide/svelte/icons/bike';
import BookIcon from '@lucide/svelte/icons/book';
import BubblesIcon from '@lucide/svelte/icons/bubbles';
import HouseIcon from '@lucide/svelte/icons/house';
import MountainIcon from '@lucide/svelte/icons/mountain';
import PopcornIcon from '@lucide/svelte/icons/popcorn';
import SailboatIcon from '@lucide/svelte/icons/sailboat';
import SettingsIcon from '@lucide/svelte/icons/settings';
import SkullIcon from '@lucide/svelte/icons/skull';
import TreePalmIcon from '@lucide/svelte/icons/tree-palm';
import TvIcon from '@lucide/svelte/icons/tv';
import { Navigation } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	const links = [
		{ label: 'Home', href: '#', icon: HouseIcon },
		{ label: 'Entertainment', href: '#', icon: BookIcon },
		{ label: 'Recreation', href: '#', icon: BikeIcon },
		{ label: 'Relaxation', href: '#', icon: TreePalmIcon }
	];

	const linksSidebar = {
		entertainment: [
			{ label: 'Books', href: '#', icon: BookIcon },
			{ label: 'Movies', href: '#', icon: PopcornIcon },
			{ label: 'Television', href: '#', icon: TvIcon }
		],
		recreation: [
			{ label: 'Biking', href: '#', icon: BikeIcon },
			{ label: 'Sailing', href: '#', icon: SailboatIcon },
			{ label: 'Hiking', href: '#', icon: MountainIcon }
		],
		relaxation: [
			{ label: 'Lounge', href: '#', icon: TreePalmIcon },
			{ label: 'Spa', href: '#', icon: BubblesIcon },
			{ label: 'Sleep', href: '#', icon: BedDoubleIcon }
		]
	};

	let layoutRail = true;

	function toggleLayout() {
		layoutRail = !layoutRail;
	}

	$$renderer.push(`<div class="space-y-10"><header><h2 class="h2">Navigation</h2></header> <section class="space-y-4"><h3 class="h3">Bar</h3> <div class="w-[375px] h-[667px] grid grid-rows-[1fr_auto] border border-surface-200-800"><div class="flex justify-center items-center"><p>Contents</p></div> `);

	Navigation($$renderer, {
		layout: 'bar',
		children: ($$renderer) => {
			if (Navigation.Menu) {
				$$renderer.push('<!--[-->');

				Navigation.Menu($$renderer, {
					class: 'grid grid-cols-4 gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(links);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let link = each_array[$$index];
							const Icon = link.icon;

							if (Navigation.TriggerAnchor) {
								$$renderer.push('<!--[-->');

								Navigation.TriggerAnchor($$renderer, {
									class: 'Anchor',
									href: link.href,
									children: ($$renderer) => {
										if (Icon) {
											$$renderer.push('<!--[-->');
											Icon($$renderer, { class: 'size-5' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Navigation.TriggerText) {
											$$renderer.push('<!--[-->');

											Navigation.TriggerText($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(link.label)}`);
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

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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

	$$renderer.push(`<!----></div></section> <section class="space-y-4"><h3 class="h3">Rail</h3> <div class="w-full h-[728px] grid grid-cols-[auto_1fr] border border-surface-200-800">`);

	Navigation($$renderer, {
		layout: 'rail',
		children: ($$renderer) => {
			if (Navigation.Header) {
				$$renderer.push('<!--[-->');

				Navigation.Header($$renderer, {
					children: ($$renderer) => {
						if (Navigation.TriggerAnchor) {
							$$renderer.push('<!--[-->');

							Navigation.TriggerAnchor($$renderer, {
								href: '/',
								title: 'View Homepage',
								'aria-label': 'View Homepage',
								children: ($$renderer) => {
									SkullIcon($$renderer, { class: 'size-8' });
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Navigation.Content) {
				$$renderer.push('<!--[-->');

				Navigation.Content($$renderer, {
					children: ($$renderer) => {
						if (Navigation.Menu) {
							$$renderer.push('<!--[-->');

							Navigation.Menu($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(links);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let link = each_array_1[$$index_1];
										const Icon = link.icon;

										if (Navigation.TriggerAnchor) {
											$$renderer.push('<!--[-->');

											Navigation.TriggerAnchor($$renderer, {
												class: 'Anchor',
												href: link.href,
												children: ($$renderer) => {
													if (Icon) {
														$$renderer.push('<!--[-->');
														Icon($$renderer, { class: 'size-6' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Navigation.TriggerText) {
														$$renderer.push('<!--[-->');

														Navigation.TriggerText($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(link.label)}`);
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

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Navigation.Footer) {
				$$renderer.push('<!--[-->');

				Navigation.Footer($$renderer, {
					children: ($$renderer) => {
						if (Navigation.TriggerAnchor) {
							$$renderer.push('<!--[-->');

							Navigation.TriggerAnchor($$renderer, {
								href: '/',
								title: 'Settings',
								'aria-label': 'Settings',
								children: ($$renderer) => {
									SettingsIcon($$renderer, { class: 'size-6' });
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex justify-center items-center"><p class="opacity-50">Contents</p></div></div></section> <section class="space-y-4"><h3 class="h3">Sidebar</h3> <div class="w-full h-[728px] grid grid-cols-[auto_1fr] items-stretch border border-surface-200-800">`);

	Navigation($$renderer, {
		layout: 'sidebar',
		class: 'grid grid-rows-[auto_1fr_auto] gap-4',
		children: ($$renderer) => {
			if (Navigation.Header) {
				$$renderer.push('<!--[-->');

				Navigation.Header($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<a href="https://www.skeleton.dev" class="btn-icon btn-icon-lg preset-filled-primary-500">`);
						SkullIcon($$renderer, { class: 'size-6' });
						$$renderer.push(`<!----></a>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Navigation.Content) {
				$$renderer.push('<!--[-->');

				Navigation.Content($$renderer, {
					children: ($$renderer) => {
						if (Navigation.Group) {
							$$renderer.push('<!--[-->');

							Navigation.Group($$renderer, {
								children: ($$renderer) => {
									if (Navigation.Menu) {
										$$renderer.push('<!--[-->');

										Navigation.Menu($$renderer, {
											children: ($$renderer) => {
												if (Navigation.TriggerAnchor) {
													$$renderer.push('<!--[-->');

													Navigation.TriggerAnchor($$renderer, {
														href: '/',
														children: ($$renderer) => {
															HouseIcon($$renderer, { class: 'size-4' });
															$$renderer.push(`<!----> `);

															if (Navigation.TriggerText) {
																$$renderer.push('<!--[-->');

																Navigation.TriggerText($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Home`);
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

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
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

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` <!--[-->`);

						const each_array_2 = $.ensure_array_like(Object.entries(linksSidebar));

						for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
							let [category, links] = each_array_2[$$index_3];

							if (Navigation.Group) {
								$$renderer.push('<!--[-->');

								Navigation.Group($$renderer, {
									children: ($$renderer) => {
										if (Navigation.Label) {
											$$renderer.push('<!--[-->');

											Navigation.Label($$renderer, {
												class: 'capitalize pl-2',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(category)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Navigation.Menu) {
											$$renderer.push('<!--[-->');

											Navigation.Menu($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array_3 = $.ensure_array_like(links);

													for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
														let link = each_array_3[$$index_2];
														const Icon = link.icon;

														if (Navigation.TriggerAnchor) {
															$$renderer.push('<!--[-->');

															Navigation.TriggerAnchor($$renderer, {
																href: link.href,
																title: link.label,
																'aria-label': link.label,
																children: ($$renderer) => {
																	if (Icon) {
																		$$renderer.push('<!--[-->');
																		Icon($$renderer, { class: 'size-4' });
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Navigation.TriggerText) {
																		$$renderer.push('<!--[-->');

																		Navigation.TriggerText($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(link.label)}`);
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

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
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

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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

			$$renderer.push(` `);

			if (Navigation.Footer) {
				$$renderer.push('<!--[-->');

				Navigation.Footer($$renderer, {
					children: ($$renderer) => {
						if (Navigation.TriggerAnchor) {
							$$renderer.push('<!--[-->');

							Navigation.TriggerAnchor($$renderer, {
								href: '/',
								title: 'Settings',
								'aria-label': 'Settings',
								children: ($$renderer) => {
									SettingsIcon($$renderer, { class: 'size-4' });
									$$renderer.push(`<!----> `);

									if (Navigation.TriggerText) {
										$$renderer.push('<!--[-->');

										Navigation.TriggerText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
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

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
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

	$$renderer.push(`<!----> <div class="flex justify-center items-center"><p class="opacity-50">Contents</p></div></div></section> <section class="space-y-4"><h3 class="h3">Toggle Layout</h3> <pre class="pre">Layout: ${$.escape(layoutRail ? 'Rail' : 'Sidebar')}</pre> <div class="w-full h-[728px] grid grid-cols-[auto_1fr] items-stretch border border-surface-200-800">`);

	Navigation($$renderer, {
		layout: layoutRail ? 'rail' : 'sidebar',
		class: layoutRail ? '' : 'grid grid-rows-[1fr_auto] gap-4',
		children: ($$renderer) => {
			if (Navigation.Content) {
				$$renderer.push('<!--[-->');

				Navigation.Content($$renderer, {
					children: ($$renderer) => {
						if (Navigation.Menu) {
							$$renderer.push('<!--[-->');

							Navigation.Menu($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_4 = $.ensure_array_like(links);

									for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
										let link = each_array_4[$$index_4];
										const Icon = link.icon;

										if (Navigation.TriggerAnchor) {
											$$renderer.push('<!--[-->');

											Navigation.TriggerAnchor($$renderer, {
												href: link.href,
												children: ($$renderer) => {
													if (Icon) {
														$$renderer.push('<!--[-->');
														Icon($$renderer, { class: layoutRail ? 'size-6' : 'size-4' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Navigation.TriggerText) {
														$$renderer.push('<!--[-->');

														Navigation.TriggerText($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(link.label)}`);
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

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Navigation.Footer) {
				$$renderer.push('<!--[-->');

				Navigation.Footer($$renderer, {
					children: ($$renderer) => {
						if (Navigation.Trigger) {
							$$renderer.push('<!--[-->');

							Navigation.Trigger($$renderer, {
								onclick: toggleLayout,
								children: ($$renderer) => {
									ArrowLeftRightIcon($$renderer, { class: layoutRail ? 'size-6' : 'size-4' });
									$$renderer.push(`<!----> `);

									if (!layoutRail) {
										$$renderer.push(`<!--[0--><span>Resize</span>`);
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex justify-center items-center"><p class="opacity-50">Contents</p></div></div></section></div>`);
}