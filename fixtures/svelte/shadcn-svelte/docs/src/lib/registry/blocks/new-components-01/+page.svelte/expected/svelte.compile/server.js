import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer) {
	if (Tooltip.Provider) {
		$$renderer.push('<!--[-->');

		Tooltip.Provider($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex flex-col justify-center"><div class="mx-auto grid max-w-[2200px] gap-8 p-6 theme-container md:grid-cols-2 md:p-8 lg:grid-cols-3 xl:grid-cols-4"><div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full">`);
				FieldDemo($$renderer, {});
				$$renderer.push(`<!----></div> <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full"><div class="*:[div]:border">`);
				EmptyAvatarGroup($$renderer, {});
				$$renderer.push(`<!----></div> `);
				ButtonGroupInputGroup($$renderer, {});
				$$renderer.push(`<!----> `);
				FieldSlider($$renderer, {});
				$$renderer.push(`<!----> `);
				InputGroupDemo($$renderer, {});
				$$renderer.push(`<!----></div> <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full">`);
				ItemDemo($$renderer, {});
				$$renderer.push(`<!----> `);

				if (Field.Separator) {
					$$renderer.push('<!--[-->');

					Field.Separator($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Appearance Settings`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);
				AppearanceSettings($$renderer, {});
				$$renderer.push(`<!----></div> <div class="order-first flex flex-col gap-6 min-[1400px]:order-last *:[div]:w-full *:[div]:max-w-full"><div class="flex gap-2">`);
				SpinnerBadge($$renderer, {});
				$$renderer.push(`<!----></div> `);
				InputGroupButtonExample($$renderer, {});
				$$renderer.push(`<!----> `);
				NotionPromptForm($$renderer, {});
				$$renderer.push(`<!----> `);
				ButtonGroupDemo($$renderer, {});
				$$renderer.push(`<!----> <div class="flex gap-6">`);

				if (Field.Label) {
					$$renderer.push('<!--[-->');

					Field.Label($$renderer, {
						for: 'checkbox-demo',
						children: ($$renderer) => {
							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									orientation: 'horizontal',
									children: ($$renderer) => {
										Checkbox($$renderer, { id: 'checkbox-demo', checked: true });
										$$renderer.push(`<!----> `);

										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'checkbox-demo',
												class: 'line-clamp-1',
												children: ($$renderer) => {
													$$renderer.push(`<!---->I agree to the terms and conditions`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div> <div class="flex gap-4">`);
				ButtonGroupNested($$renderer, {});
				$$renderer.push(`<!----> `);
				ButtonGroupPopover($$renderer, {});
				$$renderer.push(`<!----></div> <div class="*:[div]:border">`);
				SpinnerEmpty($$renderer, {});
				$$renderer.push(`<!----></div></div></div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}