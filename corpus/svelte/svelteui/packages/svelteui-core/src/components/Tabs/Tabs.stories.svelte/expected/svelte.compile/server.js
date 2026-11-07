import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Camera, EnvelopeClosed, Gear } from 'radix-icons-svelte';
import { Badge } from '../Badge';
import { Image } from '../Image';
import { SimpleGrid } from '../SimpleGrid';
import { Text } from '../Text';
import { Title } from '../Title';
import { Tabs } from './index';

export default function Tabs_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Tabs', component: Tabs });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Tabs($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							if (Tabs.Tab) {
								$$renderer.push('<!--[-->');

								Tabs.Tab($$renderer, {
									label: 'Gallery',
									icon: Camera,
									children: ($$renderer) => {
										Title($$renderer, {
											align: 'left',
											mb: 'lg',
											order: 3,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Your photos`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										SimpleGrid($$renderer, {
											cols: 3,
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(Array(9));

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let i = each_array[$$index];

													Image($$renderer, { alt: i, src: 'https://cataas.com/cat' });
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
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

							$$renderer.push(` `);

							if (Tabs.Tab) {
								$$renderer.push('<!--[-->');

								Tabs.Tab($$renderer, {
									label: 'Messages',
									icon: EnvelopeClosed,
									children: ($$renderer) => {
										Title($$renderer, {
											align: 'left',
											mb: 'lg',
											order: 3,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Your messages`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
				Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur
				ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla
				consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget,
				arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu
				pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean
				vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac,
				enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra
				nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel
				augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus,
				tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed
				ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio
				et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante.
				Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet
				nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit
				cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum
				purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui.
				Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus
				orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam
				pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis,
				ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget,
				posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc
				nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl
				sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat,
				pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque
				facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non,
				auctor et, hendrerit quis, nisi.`);
											},
											$$slots: { default: true }
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

							$$renderer.push(` `);

							if (Tabs.Tab) {
								$$renderer.push('<!--[-->');

								Tabs.Tab($$renderer, {
									label: 'Settings',
									icon: Gear,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Settings tab content`);
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
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Tabs', id: 'tabsStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Tabs using icon slot',
		id: 'tabsSlotStory',
		children: ($$renderer) => {
			Tabs($$renderer, {
				children: ($$renderer) => {
					if (Tabs.Tab) {
						$$renderer.push('<!--[-->');

						Tabs.Tab($$renderer, {
							label: 'Gallery',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Gallery tab content`);
							},

							$$slots: {
								default: true,
								icon: ($$renderer) => {
									{
										Badge($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->New`);
											},
											$$slots: { default: true }
										});
									}
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Tabs in vertical orientation',
		id: 'tabsVerticalStory',
		args: { orientation: 'vertical' }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Nested Tabs',
		id: 'nestedTabsStory',
		children: ($$renderer) => {
			Tabs($$renderer, {
				children: ($$renderer) => {
					if (Tabs.Tab) {
						$$renderer.push('<!--[-->');

						Tabs.Tab($$renderer, {
							label: 'Gallery',
							children: ($$renderer) => {
								Tabs($$renderer, {
									children: ($$renderer) => {
										if (Tabs.Tab) {
											$$renderer.push('<!--[-->');

											Tabs.Tab($$renderer, {
												label: 'Photos',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Photos tab content`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tabs.Tab) {
											$$renderer.push('<!--[-->');

											Tabs.Tab($$renderer, {
												label: 'Images',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Images tab content`);
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Tabs.Tab) {
						$$renderer.push('<!--[-->');

						Tabs.Tab($$renderer, {
							label: 'Messages',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Messages tab content`);
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}