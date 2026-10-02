import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as SplitButton from '$lib/components/ui/split-button';

var root = $.from_html(`<!> <!>`, 1);

export default function Split_button_variants($$anchor) {
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
	let appliedPresetId = $.state(null);

	/** Selection from the menu + label on the primary segment (may differ until Apply) */
	let pendingPresetId = $.state($.proxy(stylePresets[0].id));

	const themeDefault = {};

	const appliedStyle = $.derived(() => $.get(appliedPresetId) === null
		? themeDefault
		: stylePresets.find((p) => p.id === $.get(appliedPresetId)) ?? themeDefault);

	const isApplyDisabled = $.derived(() => $.get(pendingPresetId) === $.get(appliedPresetId));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => SplitButton.Root, ($$anchor, SplitButton_Root) => {
		SplitButton_Root($$anchor, {
			get class() {
				return $.get(appliedStyle).rootClass;
			},

			onclick: (e) => {
				$.set(appliedPresetId, e.action, true);
			},

			get value() {
				return $.get(pendingPresetId);
			},

			set value($$value) {
				$.set(pendingPresetId, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => stylePresets, (preset) => preset.id, ($$anchor, preset) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => SplitButton.Action, ($$anchor, SplitButton_Action) => {
						SplitButton_Action($$anchor, {
							get value() {
								return $.get(preset).id;
							},

							get size() {
								return $.get(appliedStyle).actionSize;
							},

							get variant() {
								return $.get(appliedStyle).variant;
							},

							get disabled() {
								return $.get(isApplyDisabled);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, `Apply ${$.get(preset).label ?? ''}`));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => SplitButton.Select, ($$anchor, SplitButton_Select) => {
					SplitButton_Select($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => SplitButton.SelectTrigger, ($$anchor, SplitButton_SelectTrigger) => {
								SplitButton_SelectTrigger($$anchor, {
									get size() {
										return $.get(appliedStyle).triggerSize;
									},

									get variant() {
										return $.get(appliedStyle).variant;
									}
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => SplitButton.SelectContent, ($$anchor, SplitButton_SelectContent) => {
								SplitButton_SelectContent($$anchor, {
									class: 'max-w-sm',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_6 = $.first_child(fragment_5);

										$.component(node_6, () => SplitButton.SelectGroup, ($$anchor, SplitButton_SelectGroup) => {
											SplitButton_SelectGroup($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_7 = $.first_child(fragment_6);

													$.each(node_7, 17, () => stylePresets, (preset) => preset.id, ($$anchor, preset) => {
														var fragment_7 = $.comment();
														var node_8 = $.first_child(fragment_7);

														$.component(node_8, () => SplitButton.SelectAction, ($$anchor, SplitButton_SelectAction) => {
															SplitButton_SelectAction($$anchor, {
																get value() {
																	return $.get(preset).id;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text();

																	$.template_effect(() => $.set_text(text_1, $.get(preset).label));
																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													});

													$.append($$anchor, fragment_6);
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