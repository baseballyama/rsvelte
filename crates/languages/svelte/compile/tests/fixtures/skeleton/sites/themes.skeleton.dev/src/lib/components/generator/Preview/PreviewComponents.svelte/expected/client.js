import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<button type="button" class="btn-icon btn-icon-lg hover:preset-tonal"><!></button>`);
var root_5 = $.from_html(`<p class="text-2xl">Headline</p>`);
var root_6 = $.from_html(`<button type="button" class="btn-icon hover:preset-tonal"><!></button> <button type="button" class="btn-icon hover:preset-tonal"><!></button> <button type="button" class="btn-icon hover:preset-tonal"><!></button>`, 1);

var root_7 = $.from_html(`<div class="space-y-6"><header class="flex justify-between items-end"><h1 class="h1">Theme Generator</h1> <a href="https://www.skeleton.dev/docs/svelte/design/themes" target="_blank" class="btn preset-tonal">View Docs</a></header> <div class="h-3 grid grid-cols-7 gap-1"><div class="bg-primary-500 h-full"></div> <div class="bg-secondary-500 h-full"></div> <div class="bg-tertiary-500 h-full"></div> <div class="bg-success-500 h-full"></div> <div class="bg-warning-500 h-full"></div> <div class="bg-error-500 h-full"></div> <div class="bg-surface-500 h-full"></div></div> <div class="grid grid-cols-1 2xl:grid-cols-3 gap-6"><div class="space-y-6"><!> <div class="grid grid-cols-5 gap-2"><!> <!> <!> <!> <!></div> <div><div><p class="font-bold">Success</p> <p>Task has been completed.</p></div> <div class="flex gap-1"><button type="button" class="btn hover:preset-tonal">Dismiss</button></div></div> <blockquote class="blockquote">First, have a definite, clear, practical ideal; a goal, an objective. Second, have the necessary means to achieve your ends: wisdom,
				money, materials, and methods. Third, adjust all your means to that end.</blockquote></div> <div class="space-y-6"><form class="card shadow bg-surface-100-900 border border-surface-200-800 p-5 space-y-5"><fieldset class="space-y-2"><h2 class="h2">Login</h2> <p class="opacity-60">Select a login method below.</p></fieldset> <fieldset class="space-y-2"><label class="label"><span class="label-text">Email</span> <input type="text" placeholder="email@example.com" autocomplete="off"/></label> <label class="label"><span class="label-text">Password</span> <input type="password" value="skeleton" autocomplete="off"/></label></fieldset> <fieldset><button type="button">Sign In Now</button></fieldset> <hr class="hr"/> <fieldset class="space-y-5"><button type="button" class="btn preset-outlined-surface-300-700 hover:preset-tonal w-full">Continue with Github</button></fieldset></form></div> <div class="space-y-5"><div class="grid grid-cols-3 gap-2"><span>Badge</span> <span>Badge</span> <span>Badge</span></div> <div class="card border border-surface-200-800 p-2 flex justify-center"><!></div> <div class="grid grid-cols-3 gap-2"><button type="button">Button</button> <button type="button">Button</button> <button type="button">Button</button></div> <!> <div class="card shadow bg-surface-100-900 border border-surface-200-800 grid grid-cols-[auto_1fr] items-center gap-4 p-4"><!> <div><p class="font-bold">Georgia Smith</p> <p class="opacity-60 text-xs">georgia.smith@example.com</p></div></div> <button type="button">Outline (focused)</button></div></div> <!> <div class="grid grid-cols-1 2xl:grid-cols-3 gap-6"><div class="relative w-full shadow bg-surface-100-900 rounded-container overflow-hidden" style="background: url(https://picsum.photos/640/640) center center; backround-size: cover;"><div class="absolute bottom-4 left-4 z-2 flex justify-center items-center"><p>Example text over a static image.</p></div> <div></div></div> <div class="card shadow bg-surface-100-900 border border-surface-200-800 p-5 space-y-2"><header class="flex justify-between items-start"><small class="text-base">Earnings</small> <h2 class="h2 font-normal">$14,546</h2></header> <!></div> <div><header><small class="text-base">Users</small></header> <div class="spce-y-2 flex justify-center items-center scale-125"><div><h2 class="h2 font-normal">1,337 <sup><!></sup></h2> <p>New users in 30 days.</p></div></div></div></div></div>`);

export default function PreviewComponents($$anchor, $$props) {
	$.push($$props, true);

	const currentPresets = $.derived(() => constants.previewPresets[globals.activeColor]);
	var div = root_7();
	var div_1 = $.sibling($.child(div), 4);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Tabs(node, {
		defaultValue: 'planes',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
				Tabs_List($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Tabs.Indicator, ($$anchor, Tabs_Indicator) => {
							Tabs_Indicator($$anchor, {});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
							Tabs_Trigger($$anchor, {
								value: 'planes',
								get class() {
									return `flex-1 ${$.get(currentPresets).hover ?? ''}`;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Planes');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
							Tabs_Trigger_1($$anchor, {
								value: 'trains',
								get class() {
									return `flex-1 ${$.get(currentPresets).hover ?? ''}`;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Trains');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
							Tabs_Trigger_2($$anchor, {
								value: 'automobiles',
								get class() {
									return `flex-1 ${$.get(currentPresets).hover ?? ''}`;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Automobiles');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_3 = $.sibling(node, 2);
	var node_6 = $.child(div_3);

	Avatar(node_6, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_7 = $.first_child(fragment_2);

			$.component(node_7, () => Avatar.Image, ($$anchor, Avatar_Image) => {
				Avatar_Image($$anchor, { src: '/images/male.png', class: 'grayscale' });
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_6, 2);

	Avatar(node_8, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_9 = $.first_child(fragment_3);

			$.component(node_9, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
				Avatar_Fallback($$anchor, {
					get class() {
						return $.get(currentPresets).filled;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('SS');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_8, 2);

	Avatar(node_10, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = $.comment();
			var node_11 = $.first_child(fragment_4);

			$.component(node_11, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
				Avatar_Fallback_1($$anchor, {
					get class() {
						return $.get(currentPresets).tonal;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('KK');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_10, 2);

	Avatar(node_12, {
		get class() {
			return `bg-transparent ${$.get(currentPresets).outlined ?? ''}`;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_5 = $.comment();
			var node_13 = $.first_child(fragment_5);

			$.component(node_13, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_2) => {
				Avatar_Fallback_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						SkullIcon($$anchor, {});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_12, 2);

	Avatar(node_14, {
		class: 'bg-transparent preset-outlined-surface-200-800',
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = $.comment();
			var node_15 = $.first_child(fragment_7);

			$.component(node_15, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_3) => {
				Avatar_Fallback_3($$anchor, {
					children: ($$anchor, $$slotProps) => {
						SkullIcon($$anchor, {});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);

	$.next(2);
	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var form = $.child(div_5);
	var fieldset = $.sibling($.child(form), 2);
	var label = $.child(fieldset);
	var input = $.sibling($.child(label), 2);

	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1), 2);

	$.reset(label_1);
	$.reset(fieldset);

	var fieldset_1 = $.sibling(fieldset, 2);
	var button = $.only_child(fieldset_1);

	$.next(4);
	$.reset(form);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.child(div_6);
	var span = $.child(div_7);
	var span_1 = $.sibling(span, 2);
	var span_2 = $.sibling(span_1, 2);

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_16 = $.child(div_8);

	Switch(node_16, {
		name: 'example',
		defaultChecked: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_1();
			var node_17 = $.first_child(fragment_9);

			$.component(node_17, () => Switch.Control, ($$anchor, Switch_Control) => {
				Switch_Control($$anchor, {
					get class() {
						return $.get(currentPresets).filled;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_10 = $.comment();
						var node_18 = $.first_child(fragment_10);

						$.component(node_18, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
							Switch_Thumb($$anchor, {});
						});

						$.append($$anchor, fragment_10);
					},
					$$slots: { default: true }
				});
			});

			var node_19 = $.sibling(node_17, 2);

			$.component(node_19, () => Switch.Label, ($$anchor, Switch_Label) => {
				Switch_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Opt-In to Newsletter');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			});

			var node_20 = $.sibling(node_19, 2);

			$.component(node_20, () => Switch.HiddenInput, ($$anchor, Switch_HiddenInput) => {
				Switch_HiddenInput($$anchor, {});
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var button_1 = $.child(div_9);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.reset(div_9);

	var node_21 = $.sibling(div_9, 2);

	SegmentedControl(node_21, {
		defaultValue: 'left',
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = $.comment();
			var node_22 = $.first_child(fragment_11);

			$.component(node_22, () => SegmentedControl.Control, ($$anchor, SegmentedControl_Control) => {
				SegmentedControl_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_12 = root_3();
						var node_23 = $.first_child(fragment_12);

						$.component(node_23, () => SegmentedControl.Indicator, ($$anchor, SegmentedControl_Indicator) => {
							SegmentedControl_Indicator($$anchor, {});
						});

						var node_24 = $.sibling(node_23, 2);

						$.component(node_24, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item) => {
							SegmentedControl_Item($$anchor, {
								value: 'left',
								class: 'flex-1',
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_2();
									var node_25 = $.first_child(fragment_13);

									$.component(node_25, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText) => {
										SegmentedControl_ItemText($$anchor, {
											children: ($$anchor, $$slotProps) => {
												TextAlignStart($$anchor, {});
											},
											$$slots: { default: true }
										});
									});

									var node_26 = $.sibling(node_25, 2);

									$.component(node_26, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput) => {
										SegmentedControl_ItemHiddenInput($$anchor, {});
									});

									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});
						});

						var node_27 = $.sibling(node_24, 2);

						$.component(node_27, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_1) => {
							SegmentedControl_Item_1($$anchor, {
								value: 'center',
								class: 'flex-1',
								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root_2();
									var node_28 = $.first_child(fragment_15);

									$.component(node_28, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_1) => {
										SegmentedControl_ItemText_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												TextAlignCenter($$anchor, {});
											},
											$$slots: { default: true }
										});
									});

									var node_29 = $.sibling(node_28, 2);

									$.component(node_29, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_1) => {
										SegmentedControl_ItemHiddenInput_1($$anchor, {});
									});

									$.append($$anchor, fragment_15);
								},
								$$slots: { default: true }
							});
						});

						var node_30 = $.sibling(node_27, 2);

						$.component(node_30, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_2) => {
							SegmentedControl_Item_2($$anchor, {
								value: 'right',
								class: 'flex-1',
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root_2();
									var node_31 = $.first_child(fragment_17);

									$.component(node_31, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_2) => {
										SegmentedControl_ItemText_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												TextAlignEnd($$anchor, {});
											},
											$$slots: { default: true }
										});
									});

									var node_32 = $.sibling(node_31, 2);

									$.component(node_32, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_2) => {
										SegmentedControl_ItemHiddenInput_2($$anchor, {});
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});
						});

						var node_33 = $.sibling(node_30, 2);

						$.component(node_33, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_3) => {
							SegmentedControl_Item_3($$anchor, {
								value: 'justify',
								class: 'flex-1',
								children: ($$anchor, $$slotProps) => {
									var fragment_19 = root_2();
									var node_34 = $.first_child(fragment_19);

									$.component(node_34, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_3) => {
										SegmentedControl_ItemText_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												TextAlignJustify($$anchor, {});
											},
											$$slots: { default: true }
										});
									});

									var node_35 = $.sibling(node_34, 2);

									$.component(node_35, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_3) => {
										SegmentedControl_ItemHiddenInput_3($$anchor, {});
									});

									$.append($$anchor, fragment_19);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_12);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	var div_10 = $.sibling(node_21, 2);
	var node_36 = $.child(div_10);

	Avatar(node_36, {
		class: 'size-14',
		children: ($$anchor, $$slotProps) => {
			var fragment_21 = $.comment();
			var node_37 = $.first_child(fragment_21);

			$.component(node_37, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
				Avatar_Image_1($$anchor, { src: '/images/female.png', class: 'grayscale' });
			});

			$.append($$anchor, fragment_21);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_10);

	var button_4 = $.sibling(div_10, 2);

	$.reset(div_6);
	$.reset(div_1);

	var node_38 = $.sibling(div_1, 2);

	AppBar(node_38, {
		children: ($$anchor, $$slotProps) => {
			var fragment_22 = $.comment();
			var node_39 = $.first_child(fragment_22);

			$.component(node_39, () => AppBar.Toolbar, ($$anchor, AppBar_Toolbar) => {
				AppBar_Toolbar($$anchor, {
					class: 'grid-cols-[auto_1fr_auto]',
					children: ($$anchor, $$slotProps) => {
						var fragment_23 = root_1();
						var node_40 = $.first_child(fragment_23);

						$.component(node_40, () => AppBar.Lead, ($$anchor, AppBar_Lead) => {
							AppBar_Lead($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var button_5 = root_4();
									var node_41 = $.child(button_5);

									MenuIcon(node_41, {});
									$.reset(button_5);
									$.append($$anchor, button_5);
								},
								$$slots: { default: true }
							});
						});

						var node_42 = $.sibling(node_40, 2);

						$.component(node_42, () => AppBar.Headline, ($$anchor, AppBar_Headline) => {
							AppBar_Headline($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var p = root_5();

									$.append($$anchor, p);
								},
								$$slots: { default: true }
							});
						});

						var node_43 = $.sibling(node_42, 2);

						$.component(node_43, () => AppBar.Trail, ($$anchor, AppBar_Trail) => {
							AppBar_Trail($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_24 = root_6();
									var button_6 = $.first_child(fragment_24);
									var node_44 = $.child(button_6);

									SearchIcon(node_44, { class: 'size-6' });
									$.reset(button_6);

									var button_7 = $.sibling(button_6, 2);
									var node_45 = $.child(button_7);

									CalendarIcon(node_45, { class: 'size-6' });
									$.reset(button_7);

									var button_8 = $.sibling(button_7, 2);
									var node_46 = $.child(button_8);

									CircleUserIcon(node_46, { class: 'size-6' });
									$.reset(button_8);
									$.append($$anchor, fragment_24);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_23);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_22);
		},
		$$slots: { default: true }
	});

	var div_11 = $.sibling(node_38, 2);
	var div_12 = $.child(div_11);
	var div_13 = $.child(div_12);
	var p_1 = $.only_child(div_13);
	var div_14 = $.sibling(div_13, 2);

	$.reset(div_12);

	var div_15 = $.sibling(div_12, 2);
	var node_47 = $.sibling($.child(div_15), 2);

	ExampleChart(node_47, {
		get preset() {
			return $.get(currentPresets).prop;
		}
	});

	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var div_17 = $.sibling($.child(div_16), 2);
	var div_18 = $.child(div_17);
	var h2 = $.child(div_18);
	var sup = $.sibling($.child(h2));
	var node_48 = $.child(sup);

	ArrowUpRightIcon(node_48, { size: 30, class: 'inline-block' });
	$.reset(sup);
	$.reset(h2);
	$.next(2);
	$.reset(div_18);
	$.reset(div_17);
	$.reset(div_16);
	$.reset(div_11);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div_4, 1, `card ${$.get(currentPresets).tonal ?? ''} grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[1fr_auto] corner-shape-container`);
		$.set_class(input, 1, `input ${$.get(currentPresets).input ?? ''}`);
		$.set_class(input_1, 1, `input ${$.get(currentPresets).input ?? ''}`);
		$.set_class(button, 1, `btn ${$.get(currentPresets).filled ?? ''} w-full`);
		$.set_class(span, 1, `badge ${$.get(currentPresets).filled ?? ''}`);
		$.set_class(span_1, 1, `badge ${$.get(currentPresets).tonal ?? ''}`);
		$.set_class(span_2, 1, `badge ${$.get(currentPresets).outlined ?? ''}`);
		$.set_class(button_1, 1, `btn ${$.get(currentPresets).filled ?? ''}`);
		$.set_class(button_2, 1, `btn ${$.get(currentPresets).tonal ?? ''}`);
		$.set_class(button_3, 1, `btn ${$.get(currentPresets).outlined ?? ''}`);
		$.set_class(button_4, 1, `btn w-full preset-outlined-surface-200-800 outline ${$.get(currentPresets).outline ?? ''} outline-offset-3`);
		$.set_class(p_1, 1, `text-4xl text-balance max-w-62.5 font-bold inline-block ${$.get(currentPresets).contrast ?? ''}`);
		$.set_class(div_14, 1, `absolute top-0 left-0 z-1 w-full h-full bg-linear-to-b from-transparent ${$.get(currentPresets).gradient ?? ''}`);
		$.set_class(div_16, 1, `card ${$.get(currentPresets).tonal ?? ''} p-5 grid grid-rows-[auto_1fr]`);
	});

	$.append($$anchor, div);
	$.pop();
}