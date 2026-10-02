import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";
import Label from "$lib/registry/ui/label/label.svelte";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { THEMES } from "$lib/registry/themes.js";
import { cn } from "$lib/utils.js";

export default function Theme_selector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;
		const designSystem = useDesignSystem();
		const themesList = $.derived(() => THEMES.map((theme) => ({ name: theme.title, value: theme.name })).sort((a, b) => a.name.localeCompare(b.name)));
		const label = $.derived(() => themesList().find((t) => t.value === designSystem.theme)?.name ?? "Neutral");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attributes({
				class: $.clsx(cn("flex items-center gap-2", className)),
				...restProps
			})}>`);

			Label($$renderer, {
				for: 'theme-selector',
				class: 'sr-only',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Theme`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					get value() {
						return designSystem.theme;
					},

					set value($$value) {
						designSystem.theme = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								size: 'sm',
								class: 'justify-start border-secondary bg-secondary text-secondary-foreground shadow-none',
								id: 'theme-selector',
								children: ($$renderer) => {
									$$renderer.push(`<span class="font-medium">Theme:</span> <span class="w-12">${$.escape(label())}</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Select.Content) {
							$$renderer.push('<!--[-->');

							Select.Content($$renderer, {
								align: 'end',
								class: 'max-h-80',
								children: ($$renderer) => {
									if (Select.Group) {
										$$renderer.push('<!--[-->');

										Select.Group($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(themesList());

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let theme = each_array[$$index];

													if (Select.Item) {
														$$renderer.push('<!--[-->');

														Select.Item($$renderer, {
															value: theme.value,
															label: theme.name,
															class: 'data-[selected]:opacity-50',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(theme.name)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(`<!--]-->`);
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

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}