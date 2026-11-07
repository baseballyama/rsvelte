import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	mdiCheck,
	mdiCheckCircle,
	mdiClockOutline,
	mdiClose,
	mdiMapMarker,
	mdiTruck
} from '@mdi/js';

import { Icon, Timeline, TimelineEvent, getSettings } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import { PeriodType } from '@layerstack/utils';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="font-semibold px-2"> </div>`);
var root_1 = $.from_html(`<div slot="point" class="border rounded-full px-2 text-xs"> </div>`);
var root_2 = $.from_html(`<div class="mt-0.5 mb-10 mx-2"><time class="font-mono italic"> </time> <div class="text-lg font-black"> </div> <div class="text-surface-content/70 text-sm"> </div></div>`);
var root_3 = $.from_html(`<div class="-mt-0.5 mb-10 mx-2"><time class="font-mono italic"> </time> <div class="text-lg font-black"> </div> <div class="text-surface-content/70 text-sm"> </div></div>`);
var root_4 = $.from_html(`<div class="-mt-1 mb-5 mx-2"><div class="font-bold"> </div> <div class="text-sm text-surface-content/70"><!> </div> <div class="text-sm text-surface-content/70"><!> </div></div>`);
var root_5 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Icon</h2> <!> <h2>Icon with classes</h2> <!> <h2>Alternating sides</h2> <!> <h2>Snap icon</h2> <!> <h2>Completed events</h2> <!> <h2>TimelineEvent component with custom point</h2> <!> <h2>Vertical</h2> <!> <h2>Vertical / Alternating sides</h2> <!> <h2>Completed events</h2> <!> <h2>Vertical (fixed width start)</h2> <!> <h2>Vertical / Alternating (using TimelineEvent component)</h2> <!> <h2>Vertical / Compact (using TimelineEvent component)</h2> <!> <h2>Custom data and display</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $format = () => $.store_get(format, '$format', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { format } = getSettings();

	const customData = [
		{
			title: 'Label Created',
			location: 'United States',
			date: new Date('2021-06-04T16:53:00-04:00'),
			status: 'completed'
		},

		{
			title: 'Departure scan',
			location: 'Carlisle, PA',
			date: new Date('2021-06-04T16:53:00-04:00'),
			status: 'completed'
		},

		{
			title: 'Arrival scan',
			location: 'Huntington, WV',
			date: new Date('2021-06-04T16:53:00-04:00'),
			status: 'completed'
		},

		{
			title: 'Out for delivery',
			location: 'Lavalette, WV',
			date: new Date('2021-06-04T16:53:00-04:00'),
			status: 'in-progress'
		},

		{
			title: 'Delivery attempt failed',
			location: 'Lavalette, WV',
			date: new Date('2021-06-04T16:53:00-04:00'),
			status: 'failed'
		}
	];

	const appleHistory = [
		{ start: 1984, end: 'First Macintosh computer' },
		{ start: 1998, end: 'iMac' },
		{ start: 2001, end: 'iPod' },
		{ start: 2007, end: 'iPhone' },
		{ start: 2015, end: 'Apple Watch' }
	];

	const appleHistoryAlternating = [
		{ start: 'First Macintosh computer' },
		{ end: 'iMac' },
		{ start: 'iPod' },
		{ end: 'iPhone' },
		{ start: 'Apple Watch' }
	];

	const appleHistoryAlternatingWithCompleted = [
		{ start: 'First Macintosh computer', completed: true },
		{ end: 'iMac', completed: true },
		{ start: 'iPod', completed: true },
		{ end: 'iPhone' },
		{ start: 'Apple Watch' }
	];

	const appleHistoryDetails = [
		{
			date: 1984,
			title: 'First Macintosh computer',
			description: 'The Apple Macintosh—later rebranded as the Macintosh 128K—is the original Apple Macintosh personal computer. It played a pivotal role in establishing desktop publishing as a general office function. The motherboard, a 9 in (23 cm) CRT monitor, and a floppy drive were housed in a beige case with integrated carrying handle; it came with a keyboard and single-button mouse.'
		},

		{
			date: 1998,
			title: 'iMac',
			description: "iMac is a family of all-in-one Mac desktop computers designed and built by Apple Inc. It has been the primary part of Apple's consumer desktop offerings since its debut in August 1998, and has evolved through seven distinct forms"
		},

		{
			date: 2001,
			title: 'iPod',
			description: 'The iPod is a discontinued series of portable media players and multi-purpose mobile devices designed and marketed by Apple Inc. The first version was released on October 23, 2001, about 8+1⁄2 months after the Macintosh version of iTunes was released. Apple sold an estimated 450 million iPod products as of 2022. Apple discontinued the iPod product line on May 10, 2022. At over 20 years, the iPod brand is the oldest to be discontinued by Apple'
		},

		{
			date: 2007,
			title: 'iPhone',
			description: "iPhone is a line of smartphones produced by Apple Inc. that use Apple's own iOS mobile operating system. The first-generation iPhone was announced by then-Apple CEO Steve Jobs on January 9, 2007. Since then, Apple has annually released new iPhone models and iOS updates. As of November 1, 2018, more than 2.2 billion iPhones had been sold. As of 2022, the iPhone accounts for 15.6% of global smartphone market share"
		},

		{
			date: 2015,
			title: 'Apple Watch',
			description: 'The Apple Watch is a line of smartwatches produced by Apple Inc. It incorporates fitness tracking, health-oriented capabilities, and wireless telecommunication, and integrates with iOS and other Apple products and services'
		}
	];

	var fragment = root_5();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				get data() {
					return appleHistory;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				get data() {
					return appleHistory;
				},

				get icon() {
					return mdiCheckCircle;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				get data() {
					return appleHistory;
				},

				get icon() {
					return mdiCheckCircle;
				},

				classes: {
					event: {
						start: 'text-sm font-semibold',
						end: 'border rounded-lg text-sm p-2',
						icon: 'size-5'
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				get data() {
					return appleHistoryAlternating;
				},

				get icon() {
					return mdiCheckCircle;
				},

				classes: {
					event: {
						start: 'border rounded-lg text-sm p-2',
						end: 'border rounded-lg text-sm p-2',
						icon: 'size-5'
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				get data() {
					return appleHistoryAlternating;
				},

				get icon() {
					return mdiCheckCircle;
				},
				snapPoint: true,
				classes: {
					event: {
						start: 'border rounded-lg text-sm p-2',
						end: 'border rounded-lg text-sm p-2',
						icon: 'size-5'
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				get data() {
					return appleHistoryAlternatingWithCompleted;
				},

				get icon() {
					return mdiCheckCircle;
				},

				classes: {
					event: {
						start: 'border rounded-lg text-sm p-2 m-1',
						end: 'border rounded-lg text-sm p-2 m-1',
						icon: 'size-5'
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = $.comment();
					var node_7 = $.first_child(fragment_8);

					$.each(node_7, 17, () => appleHistory, $.index, ($$anchor, item, i) => {
						TimelineEvent($$anchor, {
							get icon() {
								return mdiCheckCircle;
							},
							start: i % 2 === 0,
							end: i % 2 !== 0,
							children: ($$anchor, $$slotProps) => {
								var div = root();
								var text = $.only_child(div, true);

								$.template_effect(() => $.set_text(text, $.get(item).end));
								$.append($$anchor, div);
							},

							$$slots: {
								default: true,
								point: ($$anchor, $$slotProps) => {
									var div_1 = root_1();
									var text_1 = $.only_child(div_1, true);

									$.template_effect(() => $.set_text(text_1, $.get(item).start));
									$.append($$anchor, div_1);
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

	var node_8 = $.sibling(node_6, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				get data() {
					return appleHistory;
				},

				get icon() {
					return mdiCheckCircle;
				},
				vertical: true,
				classes: {
					event: {
						start: 'text-sm font-semibold',
						end: 'border rounded-lg text-sm p-2 m-1',
						icon: 'size-5'
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				get data() {
					return appleHistoryAlternating;
				},

				get icon() {
					return mdiCheckCircle;
				},
				vertical: true,
				classes: {
					event: {
						start: 'border rounded-lg text-sm p-2 m-1',
						end: 'border rounded-lg text-sm p-2 m-1',
						icon: 'size-5'
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				get data() {
					return appleHistoryAlternatingWithCompleted;
				},

				get icon() {
					return mdiCheckCircle;
				},
				vertical: true,
				classes: {
					event: {
						start: 'border rounded-lg text-sm p-2 m-1',
						end: 'border rounded-lg text-sm p-2 m-1',
						icon: 'size-5'
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				get data() {
					return appleHistory;
				},

				get icon() {
					return mdiCheckCircle;
				},
				vertical: true,
				classes: {
					event: {
						root: 'grid-cols-[40px,auto,1fr]',
						start: 'text-sm font-semibold mr-1',
						end: 'border rounded-lg text-sm p-2 m-1',
						icon: 'size-5'
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				vertical: true,
				snapPoint: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_15 = $.comment();
					var node_13 = $.first_child(fragment_15);

					$.each(node_13, 17, () => appleHistoryDetails, $.index, ($$anchor, item, i) => {
						{
							let $0 = $.derived(() => ({ root: cls(i % 2 === 0 && 'text-end'), icon: 'size-5' }));

							TimelineEvent($$anchor, {
								get icon() {
									return mdiCheckCircle;
								},
								start: i % 2 === 0,
								end: i % 2 !== 0,
								get classes() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var div_2 = root_2();
									var time = $.child(div_2);
									var text_2 = $.only_child(time, true);
									var div_3 = $.sibling(time, 2);
									var text_3 = $.only_child(div_3, true);
									var div_4 = $.sibling(div_3, 2);
									var text_4 = $.only_child(div_4, true);

									$.reset(div_2);

									$.template_effect(() => {
										$.set_text(text_2, $.get(item).date);
										$.set_text(text_3, $.get(item).title);
										$.set_text(text_4, $.get(item).description);
									});

									$.append($$anchor, div_2);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_15);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_12, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				vertical: true,
				compact: true,
				snapPoint: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_18 = $.comment();
					var node_15 = $.first_child(fragment_18);

					$.each(node_15, 17, () => appleHistoryDetails, $.index, ($$anchor, item, i) => {
						TimelineEvent($$anchor, {
							get icon() {
								return mdiCheckCircle;
							},
							start: i % 2 === 0,
							end: i % 2 !== 0,
							classes: { icon: 'size-5' },
							completed: i < 3,
							children: ($$anchor, $$slotProps) => {
								var div_5 = root_3();
								var time_1 = $.child(div_5);
								var text_5 = $.only_child(time_1, true);
								var div_6 = $.sibling(time_1, 2);
								var text_6 = $.only_child(div_6, true);
								var div_7 = $.sibling(div_6, 2);
								var text_7 = $.only_child(div_7, true);

								$.reset(div_5);

								$.template_effect(() => {
									$.set_text(text_5, $.get(item).date);
									$.set_text(text_6, $.get(item).title);
									$.set_text(text_7, $.get(item).description);
								});

								$.append($$anchor, div_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_14, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				vertical: true,
				compact: true,
				snapPoint: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_21 = $.comment();
					var node_17 = $.first_child(fragment_21);

					$.each(node_17, 17, () => customData, $.index, ($$anchor, item, i) => {
						{
							let $0 = $.derived(() => ({
								root: cls(({
									completed: '[--color-completed:theme(colors.success)]',
									failed: '[--color-completed:theme(colors.danger)]',
									'in-progress': '[--color-completed:theme(colors.info)]'
								})[$.get(item).status]),
								line: 'w-0.5',
								icon: cls('size-5 rounded-full p-0.5 text-surface-100 bg-[var(--color-completed)]')
							}));

							TimelineEvent($$anchor, {
								get icon() {
									return ({
										'in-progress': mdiTruck,
										completed: mdiCheck,
										failed: mdiClose
									})[$.get(item).status];
								},
								start: i % 2 === 0,
								end: i % 2 !== 0,
								completed: i < 4,
								get classes() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var div_8 = root_4();
									var div_9 = $.child(div_8);
									var text_8 = $.only_child(div_9, true);
									var div_10 = $.sibling(div_9, 2);
									var node_18 = $.child(div_10);

									Icon(node_18, {
										get data() {
											return mdiMapMarker;
										},
										size: '1rem'
									});

									var text_9 = $.sibling(node_18);

									$.reset(div_10);

									var div_11 = $.sibling(div_10, 2);
									var node_19 = $.child(div_11);

									Icon(node_19, {
										get data() {
											return mdiClockOutline;
										},
										size: '.9rem'
									});

									var text_10 = $.sibling(node_19);

									$.reset(div_11);
									$.reset(div_8);

									$.template_effect(
										($0) => {
											$.set_text(text_8, $.get(item).title);
											$.set_text(text_9, ` ${$.get(item).location ?? ''}`);
											$.set_text(text_10, ` ${$0 ?? ''}`);
										},
										[() => $format()($.get(item).date, PeriodType.DayTime)]
									);

									$.append($$anchor, div_8);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_21);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}