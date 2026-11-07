import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Demo from '$lib/components/ui/demo';
import { cn } from '$lib/utils';
import { Spinner } from './ui/spinner';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div data-toc-ignore=""><!></div>`);

export default function Demo_1($$anchor, $$props) {
	$.push($$props, true);

	const ComponentPromise = $.derived(() => import(`$lib/demos/${$$props.demo}.svelte`).then(({ default: Component }) => Component));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Demo.Root, ($$anchor, Demo_Root) => {
		Demo_Root($$anchor, {
			class: 'mt-6',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Demo.ActionsGroup, ($$anchor, Demo_ActionsGroup) => {
					Demo_ActionsGroup($$anchor, {
						class: 'justify-between',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Demo.Tabs, ($$anchor, Demo_Tabs) => {
								Demo_Tabs($$anchor, {});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Demo.ActionsGroup, ($$anchor, Demo_ActionsGroup_1) => {
								Demo_ActionsGroup_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Demo.ControlGroup, ($$anchor, Demo_ControlGroup) => {
											Demo_ControlGroup($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => Demo.Fullscreen, ($$anchor, Demo_Fullscreen) => {
														Demo_Fullscreen($$anchor, {});
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => Demo.ControlGroupSeparator, ($$anchor, Demo_ControlGroupSeparator) => {
														Demo_ControlGroupSeparator($$anchor, {});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => Demo.ControlRefresh, ($$anchor, Demo_ControlRefresh) => {
														Demo_ControlRefresh($$anchor, {});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_1, 2);

				$.component(node_8, () => Demo.Preview, ($$anchor, Demo_Preview) => {
					Demo_Preview($$anchor, {
						type: 'component',
						get demo() {
							return $$props.demo;
						},

						children: ($$anchor, $$slotProps) => {
							var div = root_2();
							var node_9 = $.child(div);

							$.await(
								node_9,
								() => $.get(ComponentPromise),
								($$anchor) => {
									Spinner($$anchor, {});
								},
								($$anchor, Component) => {
									var fragment_5 = $.comment();
									var node_10 = $.first_child(fragment_5);

									$.component(node_10, () => $.get(Component), ($$anchor, Component_1) => {
										Component_1($$anchor, {});
									});

									$.append($$anchor, fragment_5);
								}
							);

							$.reset(div);

							$.template_effect(($0) => $.set_class(div, 1, $0), [
								() => $.clsx(cn('flex h-full w-full max-w-full items-center justify-center p-4', $$props.class))
							]);

							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_8, 2);

				{
					let $0 = $.derived(() => import(`$lib/demos/${$$props.demo}.svelte?raw`).then(({ default: Code }) => Code));

					$.component(node_11, () => Demo.Code, ($$anchor, Demo_Code) => {
						Demo_Code($$anchor, {
							get code() {
								return $.get($0);
							}
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}