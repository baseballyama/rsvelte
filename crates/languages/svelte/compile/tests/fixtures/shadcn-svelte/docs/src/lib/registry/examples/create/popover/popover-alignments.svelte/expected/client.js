import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-6"><!> <!> <!></div>`);

export default function Popover_alignments($$anchor) {
	Example($$anchor, {
		title: 'Alignments',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline', size: 'sm' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Start');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
								Popover_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								align: 'start',
								class: 'w-40',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Aligned to start');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node, 2);

			$.component(node_3, () => Popover.Root, ($$anchor, Popover_Root_1) => {
				Popover_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_4 = $.first_child(fragment_3);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline', size: 'sm' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Center');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_4, () => Popover.Trigger, ($$anchor, Popover_Trigger_1) => {
								Popover_Trigger_1($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content_1) => {
							Popover_Content_1($$anchor, {
								align: 'center',
								class: 'w-40',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Aligned to center');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_3, 2);

			$.component(node_6, () => Popover.Root, ($$anchor, Popover_Root_2) => {
				Popover_Root_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_7 = $.first_child(fragment_5);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline', size: 'sm' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('End');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_7, () => Popover.Trigger, ($$anchor, Popover_Trigger_2) => {
								Popover_Trigger_2($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Popover.Content, ($$anchor, Popover_Content_2) => {
							Popover_Content_2($$anchor, {
								align: 'end',
								class: 'w-40',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Aligned to end');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}