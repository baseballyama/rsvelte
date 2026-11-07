import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div style="margin-bottom: 1em;"><!> <!></div> <div class="accordion-container"><!></div>`, 1);

export default function _DisabledNonInteractive($$anchor) {
	let disabled = $.state(true);
	let nonInteractive = $.state(true);
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const label = ($$anchor) => {
			$.next();

			var text = $.text('Disable the second panel.');

			$.append($$anchor, text);
		};

		FormField(node, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(disabled);
					},

					set checked($$value) {
						$.set(disabled, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_1 = $.text('No interaction with the third panel.');

			$.append($$anchor, text_1);
		};

		FormField(node_1, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(nonInteractive);
					},

					set checked($$value) {
						$.set(nonInteractive, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.child(div_1);

	Accordion(node_2, {
		multiple: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_1();
			var node_3 = $.first_child(fragment_3);

			Panel(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_4 = $.first_child(fragment_4);

					Header(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Normal Panel');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Content(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('The content for normal panel.');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_3, 2);

			Panel(node_6, {
				get disabled() {
					return $.get(disabled);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_7 = $.first_child(fragment_5);

					Header(node_7, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Disabled Panel');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Content(node_8, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('The content for disabled panel.');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_6, 2);

			Panel(node_9, {
				get nonInteractive() {
					return $.get(nonInteractive);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_10 = $.first_child(fragment_6);

					{
						let $0 = $.derived(() => !$.get(nonInteractive));

						Header(node_10, {
							get ripple() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Non-Interactive Panel');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});
					}

					var node_11 = $.sibling(node_10, 2);

					Content(node_11, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('The content for non-interactive panel.');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_9, 2);

			Panel(node_12, {
				nonInteractive: true,
				open: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root();
					var node_13 = $.first_child(fragment_7);

					Header(node_13, {
						ripple: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Non-Interactive Open Panel');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					Content(node_14, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('The content for non-interactive open panel.');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}