import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isPresetCode } from "shadcn-svelte/preset";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form><!> <div class="py-4"><!></div> <!></form>`);

export default function Open_preset($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, "Open Preset");
	const designSystem = useDesignSystem();
	let open = $.state(false);
	let input = $.state("");
	const PRESET_FLAG_PATTERN = /^--preset\b\s+(.+)$/i;

	const nextPreset = $.derived(() => {
		const trimmed = $.get(input).trim();

		if (!trimmed) return null;

		const preset = trimmed.match(PRESET_FLAG_PATTERN)?.[1]?.trim() ?? trimmed;

		return isPresetCode(preset) ? preset : null;
	});

	const isInvalid = $.derived(() => $.get(input).trim().length > 0 && $.get(nextPreset) === null);

	function handleSubmit(event) {
		event.preventDefault();

		if (!$.get(nextPreset)) return;

		designSystem.preset = $.get(nextPreset);
		$.set(open, false);
	}

	$.user_effect(() => {
		if (!$.get(open)) $.set(input, "");
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, label()));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						}));
					};

					let $0 = $.derived(() => cn("touch-manipulation bg-transparent! px-2! py-0! text-sm! transition-none select-none hover:bg-muted! pointer-coarse:h-10!", $$props.class));

					$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
						Dialog_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'dark',
						children: ($$anchor, $$slotProps) => {
							var form = root_1();
							var node_3 = $.child(form);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Open Preset');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Paste a preset code to load a saved configuration.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var div = $.sibling(node_3, 2);
							var node_6 = $.child(div);

							{
								let $0 = $.derived(() => $.get(isInvalid) || undefined);

								$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
									Field_Field($$anchor, {
										get 'data-invalid'() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_7 = $.first_child(fragment_5);

											$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
												Field_Label($$anchor, {
													for: 'preset-code',
													class: 'sr-only',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Preset code');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_7, 2);

											$.component(node_8, () => Field.Content, ($$anchor, Field_Content) => {
												Field_Content($$anchor, {
													children: ($$anchor, $$slotProps) => {
														Input($$anchor, {
															id: 'preset-code',
															placeholder: 'b2D0wqNxT or --preset b2D0wqNxT',
															autocapitalize: 'none',
															autocorrect: 'off',
															spellcheck: false,
															get 'aria-invalid'() {
																return $.get(isInvalid);
															},
															class: 'h-10 md:h-8',
															get value() {
																return $.get(input);
															},

															set value($$value) {
																$.set(input, $$value, true);
															}
														});
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});
							}

							$.reset(div);

							var node_9 = $.sibling(div, 2);

							$.component(node_9, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root();
										var node_10 = $.first_child(fragment_7);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props(props, {
													variant: 'outline',
													type: 'button',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('Cancel');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_10, () => Dialog.Close, ($$anchor, Dialog_Close) => {
												Dialog_Close($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_11 = $.sibling(node_10, 2);

										{
											let $0 = $.derived(() => !$.get(nextPreset));

											Button(node_11, {
												type: 'submit',
												get disabled() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Open');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										}

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form);
							$.event('submit', form, handleSubmit);
							$.append($$anchor, form);
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
	$.pop();
}