import * as $ from 'svelte/internal/server';
import { isCloud } from '$lib/system';
import IconAI from './icon/ai.svelte';
import { slide } from 'svelte/transition';
import { entityColumnSuggestions } from './store';
import { getTerminologies } from '$database/(entity)';
import { randomDataModalState } from '$database/store';
import { Button, InputTextarea, Seekbar } from '$lib/elements/forms';
import { Card, Layout, Selector, Typography } from '@appwrite.io/pink-svelte';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const {
			isModal = false,
			required = false,
			context = 'suggestions',
			showSampleCountPicker = false
		} = $$props;

		const featureActive = $.derived(() => isCloud);
		const { terminology } = getTerminologies();
		const type = terminology.type;
		const field = terminology.field.lower;
		const record = terminology.record.lower;
		const entity = terminology.entity.lower.singular;
		const isSchemaless = type === 'documentsdb' || type === 'vectorsdb';

		const title = $.derived(() => {
			switch (type) {
				default:

				case 'legacy':

				case 'tablesdb':
					return featureActive()
						? `Smart ${field.singular} suggestions`
						: `Smart ${field.singular} suggestions available on Cloud`;

				case 'documentsdb':

				case 'vectorsdb':
					return featureActive() ? `Sample Data` : `Sample Data available on Cloud`;
			}
		});

		const subtitle = $.derived(() => {
			if (featureActive()) {
				return isSchemaless
					? `Generate sample ${record.plural} based on your ${entity} name`
					: `Enable AI to suggest useful ${field.plural} based on your ${entity} name`;
			}

			return isSchemaless
				? `Sign up for Cloud to generate sample documents based on your ${entity} name`
				: `Sign up for Cloud to generate ${field.plural} based on your ${entity} name`;
		});

		function contextAndSeekbar(
			$$renderer,
			required = false,
			contextLabel = undefined,
			contextType = 'suggestions'
		) {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: featureActive() ? 'm' : 'l',
					style: 'padding-block-end: var(--gap-m);',
					children: ($$renderer) => {
						if (!required) {
							$$renderer.push('<!--[0-->');

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 's',
									direction: 'row',
									alignItems: 'flex-start',
									children: ($$renderer) => {
										IconAI($$renderer, {});
										$$renderer.push(`<!----> `);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'column',
												gap: 'none',
												children: ($$renderer) => {
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															variant: 'm-500',
															color: '--fgcolor-neutral-primary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(title())}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															color: '--fgcolor-neutral-secondary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(subtitle())}`);
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

										$$renderer.push(` `);

										if (featureActive() && !isModal) {
											$$renderer.push(`<!--[0--><div class="suggestions-switch svelte-14wp6wu">`);

											if (Selector.Switch) {
												$$renderer.push('<!--[-->');

												Selector.Switch($$renderer, {
													id: 'suggestions',
													label: undefined,
													get checked() {
														return $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).enabled;
													},

													set checked($$value) {
														$.store_mutate($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions, $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).enabled = $$value);
														$$settled = false;
													}
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</div>`);
										} else {
											$$renderer.push('<!--[-1-->');
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
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (!featureActive()) {
							$$renderer.push('<!--[0-->');

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											external: true,
											secondary: true,
											href: 'https://cloud.appwrite.io/register',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Sign up`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if ($.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).enabled && featureActive()) {
							$$renderer.push(`<!--[0--><div${$.attr_class('context-input svelte-14wp6wu', void 0, { 'required': required })}>`);

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'l',
									children: ($$renderer) => {
										InputTextarea($$renderer, {
											id: 'context',
											rows: 3,
											maxlength: 255,
											label: contextLabel,
											placeholder: `Optional: Add context to improve ${$.stringify(contextType)}`,
											get value() {
												return $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).context;
											},

											set value($$value) {
												$.store_mutate($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions, $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).context = $$value);
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										if (showSampleCountPicker) {
											$$renderer.push('<!--[0-->');

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													gap: 'xl',
													style: 'padding-inline: var(--space-4, 8px);',
													children: ($$renderer) => {
														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Select how many random documents to generate for testing.`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														Seekbar($$renderer, {
															max: 100,
															extraBlockStart: true,
															breakpointCount: 5,
															get value() {
																return $.store_get($$store_subs ??= {}, '$randomDataModalState', randomDataModalState).value;
															},

															set value($$value) {
																$.store_mutate($$store_subs ??= {}, '$randomDataModalState', randomDataModalState, $.store_get($$store_subs ??= {}, '$randomDataModalState', randomDataModalState).value = $$value);
																$$settled = false;
															}
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
										} else {
											$$renderer.push('<!--[-1-->');
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

							$$renderer.push(`</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
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
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (!required) {
				$$renderer.push('<!--[0-->');

				if (Card.Base) {
					$$renderer.push('<!--[-->');

					Card.Base($$renderer, {
						variant: 'secondary',
						radius: 's',
						padding: 'xs',
						children: ($$renderer) => {
							contextAndSeekbar($$renderer, false);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
				contextAndSeekbar($$renderer, true, 'Context', context);
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}