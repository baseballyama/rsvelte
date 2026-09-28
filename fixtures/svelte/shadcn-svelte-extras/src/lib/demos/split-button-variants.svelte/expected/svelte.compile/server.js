import * as $ from 'svelte/internal/server';
import * as SplitButton from '$lib/components/ui/split-button';

export default function Split_button_variants($$renderer) {
	const stylePresets = [
		{
			id: 'github-default',
			label: 'GitHub Blue - default',
			rootClass: '[--primary-foreground:#fff] [--primary:#1F6FEB]'
		},

		{
			id: 'github-sm',
			label: 'GitHub Blue - sm',
			rootClass: '[--primary-foreground:#fff] [--primary:#1F6FEB]',
			actionSize: 'sm',
			triggerSize: 'icon-sm'
		},

		{
			id: 'github-lg',
			label: 'GitHub Blue - lg',
			rootClass: '[--primary-foreground:#fff] [--primary:#1F6FEB]',
			actionSize: 'lg',
			triggerSize: 'icon-lg'
		},

		{
			id: 'emerald',
			label: 'Emerald - default',
			rootClass: '[--primary-foreground:#fff] [--primary:#059669]'
		},

		{
			id: 'violet-xs',
			label: 'Violet - xs',
			rootClass: '[--primary-foreground:#fff] [--primary:#7c3aed]',
			actionSize: 'xs',
			triggerSize: 'icon-xs'
		},

		{
			id: 'destructive-sm',
			label: 'Destructive - sm',
			actionSize: 'sm',
			triggerSize: 'icon-sm',
			variant: 'destructive'
		},

		{
			id: 'outline',
			label: 'Outline - default',
			actionSize: 'default',
			triggerSize: 'icon',
			variant: 'outline'
		},

		{
			id: 'secondary',
			label: 'Secondary - default',
			actionSize: 'default',
			triggerSize: 'icon',
			variant: 'secondary'
		}
	];

	/** `null` = theme default (no preset); otherwise committed look on root + trigger */
	let appliedPresetId = null;

	/** Selection from the menu + label on the primary segment (may differ until Apply) */
	let pendingPresetId = stylePresets[0].id;

	const themeDefault = {};

	const appliedStyle = $.derived(() => appliedPresetId === null
		? themeDefault
		: stylePresets.find((p) => p.id === appliedPresetId) ?? themeDefault);

	const isApplyDisabled = $.derived(() => pendingPresetId === appliedPresetId);
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (SplitButton.Root) {
			$$renderer.push('<!--[-->');

			SplitButton.Root($$renderer, {
				class: appliedStyle().rootClass,
				onclick: (e) => {
					appliedPresetId = e.action;
				},

				get value() {
					return pendingPresetId;
				},

				set value($$value) {
					pendingPresetId = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(stylePresets);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let preset = each_array[$$index];

						if (SplitButton.Action) {
							$$renderer.push('<!--[-->');

							SplitButton.Action($$renderer, {
								value: preset.id,
								size: appliedStyle().actionSize,
								variant: appliedStyle().variant,
								disabled: isApplyDisabled(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Apply ${$.escape(preset.label)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]--> `);

					if (SplitButton.Select) {
						$$renderer.push('<!--[-->');

						SplitButton.Select($$renderer, {
							children: ($$renderer) => {
								if (SplitButton.SelectTrigger) {
									$$renderer.push('<!--[-->');

									SplitButton.SelectTrigger($$renderer, {
										size: appliedStyle().triggerSize,
										variant: appliedStyle().variant
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (SplitButton.SelectContent) {
									$$renderer.push('<!--[-->');

									SplitButton.SelectContent($$renderer, {
										class: 'max-w-sm',
										children: ($$renderer) => {
											if (SplitButton.SelectGroup) {
												$$renderer.push('<!--[-->');

												SplitButton.SelectGroup($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_1 = $.ensure_array_like(stylePresets);

														for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
															let preset = each_array_1[$$index_1];

															if (SplitButton.SelectAction) {
																$$renderer.push('<!--[-->');

																SplitButton.SelectAction($$renderer, {
																	value: preset.id,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(preset.label)}`);
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
}