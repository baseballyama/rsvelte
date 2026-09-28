import * as $ from 'svelte/internal/server';
import { isPresetCode } from "shadcn-svelte/preset";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { cn } from "$lib/utils.js";

export default function Open_preset($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, label = "Open Preset" } = $$props;
		const designSystem = useDesignSystem();
		let open = false;
		let input = "";
		const PRESET_FLAG_PATTERN = /^--preset\b\s+(.+)$/i;

		const nextPreset = $.derived(() => {
			const trimmed = input.trim();

			if (!trimmed) return null;

			const preset = trimmed.match(PRESET_FLAG_PATTERN)?.[1]?.trim() ?? trimmed;

			return isPresetCode(preset) ? preset : null;
		});

		const isInvalid = $.derived(() => input.trim().length > 0 && nextPreset() === null);

		function handleSubmit(event) {
			event.preventDefault();

			if (!nextPreset()) return;

			designSystem.preset = nextPreset();
			open = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'outline',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(label)}`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Dialog.Trigger) {
								$$renderer.push('<!--[-->');

								Dialog.Trigger($$renderer, {
									class: cn("touch-manipulation bg-transparent! px-2! py-0! text-sm! transition-none select-none hover:bg-muted! pointer-coarse:h-10!", className),
									child,
									$$slots: { child: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'dark',
								children: ($$renderer) => {
									$$renderer.push(`<form>`);

									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Open Preset`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Paste a preset code to load a saved configuration.`);
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

									$$renderer.push(` <div class="py-4">`);

									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											'data-invalid': isInvalid() || undefined,
											children: ($$renderer) => {
												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'preset-code',
														class: 'sr-only',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Preset code`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Content) {
													$$renderer.push('<!--[-->');

													Field.Content($$renderer, {
														children: ($$renderer) => {
															Input($$renderer, {
																id: 'preset-code',
																placeholder: 'b2D0wqNxT or --preset b2D0wqNxT',
																autocapitalize: 'none',
																autocorrect: 'off',
																spellcheck: false,
																'aria-invalid': isInvalid(),
																class: 'h-10 md:h-8',
																get value() {
																	return input;
																},

																set value($$value) {
																	input = $$value;
																	$$settled = false;
																}
															});
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

									$$renderer.push(`</div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															props,
															{
																variant: 'outline',
																type: 'button',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Cancel`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (Dialog.Close) {
														$$renderer.push('<!--[-->');
														Dialog.Close($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												Button($$renderer, {
													type: 'submit',
													disabled: !nextPreset(),
													children: ($$renderer) => {
														$$renderer.push(`<!---->Open`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</form>`);
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