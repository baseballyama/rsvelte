import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button } from '../Button';
import { Paper } from '../Paper';
import { Collapse } from './index';

var root = $.from_html(`<!> <!> <div>This is a cool text!</div>`, 1);
var root_1 = $.from_html(`Please click below to toggle a nested collapse! <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <div>Footer text</div>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Collapse_stories($$anchor) {
	let open = false;
	let openInside = false;
	var fragment = root_3();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Collapse',
		get component() {
			return Collapse;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = root();
				var node_2 = $.first_child(fragment_1);

				Button(node_2, {
					$$events: {
						click: () => {
							open = !open;
						}
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Toggle collapse text');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_2, 2);

				Collapse(node_3, $.spread_props(
					{
						get open() {
							return open;
						}
					},
					() => $.get(args),
					{
						children: ($$anchor, $$slotProps) => {
							Paper($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('This is a hidden text!');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					}
				));

				$.next(2);
				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_4 = $.sibling(node_1, 2);

	Story(node_4, { name: 'Collapse', id: 'collapseStory' });

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Nested Collapse',
		id: 'collapseNestedStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_6 = $.first_child(fragment_3);

			Button(node_6, {
				$$events: {
					click: () => {
						open = !open;
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Toggle collapse');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Collapse(node_7, {
				get open() {
					return open;
				},

				children: ($$anchor, $$slotProps) => {
					Paper($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_5 = root_1();
							var node_8 = $.sibling($.first_child(fragment_5));

							Button(node_8, {
								$$events: {
									click: () => {
										openInside = !openInside;
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Toggle nested collapse');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Collapse(node_9, {
								get open() {
									return openInside;
								},

								children: ($$anchor, $$slotProps) => {
									Paper($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('This is a very hidden text, sshhhh!');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}