import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex h-32 flex-col overflow-hidden rounded-lg border bg-muted"><div class="bg-muted-foreground transition-all duration-300"></div></div> <div class="flex items-center gap-3"><span class="text-xs font-medium tracking-wider text-muted-foreground uppercase">Open</span> <!> <span class="text-xs font-medium tracking-wider text-muted-foreground uppercase">Close</span></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Roller_shades($$anchor) {
	let position = $.state($.proxy([50]));

	const preset = $.derived(() => {
		const p = $.get(position)[0];

		if (p <= 10) return "open";
		if (p >= 90) return "closed";

		return "half";
	});

	function onPresetChange(v) {
		if (v == "open") {
			$.set(position, [0], true);
		} else if (v == "half") {
			$.set(position, [50], true);
		} else if (v == "closed") {
			$.set(position, [100], true);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Living Room');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Roller Shades');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var div = $.first_child(fragment_3);
							var div_1 = $.child(div);
							let styles;

							$.reset(div);

							var div_2 = $.sibling(div, 2);
							var node_5 = $.sibling($.child(div_2), 2);

							Slider(node_5, {
								type: 'multiple',
								max: 100,
								class: 'flex-1',
								get value() {
									return $.get(position);
								},

								set value($$value) {
									$.set(position, $$value, true);
								}
							});

							$.next(2);
							$.reset(div_2);
							$.template_effect(() => styles = $.set_style(div_1, '', styles, { height: `${$.get(position)[0] ?? ''}%` }));
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_4, 2);

				$.component(node_6, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_7 = $.first_child(fragment_4);

							$.component(node_7, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
								ToggleGroup_Root($$anchor, {
									type: 'single',
									get value() {
										return $.get(preset);
									},
									onValueChange: onPresetChange,
									variant: 'outline',
									spacing: 1,
									class: 'w-full',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_2();
										var node_8 = $.first_child(fragment_5);

										$.component(node_8, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
											ToggleGroup_Item($$anchor, {
												value: 'open',
												class: 'flex-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Open');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
											ToggleGroup_Item_1($$anchor, {
												value: 'half',
												class: 'flex-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Half');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
											ToggleGroup_Item_2($$anchor, {
												value: 'closed',
												class: 'flex-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Closed');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}