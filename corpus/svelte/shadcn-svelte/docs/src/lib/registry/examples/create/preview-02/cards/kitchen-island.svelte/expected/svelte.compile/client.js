import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Slider } from "$lib/registry/ui/slider/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-2"><span class="sr-only">Scenes</span> <!></div> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Kitchen_island($$anchor) {
	const SCENES = {
		cooking: { brightness: [90], colorTemp: [70], volume: [30], fade: [0] },
		dining: { brightness: [50], colorTemp: [40], volume: [20], fade: [60] },
		nightlight: { brightness: [15], colorTemp: [20], volume: [0], fade: [80] },
		focus: { brightness: [100], colorTemp: [85], volume: [0], fade: [0] }
	};

	let enabled = $.state(true);
	let scene = $.state("cooking");
	let brightness = $.state($.proxy([90]));
	let colorTemp = $.state($.proxy([70]));
	let volume = $.state($.proxy([30]));
	let fade = $.state($.proxy([0]));

	function onSceneChange(value) {
		const preset = SCENES[value];

		if (!preset) return;

		$.set(brightness, [...preset.brightness], true);
		$.set(colorTemp, [...preset.colorTemp], true);
		$.set(volume, [...preset.volume], true);
		$.set(fade, [...preset.fade], true);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Kitchen Island');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Hue Color Ambient');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Switch($$anchor, {
											get checked() {
												return $.get(enabled);
											},

											set checked($$value) {
												$.set(enabled, $$value, true);
											}
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_2();
							var div = $.first_child(fragment_4);
							var node_6 = $.sibling($.child(div), 2);

							$.component(node_6, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
								ToggleGroup_Root($$anchor, {
									type: 'single',
									onValueChange: onSceneChange,
									variant: 'outline',
									spacing: 1,
									class: 'flex-wrap',
									get value() {
										return $.get(scene);
									},

									set value($$value) {
										$.set(scene, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_7 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => !$.get(enabled));

											$.component(node_7, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
												ToggleGroup_Item($$anchor, {
													value: 'cooking',
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Cooking');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_8 = $.sibling(node_7, 2);

										{
											let $0 = $.derived(() => !$.get(enabled));

											$.component(node_8, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
												ToggleGroup_Item_1($$anchor, {
													value: 'dining',
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Dining');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_9 = $.sibling(node_8, 2);

										{
											let $0 = $.derived(() => !$.get(enabled));

											$.component(node_9, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
												ToggleGroup_Item_2($$anchor, {
													value: 'nightlight',
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('Nightlight');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_10 = $.sibling(node_9, 2);

										{
											let $0 = $.derived(() => !$.get(enabled));

											$.component(node_10, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_3) => {
												ToggleGroup_Item_3($$anchor, {
													value: 'focus',
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('Focus');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);

							var node_11 = $.sibling(div, 2);

							$.component(node_11, () => Item.Group, ($$anchor, Item_Group) => {
								Item_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_1();
										var node_12 = $.first_child(fragment_6);

										$.component(node_12, () => Item.Root, ($$anchor, Item_Root) => {
											Item_Root($$anchor, {
												size: 'sm',
												variant: 'outline',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_13 = $.first_child(fragment_7);

													$.component(node_13, () => Item.Media, ($$anchor, Item_Media) => {
														Item_Media($$anchor, {
															variant: 'icon',
															children: ($$anchor, $$slotProps) => {
																IconPlaceholder($$anchor, {
																	lucide: 'SunIcon',
																	tabler: 'IconSun',
																	hugeicons: 'Sun03Icon',
																	phosphor: 'SunIcon',
																	remixicon: 'RiSunLine'
																});
															},
															$$slots: { default: true }
														});
													});

													var node_14 = $.sibling(node_13, 2);

													$.component(node_14, () => Item.Content, ($$anchor, Item_Content) => {
														Item_Content($$anchor, {
															class: 'flex-row items-center gap-3',
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = $.comment();
																var node_15 = $.first_child(fragment_9);

																$.component(node_15, () => Item.Title, ($$anchor, Item_Title) => {
																	Item_Title($$anchor, {
																		class: 'shrink-0',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text('Brightness');

																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_14, 2);

													$.component(node_16, () => Item.Actions, ($$anchor, Item_Actions) => {
														Item_Actions($$anchor, {
															class: 'flex-1',
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => !$.get(enabled));

																	Slider($$anchor, {
																		type: 'multiple',
																		max: 100,
																		get disabled() {
																			return $.get($0);
																		},
																		class: 'w-full',
																		get value() {
																			return $.get(brightness);
																		},

																		set value($$value) {
																			$.set(brightness, $$value, true);
																		}
																	});
																}
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_12, 2);

										$.component(node_17, () => Item.Root, ($$anchor, Item_Root_1) => {
											Item_Root_1($$anchor, {
												size: 'sm',
												variant: 'outline',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root();
													var node_18 = $.first_child(fragment_11);

													$.component(node_18, () => Item.Media, ($$anchor, Item_Media_1) => {
														Item_Media_1($$anchor, {
															variant: 'icon',
															children: ($$anchor, $$slotProps) => {
																IconPlaceholder($$anchor, {
																	lucide: 'ThermometerIcon',
																	tabler: 'IconThermometer',
																	hugeicons: 'ThermometerWarmIcon',
																	phosphor: 'ThermometerIcon',
																	remixicon: 'RiThermometerLine'
																});
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_18, 2);

													$.component(node_19, () => Item.Content, ($$anchor, Item_Content_1) => {
														Item_Content_1($$anchor, {
															class: 'flex-row items-center gap-3',
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = $.comment();
																var node_20 = $.first_child(fragment_13);

																$.component(node_20, () => Item.Title, ($$anchor, Item_Title_1) => {
																	Item_Title_1($$anchor, {
																		class: 'shrink-0',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_7 = $.text('Color Temp');

																			$.append($$anchor, text_7);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_13);
															},
															$$slots: { default: true }
														});
													});

													var node_21 = $.sibling(node_19, 2);

													$.component(node_21, () => Item.Actions, ($$anchor, Item_Actions_1) => {
														Item_Actions_1($$anchor, {
															class: 'flex-1',
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => !$.get(enabled));

																	Slider($$anchor, {
																		type: 'multiple',
																		max: 100,
																		get disabled() {
																			return $.get($0);
																		},

																		get value() {
																			return $.get(colorTemp);
																		},

																		set value($$value) {
																			$.set(colorTemp, $$value, true);
																		}
																	});
																}
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										var node_22 = $.sibling(node_17, 2);

										$.component(node_22, () => Item.Root, ($$anchor, Item_Root_2) => {
											Item_Root_2($$anchor, {
												size: 'sm',
												variant: 'outline',
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root();
													var node_23 = $.first_child(fragment_15);

													$.component(node_23, () => Item.Media, ($$anchor, Item_Media_2) => {
														Item_Media_2($$anchor, {
															variant: 'icon',
															children: ($$anchor, $$slotProps) => {
																IconPlaceholder($$anchor, {
																	lucide: 'Volume2Icon',
																	tabler: 'IconVolume',
																	hugeicons: 'VolumeHighIcon',
																	phosphor: 'SpeakerHighIcon',
																	remixicon: 'RiVolumeUpLine'
																});
															},
															$$slots: { default: true }
														});
													});

													var node_24 = $.sibling(node_23, 2);

													$.component(node_24, () => Item.Content, ($$anchor, Item_Content_2) => {
														Item_Content_2($$anchor, {
															class: 'flex-row items-center gap-3',
															children: ($$anchor, $$slotProps) => {
																var fragment_17 = $.comment();
																var node_25 = $.first_child(fragment_17);

																$.component(node_25, () => Item.Title, ($$anchor, Item_Title_2) => {
																	Item_Title_2($$anchor, {
																		class: 'shrink-0',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text('Volume');

																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_17);
															},
															$$slots: { default: true }
														});
													});

													var node_26 = $.sibling(node_24, 2);

													$.component(node_26, () => Item.Actions, ($$anchor, Item_Actions_2) => {
														Item_Actions_2($$anchor, {
															class: 'flex-1',
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => !$.get(enabled));

																	Slider($$anchor, {
																		type: 'multiple',
																		max: 100,
																		get disabled() {
																			return $.get($0);
																		},

																		get value() {
																			return $.get(volume);
																		},

																		set value($$value) {
																			$.set(volume, $$value, true);
																		}
																	});
																}
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});
										});

										var node_27 = $.sibling(node_22, 2);

										$.component(node_27, () => Item.Root, ($$anchor, Item_Root_3) => {
											Item_Root_3($$anchor, {
												size: 'sm',
												variant: 'outline',
												children: ($$anchor, $$slotProps) => {
													var fragment_19 = root();
													var node_28 = $.first_child(fragment_19);

													$.component(node_28, () => Item.Media, ($$anchor, Item_Media_3) => {
														Item_Media_3($$anchor, {
															variant: 'icon',
															children: ($$anchor, $$slotProps) => {
																IconPlaceholder($$anchor, {
																	lucide: 'TimerIcon',
																	tabler: 'IconClock',
																	hugeicons: 'Clock03Icon',
																	phosphor: 'TimerIcon',
																	remixicon: 'RiTimerLine'
																});
															},
															$$slots: { default: true }
														});
													});

													var node_29 = $.sibling(node_28, 2);

													$.component(node_29, () => Item.Content, ($$anchor, Item_Content_3) => {
														Item_Content_3($$anchor, {
															class: 'flex-row items-center gap-3',
															children: ($$anchor, $$slotProps) => {
																var fragment_21 = $.comment();
																var node_30 = $.first_child(fragment_21);

																$.component(node_30, () => Item.Title, ($$anchor, Item_Title_3) => {
																	Item_Title_3($$anchor, {
																		class: 'shrink-0',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_9 = $.text('Fade');

																			$.append($$anchor, text_9);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_21);
															},
															$$slots: { default: true }
														});
													});

													var node_31 = $.sibling(node_29, 2);

													$.component(node_31, () => Item.Actions, ($$anchor, Item_Actions_3) => {
														Item_Actions_3($$anchor, {
															class: 'flex-1',
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => !$.get(enabled));

																	Slider($$anchor, {
																		type: 'multiple',
																		max: 100,
																		get disabled() {
																			return $.get($0);
																		},

																		get value() {
																			return $.get(fade);
																		},

																		set value($$value) {
																			$.set(fade, $$value, true);
																		}
																	});
																}
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_19);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
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
}