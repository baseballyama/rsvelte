import * as $ from 'svelte/internal/server';
import { Accordion } from "bits-ui";

export default function Accordion_single_force_mount_test($$renderer, $$props) {
	let {
		disabled = false,
		items = [],
		value = "",
		withOpenCheck = false
	} = $$props;

	if (Accordion.Root) {
		$$renderer.push('<!--[-->');

		Accordion.Root($$renderer, {
			type: 'single',
			value,
			disabled,
			'data-testid': 'root',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { value, title, disabled, content, level } = each_array[$$index];

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value,
							disabled,
							'data-testid': `${$.stringify(value)}-item`,
							children: ($$renderer) => {
								if (Accordion.Header) {
									$$renderer.push('<!--[-->');

									Accordion.Header($$renderer, {
										level,
										'data-testid': `${$.stringify(value)}-header`,
										children: ($$renderer) => {
											if (Accordion.Trigger) {
												$$renderer.push('<!--[-->');

												Accordion.Trigger($$renderer, {
													disabled,
													'data-testid': `${$.stringify(value)}-trigger`,
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(title)}`);
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

								if (withOpenCheck) {
									$$renderer.push('<!--[0-->');

									{
										function child($$renderer, { props, open }) {
											if (open) {
												$$renderer.push(`<!--[0--><div${$.attributes({ ...props })}>${$.escape(content)}</div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										}

										if (Accordion.Content) {
											$$renderer.push('<!--[-->');

											Accordion.Content($$renderer, {
												'data-testid': `${$.stringify(value)}-content`,
												forceMount: true,
												child,
												$$slots: { child: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}
								} else {
									$$renderer.push('<!--[-1-->');

									{
										function child($$renderer, { props, open: _open }) {
											$$renderer.push(`<div${$.attributes({ ...props })}>${$.escape(content)}</div>`);
										}

										if (Accordion.Content) {
											$$renderer.push('<!--[-->');

											Accordion.Content($$renderer, {
												'data-testid': `${$.stringify(value)}-content`,
												forceMount: true,
												child,
												$$slots: { child: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
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