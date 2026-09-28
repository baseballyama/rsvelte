import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";
import { getColorFormat } from "$lib/colors.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";
import { cn } from "$lib/utils.js";

export default function Color_format_selector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { color, class: className, $$slots, $$events, ...restProps } = $$props;
		const userConfig = UserConfigContext.get();
		const formats = $.derived(() => getColorFormat(color));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			var bind_get = () => userConfig.current.colorFormat;

			var bind_set = (v) => {
				userConfig.setConfig({ colorFormat: v });
			};

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					get value() {
						return bind_get();
					},

					set value($$value) {
						bind_set($$value);
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, $.spread_props([
								{
									size: 'sm',
									class: cn("border-secondary bg-secondary text-secondary-foreground shadow-none", className)
								},
								restProps,
								{
									children: ($$renderer) => {
										$$renderer.push(`<span class="font-medium">Format:</span> <span class="font-mono text-muted-foreground">${$.escape(userConfig.current.colorFormat)}</span>`);
									},
									$$slots: { default: true }
								}
							]));

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
								class: 'rounded-xl',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(Object.entries(formats()));

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let [format, value] = each_array[$$index];

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: format,
												class: 'gap-2 rounded-lg [&>span]:flex [&>span]:items-center [&>span]:gap-2',
												children: ($$renderer) => {
													$$renderer.push(`<span class="font-medium">${$.escape(format)}</span> <span class="font-mono text-xs text-muted-foreground">${$.escape(value)}</span>`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}