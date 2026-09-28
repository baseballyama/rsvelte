import 'svelte/internal/disclose-version';
import Carousel from './Carousel.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';

import {
	CarouselControl,
	CarouselIndicators,
	CarouselItem,
	CarouselCaption
} from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Carousel',
	component: Carousel,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		activeIndex: { control: 'number', table: { disable: true } },
		interval: { control: 'number' },
		items: { control: 'array', table: { disable: true } },
		keyboard: { control: 'boolean' },
		pause: { control: 'boolean' },
		ride: { control: 'boolean' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		'default ': {
			description: 'This is the default content slot.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		}
	},
	args: {
		activeIndex: 0,
		interval: 5000,
		items: [],
		keyboard: true,
		pause: true,
		ride: true,
		theme: null
	}
};

var root = $.from_html(`<img class="d-block w-100"/> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="carousel-inner"></div> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="carousel-example"><div class="carousel-size"><!></div></div>`);
var root_3 = $.from_html(`<img class="d-block w-100"/>`);
var root_4 = $.from_html(`<div class="carousel-inner"></div>`);
var root_5 = $.from_html(`<div class="carousel-inner"></div> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Carousel_stories($$anchor) {
	const exampleItems = [
		{
			url: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa1d%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa1d%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.921875%22%20y%3D%22218.3%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
			title: 'Slide 1',
			subTitle: 'Slide 1'
		},

		{
			url: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa20%20text%20%7B%20fill%3A%23444%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa20%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23666%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22247.3203125%22%20y%3D%22218.3%22%3ESecond%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
			title: 'Slide 2',
			subTitle: 'Slide 2'
		},

		{
			url: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa21%20text%20%7B%20fill%3A%23333%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa21%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23555%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22277%22%20y%3D%22218.3%22%3EThird%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
			title: 'Slide 3',
			subTitle: 'Slide 3'
		}
	];

	const items = [
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa1d%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa1d%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.921875%22%20y%3D%22218.3%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa20%20text%20%7B%20fill%3A%23444%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa20%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23666%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22247.3203125%22%20y%3D%22218.3%22%3ESecond%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa21%20text%20%7B%20fill%3A%23333%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa21%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23555%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22277%22%20y%3D%22218.3%22%3EThird%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
	];

	let activeIndex = 0;
	var fragment = root_6();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root_2();
				var div_1 = $.child(div);
				var node_1 = $.child(div_1);

				Carousel(node_1, $.spread_props(() => $.get(args), {
					get items() {
						return items;
					},

					get activeIndex() {
						return activeIndex;
					},

					set activeIndex($$value) {
						activeIndex = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						CarouselIndicators(node_2, {
							get items() {
								return items;
							},

							get activeIndex() {
								return activeIndex;
							},

							set activeIndex($$value) {
								activeIndex = $$value;
							}
						});

						var div_2 = $.sibling(node_2, 2);

						$.each(div_2, 21, () => exampleItems, $.index, ($$anchor, item, index) => {
							CarouselItem($$anchor, {
								itemIndex: index,
								get activeIndex() {
									return activeIndex;
								},

								set activeIndex($$value) {
									activeIndex = $$value;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var img = $.first_child(fragment_3);
									var node_3 = $.sibling(img, 2);

									CarouselCaption(node_3, {
										get captionHeader() {
											return $.get(item).title;
										},

										get captionText() {
											return $.get(item).subTitle;
										}
									});

									$.template_effect(() => {
										$.set_attribute(img, 'src', $.get(item).url);
										$.set_attribute(img, 'alt', $.get(item).title);
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_2);

						var node_4 = $.sibling(div_2, 2);

						CarouselControl(node_4, {
							direction: 'prev',
							get items() {
								return items;
							},

							get activeIndex() {
								return activeIndex;
							},

							set activeIndex($$value) {
								activeIndex = $$value;
							}
						});

						var node_5 = $.sibling(node_4, 2);

						CarouselControl(node_5, {
							direction: 'next',
							get items() {
								return items;
							},

							get activeIndex() {
								return activeIndex;
							},

							set activeIndex($$value) {
								activeIndex = $$value;
							}
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}));

				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_6 = $.sibling(node, 2);

	Story(node_6, { name: 'Basic' });

	var node_7 = $.sibling(node_6, 2);

	Story(node_7, {
		name: 'Slide',
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_2();
			var div_4 = $.child(div_3);
			var node_8 = $.child(div_4);

			Carousel(node_8, {
				get items() {
					return items;
				},

				get activeIndex() {
					return activeIndex;
				},

				set activeIndex($$value) {
					activeIndex = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var div_5 = root_4();

					$.each(div_5, 21, () => items, $.index, ($$anchor, item, index) => {
						CarouselItem($$anchor, {
							itemIndex: index,
							get activeIndex() {
								return activeIndex;
							},

							set activeIndex($$value) {
								activeIndex = $$value;
							},

							children: ($$anchor, $$slotProps) => {
								var img_1 = root_3();

								$.template_effect(() => {
									$.set_attribute(img_1, 'src', $.get(item));
									$.set_attribute(img_1, 'alt', `${$.get(item)} ${index + 1}`);
								});

								$.append($$anchor, img_1);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_5);
					$.append($$anchor, div_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);
			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_7, 2);

	Story(node_9, {
		name: 'WithControls',
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_2();
			var div_7 = $.child(div_6);
			var node_10 = $.child(div_7);

			Carousel(node_10, {
				get items() {
					return items;
				},

				get activeIndex() {
					return activeIndex;
				},

				set activeIndex($$value) {
					activeIndex = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_5();
					var div_8 = $.first_child(fragment_5);

					$.each(div_8, 21, () => items, $.index, ($$anchor, item, index) => {
						CarouselItem($$anchor, {
							itemIndex: index,
							get activeIndex() {
								return activeIndex;
							},

							set activeIndex($$value) {
								activeIndex = $$value;
							},

							children: ($$anchor, $$slotProps) => {
								var img_2 = root_3();

								$.template_effect(() => {
									$.set_attribute(img_2, 'src', $.get(item));
									$.set_attribute(img_2, 'alt', `${$.get(item)} ${index + 1}`);
								});

								$.append($$anchor, img_2);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_8);

					var node_11 = $.sibling(div_8, 2);

					CarouselControl(node_11, {
						direction: 'prev',
						get items() {
							return items;
						},

						get activeIndex() {
							return activeIndex;
						},

						set activeIndex($$value) {
							activeIndex = $$value;
						}
					});

					var node_12 = $.sibling(node_11, 2);

					CarouselControl(node_12, {
						direction: 'next',
						get items() {
							return items;
						},

						get activeIndex() {
							return activeIndex;
						},

						set activeIndex($$value) {
							activeIndex = $$value;
						}
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_7);
			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_9, 2);

	Story(node_13, {
		name: 'WithIndicators',
		children: ($$anchor, $$slotProps) => {
			var div_9 = root_2();
			var div_10 = $.child(div_9);
			var node_14 = $.child(div_10);

			Carousel(node_14, {
				get items() {
					return items;
				},

				get activeIndex() {
					return activeIndex;
				},

				set activeIndex($$value) {
					activeIndex = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_1();
					var node_15 = $.first_child(fragment_7);

					CarouselIndicators(node_15, {
						get items() {
							return items;
						},

						get activeIndex() {
							return activeIndex;
						},

						set activeIndex($$value) {
							activeIndex = $$value;
						}
					});

					var div_11 = $.sibling(node_15, 2);

					$.each(div_11, 21, () => items, $.index, ($$anchor, item, index) => {
						CarouselItem($$anchor, {
							itemIndex: index,
							get activeIndex() {
								return activeIndex;
							},

							set activeIndex($$value) {
								activeIndex = $$value;
							},

							children: ($$anchor, $$slotProps) => {
								var img_3 = root_3();

								$.template_effect(() => {
									$.set_attribute(img_3, 'src', $.get(item));
									$.set_attribute(img_3, 'alt', `${$.get(item)} ${index + 1}`);
								});

								$.append($$anchor, img_3);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_11);

					var node_16 = $.sibling(div_11, 2);

					CarouselControl(node_16, {
						direction: 'prev',
						get items() {
							return items;
						},

						get activeIndex() {
							return activeIndex;
						},

						set activeIndex($$value) {
							activeIndex = $$value;
						}
					});

					var node_17 = $.sibling(node_16, 2);

					CarouselControl(node_17, {
						direction: 'next',
						get items() {
							return items;
						},

						get activeIndex() {
							return activeIndex;
						},

						set activeIndex($$value) {
							activeIndex = $$value;
						}
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_10);
			$.reset(div_9);
			$.append($$anchor, div_9);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}