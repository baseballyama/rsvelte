import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Resizable from '$lib/components/ui/resizable';
import * as Tabs from '$lib/components/ui/tabs';
import { cn } from '$lib/utils';
import { useDemoPreview } from './demo.svelte.js';
import { box } from 'svelte-toolbelt';

var root = $.from_html(`<iframe loading="lazy" class="relative z-20 h-full w-full"></iframe>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Demo_preview($$anchor, $$props) {
	$.push($$props, true);

	let resizableRef = $.state(null);

	const previewState = useDemoPreview({
		type: box.with(() => $$props.type),
		demo: box.with(() => $$props.demo),
		resizableRef: box.with(() => $.get(resizableRef))
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('border-border bg-background relative flex min-h-[400px] max-w-full items-center justify-center rounded-md border', {
			'bg-accent dark:bg-card border-none [--pattern-fg:oklch(0_0_0/0.05)] before:pointer-events-none before:absolute before:inset-px before:rounded-[calc(0.625rem-1px)] before:bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] dark:[--pattern-fg:oklch(1_0_0/0.05)]': $$props.type === 'iframe',
			className: $$props.class
		}));

		$.component(node, () => Tabs.Content, ($$anchor, Tabs_Content) => {
			Tabs_Content($$anchor, {
				value: 'preview',
				'data-slot': 'demo-preview',
				get class() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.key(node_2, () => previewState.root.previewKey, ($$anchor) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.snippet(node_3, () => $$props.children ?? $.noop);
								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						};

						var alternate = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => Resizable.PaneGroup, ($$anchor, Resizable_PaneGroup) => {
								Resizable_PaneGroup($$anchor, {
									direction: 'horizontal',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_5 = $.first_child(fragment_5);

										$.component(node_5, () => Resizable.Pane, ($$anchor, Resizable_Pane) => {
											$.bind_this(
												Resizable_Pane($$anchor, {
													defaultSize: 100,
													minSize: 30,
													get onResize() {
														return previewState.onResize;
													},
													class: 'border-border bg-background relative rounded-md border',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = $.comment();
														var node_6 = $.first_child(fragment_6);

														$.key(node_6, () => previewState.root.previewKey, ($$anchor) => {
															var iframe = root();

															$.template_effect(() => {
																$.set_attribute(iframe, 'title', `Preview ${$$props.demo ?? ''}`);
																$.set_attribute(iframe, 'src', `/demos/${$$props.demo}`);
															});

															$.append($$anchor, iframe);
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												}),
												($$value) => $.set(resizableRef, $$value, true),
												() => $.get(resizableRef)
											);
										});

										var node_7 = $.sibling(node_5, 2);

										$.component(node_7, () => Resizable.Handle, ($$anchor, Resizable_Handle) => {
											Resizable_Handle($$anchor, {
												withHandle: true,
												class: 'z-30 bg-transparent [&_div]:absolute [&_div]:top-1/2 [&_div]:right-2 [&_div]:h-12 [&_div]:w-2 [&_div]:-translate-y-1/2 [&_div]:rounded-full [&_div]:border-none [&_div_svg]:hidden'
											});
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => Resizable.Pane, ($$anchor, Resizable_Pane_1) => {
											Resizable_Pane_1($$anchor, { defaultSize: 0 });
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						};

						$.if(node_1, ($$render) => {
							if ($$props.children) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}