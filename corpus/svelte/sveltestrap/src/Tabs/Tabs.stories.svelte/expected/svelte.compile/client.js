import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Icon, TabContent, TabPane } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Tabs',
	parameters: {},
	argTypes: {},
	args: {}
};

var root = $.from_html(`<h2 class="text-content">Alpha</h2> <img alt="Alpha Flight" src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"/>`, 1);
var root_1 = $.from_html(`<h2 class="text-content">Bravo</h2> <img alt="Johnny Bravo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"/>`, 1);
var root_2 = $.from_html(`<h2 class="text-content">Charlie</h2> <img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png"/>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="tab-example"><!></div>`);
var root_5 = $.from_html(`<img alt="Alpha Flight" src="https://upload.wikimedia.org/wikipedia/en/4/49/Alpha_Flight_cast_picture_%28John_Byrne_era%29.gif"/>`);
var root_6 = $.from_html(`<img alt="Johnny Bravo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Johnny_Bravo_series_logo.png/320px-Johnny_Bravo_series_logo.png"/>`);
var root_7 = $.from_html(`<img alt="Charlie Brown" src="https://upload.wikimedia.org/wikipedia/en/2/22/Charlie_Brown.png"/>`);
var root_8 = $.from_html(`<span slot="tab">Alpha <!></span>`);
var root_9 = $.from_html(`<span slot="tab">Bravo <!></span>`);
var root_10 = $.from_html(`<span slot="tab">Charlie <!></span>`);
var root_11 = $.from_html(`<h2 class="text-content">Alpha</h2>`);
var root_12 = $.from_html(`<h2 class="text-content">Bravo</h2>`);
var root_13 = $.from_html(`<h2 class="text-content">Charlie</h2>`);
var root_14 = $.from_html(`<div class="tab-example"><h5 class="text-content"> </h5> <!></div>`);
var root_15 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Tabs_stories($$anchor) {
	let status = 'alpha';
	var fragment = root_15();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root_4();
				var node_1 = $.child(div);

				TabContent(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_3();
						var node_2 = $.first_child(fragment_1);

						TabPane(node_2, {
							class: 'pt-3',
							tabId: 'alpha',
							tab: 'Alpha',
							active: true,
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();

								$.next(2);
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						TabPane(node_3, {
							class: 'pt-3',
							tabId: 'bravo',
							tab: 'Bravo',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();

								$.next(2);
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						TabPane(node_4, {
							class: 'pt-3',
							tabId: 'charlie',
							tab: 'Charlie',
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_2();

								$.next(2);
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_5 = $.sibling(node, 2);

	Story(node_5, { name: 'Basic' });

	var node_6 = $.sibling(node_5, 2);

	Story(node_6, {
		name: 'Pills',
		children: ($$anchor, $$slotProps) => {
			TabContent($$anchor, {
				pills: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_3();
					var node_7 = $.first_child(fragment_6);

					TabPane(node_7, {
						class: 'pt-3',
						tabId: 'alpha',
						tab: 'Alpha',
						active: true,
						children: ($$anchor, $$slotProps) => {
							var img = root_5();

							$.append($$anchor, img);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					TabPane(node_8, {
						class: 'pt-3',
						tabId: 'bravo',
						tab: 'Bravo',
						children: ($$anchor, $$slotProps) => {
							var img_1 = root_6();

							$.append($$anchor, img_1);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					TabPane(node_9, {
						class: 'pt-3',
						tabId: 'charlie',
						tab: 'Charlie',
						children: ($$anchor, $$slotProps) => {
							var img_2 = root_7();

							$.append($$anchor, img_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_6, 2);

	Story(node_10, {
		name: 'Disabled',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_4();
			var node_11 = $.child(div_1);

			TabContent(node_11, {
				class: 'disabled-tab',
				pills: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_3();
					var node_12 = $.first_child(fragment_7);

					TabPane(node_12, {
						class: 'pt-3',
						tabId: 'alpha',
						tab: 'Alpha',
						active: true,
						children: ($$anchor, $$slotProps) => {
							var img_3 = root_5();

							$.append($$anchor, img_3);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					TabPane(node_13, {
						class: 'pt-3',
						tabId: 'bravo',
						tab: 'Bravo',
						children: ($$anchor, $$slotProps) => {
							var img_4 = root_6();

							$.append($$anchor, img_4);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					TabPane(node_14, {
						class: 'pt-3',
						tabId: 'charlie',
						tab: 'Charlie',
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							var img_5 = root_7();

							$.append($$anchor, img_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_10, 2);

	Story(node_15, {
		name: 'Slots',
		children: ($$anchor, $$slotProps) => {
			TabContent($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_3();
					var node_16 = $.first_child(fragment_9);

					TabPane(node_16, {
						class: 'pt-3',
						tabId: 'alpha',
						active: true,
						children: ($$anchor, $$slotProps) => {
							var img_6 = root_5();

							$.append($$anchor, img_6);
						},

						$$slots: {
							default: true,
							tab: ($$anchor, $$slotProps) => {
								var span = root_8();
								var node_17 = $.sibling($.child(span));

								Icon(node_17, { name: 'gear' });
								$.reset(span);
								$.append($$anchor, span);
							}
						}
					});

					var node_18 = $.sibling(node_16, 2);

					TabPane(node_18, {
						class: 'pt-3',
						tabId: 'bravo',
						children: ($$anchor, $$slotProps) => {
							var img_7 = root_6();

							$.append($$anchor, img_7);
						},

						$$slots: {
							default: true,
							tab: ($$anchor, $$slotProps) => {
								var span_1 = root_9();
								var node_19 = $.sibling($.child(span_1));

								Icon(node_19, { name: 'hand-thumbs-up' });
								$.reset(span_1);
								$.append($$anchor, span_1);
							}
						}
					});

					var node_20 = $.sibling(node_18, 2);

					TabPane(node_20, {
						class: 'pt-3',
						tabId: 'charlie',
						children: ($$anchor, $$slotProps) => {
							var img_8 = root_7();

							$.append($$anchor, img_8);
						},

						$$slots: {
							default: true,
							tab: ($$anchor, $$slotProps) => {
								var span_2 = root_10();
								var node_21 = $.sibling($.child(span_2));

								Icon(node_21, { name: 'alarm' });
								$.reset(span_2);
								$.append($$anchor, span_2);
							}
						}
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_15, 2);

	Story(node_22, {
		name: 'Vertical',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_4();
			var node_23 = $.child(div_2);

			TabContent(node_23, {
				vertical: true,
				pills: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_3();
					var node_24 = $.first_child(fragment_10);

					TabPane(node_24, {
						tabId: 'alpha',
						tab: 'Alpha',
						active: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root();

							$.next(2);
							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});

					var node_25 = $.sibling(node_24, 2);

					TabPane(node_25, {
						tabId: 'bravo',
						tab: 'Bravo',
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_1();

							$.next(2);
							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});

					var node_26 = $.sibling(node_25, 2);

					TabPane(node_26, {
						tabId: 'charlie',
						tab: 'Charlie',
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_2();

							$.next(2);
							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_27 = $.sibling(node_22, 2);

	Story(node_27, {
		name: 'Events',
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_14();
			var h5 = $.child(div_3);
			var text = $.only_child(h5);
			var node_28 = $.sibling(h5, 2);

			TabContent(node_28, {
				class: 'pt-3',
				$$events: { tab: (e) => status = e.detail },
				children: ($$anchor, $$slotProps) => {
					var fragment_14 = root_3();
					var node_29 = $.first_child(fragment_14);

					TabPane(node_29, {
						class: 'pt-3',
						tabId: 'alpha',
						tab: 'Alpha',
						active: true,
						children: ($$anchor, $$slotProps) => {
							var h2 = root_11();

							$.append($$anchor, h2);
						},
						$$slots: { default: true }
					});

					var node_30 = $.sibling(node_29, 2);

					TabPane(node_30, {
						class: 'pt-3',
						tabId: 'bravo',
						tab: 'Bravo',
						children: ($$anchor, $$slotProps) => {
							var h2_1 = root_12();

							$.append($$anchor, h2_1);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_30, 2);

					TabPane(node_31, {
						class: 'pt-3',
						tabId: 'charlie',
						tab: 'Charlie',
						children: ($$anchor, $$slotProps) => {
							var h2_2 = root_13();

							$.append($$anchor, h2_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.template_effect(() => $.set_text(text, `Current state: ${status ?? ''}`));
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}