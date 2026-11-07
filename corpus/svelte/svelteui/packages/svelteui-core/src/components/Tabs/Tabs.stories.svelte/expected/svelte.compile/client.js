import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Camera, EnvelopeClosed, Gear } from 'radix-icons-svelte';
import { Badge } from '../Badge';
import { Image } from '../Image';
import { SimpleGrid } from '../SimpleGrid';
import { Text } from '../Text';
import { Title } from '../Title';
import { Tabs } from './index';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Tabs_stories($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Tabs',
		get component() {
			return Tabs;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Tabs($$anchor, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Tabs.Tab, ($$anchor, Tabs_Tab) => {
							Tabs_Tab($$anchor, {
								label: 'Gallery',
								get icon() {
									return Camera;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									Title(node_3, {
										align: 'left',
										mb: 'lg',
										order: 3,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Your photos');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									var node_4 = $.sibling(node_3, 2);

									SimpleGrid(node_4, {
										cols: 3,
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_5 = $.first_child(fragment_4);

											$.each(node_5, 16, () => Array(9), $.index, ($$anchor, i) => {
												Image($$anchor, {
													get alt() {
														return i;
													},
													src: 'https://cataas.com/cat'
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_2, 2);

						$.component(node_6, () => Tabs.Tab, ($$anchor, Tabs_Tab_1) => {
							Tabs_Tab_1($$anchor, {
								label: 'Messages',
								get icon() {
									return EnvelopeClosed;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_7 = $.first_child(fragment_6);

									Title(node_7, {
										align: 'left',
										mb: 'lg',
										order: 3,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Your messages');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									var node_8 = $.sibling(node_7, 2);

									Text(node_8, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.\n				Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur\n				ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla\n				consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget,\n				arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu\n				pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean\n				vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac,\n				enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra\n				nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel\n				augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus,\n				tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed\n				ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio\n				et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante.\n				Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet\n				nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit\n				cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum\n				purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui.\n				Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus\n				orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam\n				pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis,\n				ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget,\n				posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc\n				nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl\n				sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat,\n				pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque\n				facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non,\n				auctor et, hendrerit quis, nisi.');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_6, 2);

						$.component(node_9, () => Tabs.Tab, ($$anchor, Tabs_Tab_2) => {
							Tabs_Tab_2($$anchor, {
								label: 'Settings',
								get icon() {
									return Gear;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Settings tab content');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_10 = $.sibling(node_1, 2);

	Story(node_10, { name: 'Tabs', id: 'tabsStory' });

	var node_11 = $.sibling(node_10, 2);

	Story(node_11, {
		name: 'Tabs using icon slot',
		id: 'tabsSlotStory',
		children: ($$anchor, $$slotProps) => {
			Tabs($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = $.comment();
					var node_12 = $.first_child(fragment_8);

					$.component(node_12, () => Tabs.Tab, ($$anchor, Tabs_Tab_3) => {
						Tabs_Tab_3($$anchor, {
							label: 'Gallery',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Gallery tab content');

								$.append($$anchor, text_4);
							},

							$$slots: {
								default: true,
								icon: ($$anchor, $$slotProps) => {
									Badge($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('New');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});
								}
							}
						});
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_11, 2);

	Story(node_13, {
		name: 'Tabs in vertical orientation',
		id: 'tabsVerticalStory',
		args: { orientation: 'vertical' }
	});

	var node_14 = $.sibling(node_13, 2);

	Story(node_14, {
		name: 'Nested Tabs',
		id: 'nestedTabsStory',
		children: ($$anchor, $$slotProps) => {
			Tabs($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root();
					var node_15 = $.first_child(fragment_11);

					$.component(node_15, () => Tabs.Tab, ($$anchor, Tabs_Tab_4) => {
						Tabs_Tab_4($$anchor, {
							label: 'Gallery',
							children: ($$anchor, $$slotProps) => {
								Tabs($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_13 = root();
										var node_16 = $.first_child(fragment_13);

										$.component(node_16, () => Tabs.Tab, ($$anchor, Tabs_Tab_5) => {
											Tabs_Tab_5($$anchor, {
												label: 'Photos',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Photos tab content');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => Tabs.Tab, ($$anchor, Tabs_Tab_6) => {
											Tabs_Tab_6($$anchor, {
												label: 'Images',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Images tab content');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					});

					var node_18 = $.sibling(node_15, 2);

					$.component(node_18, () => Tabs.Tab, ($$anchor, Tabs_Tab_7) => {
						Tabs_Tab_7($$anchor, {
							label: 'Messages',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text('Messages tab content');

								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}