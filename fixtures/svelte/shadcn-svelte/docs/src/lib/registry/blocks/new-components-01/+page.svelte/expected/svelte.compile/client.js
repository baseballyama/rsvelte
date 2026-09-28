import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import AppearanceSettings from "./components/appearance-settings.svelte";
import ButtonGroupDemo from "./components/button-group-demo.svelte";
import ButtonGroupInputGroup from "./components/button-group-input-group.svelte";
import ButtonGroupNested from "./components/button-group-nested.svelte";
import ButtonGroupPopover from "./components/button-group-popover.svelte";
import EmptyAvatarGroup from "./components/empty-avatar-group.svelte";
import FieldDemo from "./components/field-demo.svelte";
import FieldSlider from "./components/field-slider.svelte";
import InputGroupButtonExample from "./components/input-group-button.svelte";
import InputGroupDemo from "./components/input-group-demo.svelte";
import ItemDemo from "./components/item-demo.svelte";
import NotionPromptForm from "./components/notion-prompt-form.svelte";
import SpinnerBadge from "./components/spinner-badge.svelte";
import SpinnerEmpty from "./components/spinner-empty.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col justify-center"><div class="mx-auto grid max-w-[2200px] gap-8 p-6 theme-container md:grid-cols-2 md:p-8 lg:grid-cols-3 xl:grid-cols-4"><div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full"><!></div> <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full"><div class="*:[div]:border"><!></div> <!> <!> <!></div> <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full"><!> <!> <!></div> <div class="order-first flex flex-col gap-6 min-[1400px]:order-last *:[div]:w-full *:[div]:max-w-full"><div class="flex gap-2"><!></div> <!> <!> <!> <div class="flex gap-6"><!></div> <div class="flex gap-4"><!> <!></div> <div class="*:[div]:border"><!></div></div></div></div>`);

export default function _page($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var div = root_1();
				var div_1 = $.child(div);
				var div_2 = $.child(div_1);
				var node_1 = $.child(div_2);

				FieldDemo(node_1, {});
				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var div_4 = $.child(div_3);
				var node_2 = $.child(div_4);

				EmptyAvatarGroup(node_2, {});
				$.reset(div_4);

				var node_3 = $.sibling(div_4, 2);

				ButtonGroupInputGroup(node_3, {});

				var node_4 = $.sibling(node_3, 2);

				FieldSlider(node_4, {});

				var node_5 = $.sibling(node_4, 2);

				InputGroupDemo(node_5, {});
				$.reset(div_3);

				var div_5 = $.sibling(div_3, 2);
				var node_6 = $.child(div_5);

				ItemDemo(node_6, {});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => Field.Separator, ($$anchor, Field_Separator) => {
					Field_Separator($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Appearance Settings');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_7, 2);

				AppearanceSettings(node_8, {});
				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var div_7 = $.child(div_6);
				var node_9 = $.child(div_7);

				SpinnerBadge(node_9, {});
				$.reset(div_7);

				var node_10 = $.sibling(div_7, 2);

				InputGroupButtonExample(node_10, {});

				var node_11 = $.sibling(node_10, 2);

				NotionPromptForm(node_11, {});

				var node_12 = $.sibling(node_11, 2);

				ButtonGroupDemo(node_12, {});

				var div_8 = $.sibling(node_12, 2);
				var node_13 = $.child(div_8);

				$.component(node_13, () => Field.Label, ($$anchor, Field_Label) => {
					Field_Label($$anchor, {
						for: 'checkbox-demo',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_14 = $.first_child(fragment_1);

							$.component(node_14, () => Field.Field, ($$anchor, Field_Field) => {
								Field_Field($$anchor, {
									orientation: 'horizontal',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_15 = $.first_child(fragment_2);

										Checkbox(node_15, { id: 'checkbox-demo', checked: true });

										var node_16 = $.sibling(node_15, 2);

										$.component(node_16, () => Field.Label, ($$anchor, Field_Label_1) => {
											Field_Label_1($$anchor, {
												for: 'checkbox-demo',
												class: 'line-clamp-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('I agree to the terms and conditions');

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

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_8);

				var div_9 = $.sibling(div_8, 2);
				var node_17 = $.child(div_9);

				ButtonGroupNested(node_17, {});

				var node_18 = $.sibling(node_17, 2);

				ButtonGroupPopover(node_18, {});
				$.reset(div_9);

				var div_10 = $.sibling(div_9, 2);
				var node_19 = $.child(div_10);

				SpinnerEmpty(node_19, {});
				$.reset(div_10);
				$.reset(div_6);
				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}