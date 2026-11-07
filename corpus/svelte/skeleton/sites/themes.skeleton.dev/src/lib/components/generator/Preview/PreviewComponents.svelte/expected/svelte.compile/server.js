import * as $ from 'svelte/internal/server';
import * as constants from '$lib/constants/generator';
import { globals } from '$lib/state/generator.svelte';
import ExampleChart from '../ExampleChart/ExampleChart.svelte';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
import CalendarIcon from '@lucide/svelte/icons/calendar';
import CircleUserIcon from '@lucide/svelte/icons/circle-user';
import MenuIcon from '@lucide/svelte/icons/menu';
import SearchIcon from '@lucide/svelte/icons/search';
import SkullIcon from '@lucide/svelte/icons/skull';
import TextAlignCenter from '@lucide/svelte/icons/text-align-center';
import TextAlignEnd from '@lucide/svelte/icons/text-align-end';
import TextAlignJustify from '@lucide/svelte/icons/text-align-justify';
import TextAlignStart from '@lucide/svelte/icons/text-align-start';
import { AppBar, Avatar, SegmentedControl, Switch, Tabs } from '@skeletonlabs/skeleton-svelte';

export default function PreviewComponents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const currentPresets = $.derived(() => constants.previewPresets[globals.activeColor]);

		$$renderer.push(`<div class="space-y-6"><header class="flex justify-between items-end"><h1 class="h1">Theme Generator</h1> <a href="https://www.skeleton.dev/docs/svelte/design/themes" target="_blank" class="btn preset-tonal">View Docs</a></header> <div class="h-3 grid grid-cols-7 gap-1"><div class="bg-primary-500 h-full"></div> <div class="bg-secondary-500 h-full"></div> <div class="bg-tertiary-500 h-full"></div> <div class="bg-success-500 h-full"></div> <div class="bg-warning-500 h-full"></div> <div class="bg-error-500 h-full"></div> <div class="bg-surface-500 h-full"></div></div> <div class="grid grid-cols-1 2xl:grid-cols-3 gap-6"><div class="space-y-6">`);

		Tabs($$renderer, {
			defaultValue: 'planes',
			children: ($$renderer) => {
				if (Tabs.List) {
					$$renderer.push('<!--[-->');

					Tabs.List($$renderer, {
						children: ($$renderer) => {
							if (Tabs.Indicator) {
								$$renderer.push('<!--[-->');
								Tabs.Indicator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tabs.Trigger) {
								$$renderer.push('<!--[-->');

								Tabs.Trigger($$renderer, {
									value: 'planes',
									class: `flex-1 ${$.stringify(currentPresets().hover)}`,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Planes`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tabs.Trigger) {
								$$renderer.push('<!--[-->');

								Tabs.Trigger($$renderer, {
									value: 'trains',
									class: `flex-1 ${$.stringify(currentPresets().hover)}`,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Trains`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tabs.Trigger) {
								$$renderer.push('<!--[-->');

								Tabs.Trigger($$renderer, {
									value: 'automobiles',
									class: `flex-1 ${$.stringify(currentPresets().hover)}`,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Automobiles`);
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

		$$renderer.push(`<!----> <div class="grid grid-cols-5 gap-2">`);

		Avatar($$renderer, {
			children: ($$renderer) => {
				if (Avatar.Image) {
					$$renderer.push('<!--[-->');
					Avatar.Image($$renderer, { src: '/images/male.png', class: 'grayscale' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Avatar($$renderer, {
			children: ($$renderer) => {
				if (Avatar.Fallback) {
					$$renderer.push('<!--[-->');

					Avatar.Fallback($$renderer, {
						class: currentPresets().filled,
						children: ($$renderer) => {
							$$renderer.push(`<!---->SS`);
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

		$$renderer.push(`<!----> `);

		Avatar($$renderer, {
			children: ($$renderer) => {
				if (Avatar.Fallback) {
					$$renderer.push('<!--[-->');

					Avatar.Fallback($$renderer, {
						class: currentPresets().tonal,
						children: ($$renderer) => {
							$$renderer.push(`<!---->KK`);
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

		$$renderer.push(`<!----> `);

		Avatar($$renderer, {
			class: `bg-transparent ${$.stringify(currentPresets().outlined)}`,
			children: ($$renderer) => {
				if (Avatar.Fallback) {
					$$renderer.push('<!--[-->');

					Avatar.Fallback($$renderer, {
						children: ($$renderer) => {
							SkullIcon($$renderer, {});
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

		$$renderer.push(`<!----> `);

		Avatar($$renderer, {
			class: 'bg-transparent preset-outlined-surface-200-800',
			children: ($$renderer) => {
				if (Avatar.Fallback) {
					$$renderer.push('<!--[-->');

					Avatar.Fallback($$renderer, {
						children: ($$renderer) => {
							SkullIcon($$renderer, {});
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

		$$renderer.push(`<!----></div> <div${$.attr_class(`card ${$.stringify(currentPresets().tonal)} grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[1fr_auto] corner-shape-container`)}><div><p class="font-bold">Success</p> <p>Task has been completed.</p></div> <div class="flex gap-1"><button type="button" class="btn hover:preset-tonal">Dismiss</button></div></div> <blockquote class="blockquote">First, have a definite, clear, practical ideal; a goal, an objective. Second, have the necessary means to achieve your ends: wisdom,
				money, materials, and methods. Third, adjust all your means to that end.</blockquote></div> <div class="space-y-6"><form class="card shadow bg-surface-100-900 border border-surface-200-800 p-5 space-y-5"><fieldset class="space-y-2"><h2 class="h2">Login</h2> <p class="opacity-60">Select a login method below.</p></fieldset> <fieldset class="space-y-2"><label class="label"><span class="label-text">Email</span> <input${$.attr_class(`input ${$.stringify(currentPresets().input)}`)} type="text" placeholder="email@example.com" autocomplete="off"/></label> <label class="label"><span class="label-text">Password</span> <input${$.attr_class(`input ${$.stringify(currentPresets().input)}`)} type="password" value="skeleton" autocomplete="off"/></label></fieldset> <fieldset><button type="button"${$.attr_class(`btn ${$.stringify(currentPresets().filled)} w-full`)}>Sign In Now</button></fieldset> <hr class="hr"/> <fieldset class="space-y-5"><button type="button" class="btn preset-outlined-surface-300-700 hover:preset-tonal w-full">Continue with Github</button></fieldset></form></div> <div class="space-y-5"><div class="grid grid-cols-3 gap-2"><span${$.attr_class(`badge ${$.stringify(currentPresets().filled)}`)}>Badge</span> <span${$.attr_class(`badge ${$.stringify(currentPresets().tonal)}`)}>Badge</span> <span${$.attr_class(`badge ${$.stringify(currentPresets().outlined)}`)}>Badge</span></div> <div class="card border border-surface-200-800 p-2 flex justify-center">`);

		Switch($$renderer, {
			name: 'example',
			defaultChecked: true,
			children: ($$renderer) => {
				if (Switch.Control) {
					$$renderer.push('<!--[-->');

					Switch.Control($$renderer, {
						class: currentPresets().filled,
						children: ($$renderer) => {
							if (Switch.Thumb) {
								$$renderer.push('<!--[-->');
								Switch.Thumb($$renderer, {});
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

				if (Switch.Label) {
					$$renderer.push('<!--[-->');

					Switch.Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Opt-In to Newsletter`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Switch.HiddenInput) {
					$$renderer.push('<!--[-->');
					Switch.HiddenInput($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="grid grid-cols-3 gap-2"><button type="button"${$.attr_class(`btn ${$.stringify(currentPresets().filled)}`)}>Button</button> <button type="button"${$.attr_class(`btn ${$.stringify(currentPresets().tonal)}`)}>Button</button> <button type="button"${$.attr_class(`btn ${$.stringify(currentPresets().outlined)}`)}>Button</button></div> `);

		SegmentedControl($$renderer, {
			defaultValue: 'left',
			class: 'w-full',
			children: ($$renderer) => {
				if (SegmentedControl.Control) {
					$$renderer.push('<!--[-->');

					SegmentedControl.Control($$renderer, {
						children: ($$renderer) => {
							if (SegmentedControl.Indicator) {
								$$renderer.push('<!--[-->');
								SegmentedControl.Indicator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (SegmentedControl.Item) {
								$$renderer.push('<!--[-->');

								SegmentedControl.Item($$renderer, {
									value: 'left',
									class: 'flex-1',
									children: ($$renderer) => {
										if (SegmentedControl.ItemText) {
											$$renderer.push('<!--[-->');

											SegmentedControl.ItemText($$renderer, {
												children: ($$renderer) => {
													TextAlignStart($$renderer, {});
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (SegmentedControl.ItemHiddenInput) {
											$$renderer.push('<!--[-->');
											SegmentedControl.ItemHiddenInput($$renderer, {});
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

							if (SegmentedControl.Item) {
								$$renderer.push('<!--[-->');

								SegmentedControl.Item($$renderer, {
									value: 'center',
									class: 'flex-1',
									children: ($$renderer) => {
										if (SegmentedControl.ItemText) {
											$$renderer.push('<!--[-->');

											SegmentedControl.ItemText($$renderer, {
												children: ($$renderer) => {
													TextAlignCenter($$renderer, {});
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (SegmentedControl.ItemHiddenInput) {
											$$renderer.push('<!--[-->');
											SegmentedControl.ItemHiddenInput($$renderer, {});
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

							if (SegmentedControl.Item) {
								$$renderer.push('<!--[-->');

								SegmentedControl.Item($$renderer, {
									value: 'right',
									class: 'flex-1',
									children: ($$renderer) => {
										if (SegmentedControl.ItemText) {
											$$renderer.push('<!--[-->');

											SegmentedControl.ItemText($$renderer, {
												children: ($$renderer) => {
													TextAlignEnd($$renderer, {});
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (SegmentedControl.ItemHiddenInput) {
											$$renderer.push('<!--[-->');
											SegmentedControl.ItemHiddenInput($$renderer, {});
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

							if (SegmentedControl.Item) {
								$$renderer.push('<!--[-->');

								SegmentedControl.Item($$renderer, {
									value: 'justify',
									class: 'flex-1',
									children: ($$renderer) => {
										if (SegmentedControl.ItemText) {
											$$renderer.push('<!--[-->');

											SegmentedControl.ItemText($$renderer, {
												children: ($$renderer) => {
													TextAlignJustify($$renderer, {});
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (SegmentedControl.ItemHiddenInput) {
											$$renderer.push('<!--[-->');
											SegmentedControl.ItemHiddenInput($$renderer, {});
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

		$$renderer.push(`<!----> <div class="card shadow bg-surface-100-900 border border-surface-200-800 grid grid-cols-[auto_1fr] items-center gap-4 p-4">`);

		Avatar($$renderer, {
			class: 'size-14',
			children: ($$renderer) => {
				if (Avatar.Image) {
					$$renderer.push('<!--[-->');
					Avatar.Image($$renderer, { src: '/images/female.png', class: 'grayscale' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div><p class="font-bold">Georgia Smith</p> <p class="opacity-60 text-xs">georgia.smith@example.com</p></div></div> <button type="button"${$.attr_class(`btn w-full preset-outlined-surface-200-800 outline ${$.stringify(currentPresets().outline)} outline-offset-3`)}>Outline (focused)</button></div></div> `);

		AppBar($$renderer, {
			children: ($$renderer) => {
				if (AppBar.Toolbar) {
					$$renderer.push('<!--[-->');

					AppBar.Toolbar($$renderer, {
						class: 'grid-cols-[auto_1fr_auto]',
						children: ($$renderer) => {
							if (AppBar.Lead) {
								$$renderer.push('<!--[-->');

								AppBar.Lead($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<button type="button" class="btn-icon btn-icon-lg hover:preset-tonal">`);
										MenuIcon($$renderer, {});
										$$renderer.push(`<!----></button>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (AppBar.Headline) {
								$$renderer.push('<!--[-->');

								AppBar.Headline($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<p class="text-2xl">Headline</p>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (AppBar.Trail) {
								$$renderer.push('<!--[-->');

								AppBar.Trail($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<button type="button" class="btn-icon hover:preset-tonal">`);
										SearchIcon($$renderer, { class: 'size-6' });
										$$renderer.push(`<!----></button> <button type="button" class="btn-icon hover:preset-tonal">`);
										CalendarIcon($$renderer, { class: 'size-6' });
										$$renderer.push(`<!----></button> <button type="button" class="btn-icon hover:preset-tonal">`);
										CircleUserIcon($$renderer, { class: 'size-6' });
										$$renderer.push(`<!----></button>`);
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

		$$renderer.push(`<!----> <div class="grid grid-cols-1 2xl:grid-cols-3 gap-6"><div class="relative w-full shadow bg-surface-100-900 rounded-container overflow-hidden" style="background: url(https://picsum.photos/640/640) center center; backround-size: cover;"><div class="absolute bottom-4 left-4 z-2 flex justify-center items-center"><p${$.attr_class(`text-4xl text-balance max-w-62.5 font-bold inline-block ${$.stringify(currentPresets().contrast)}`)}>Example text over a static image.</p></div> <div${$.attr_class(`absolute top-0 left-0 z-1 w-full h-full bg-linear-to-b from-transparent ${$.stringify(currentPresets().gradient)}`)}></div></div> <div class="card shadow bg-surface-100-900 border border-surface-200-800 p-5 space-y-2"><header class="flex justify-between items-start"><small class="text-base">Earnings</small> <h2 class="h2 font-normal">$14,546</h2></header> `);
		ExampleChart($$renderer, { preset: currentPresets().prop });
		$$renderer.push(`<!----></div> <div${$.attr_class(`card ${$.stringify(currentPresets().tonal)} p-5 grid grid-rows-[auto_1fr]`)}><header><small class="text-base">Users</small></header> <div class="spce-y-2 flex justify-center items-center scale-125"><div><h2 class="h2 font-normal">1,337 <sup>`);
		ArrowUpRightIcon($$renderer, { size: 30, class: 'inline-block' });
		$$renderer.push(`<!----></sup></h2> <p>New users in 30 days.</p></div></div></div></div></div>`);
	});
}