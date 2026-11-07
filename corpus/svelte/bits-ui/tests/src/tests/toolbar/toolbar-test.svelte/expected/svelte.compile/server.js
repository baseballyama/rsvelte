import * as $ from 'svelte/internal/server';
import { Toolbar } from "bits-ui";

export default function Toolbar_test($$renderer, $$props) {
	let { multipleProps, singleProps, $$slots, $$events, ...restProps } = $$props;
	let style = ["bold"];
	let align = "";
	let clicked = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main><button aria-label="style" data-testid="style-binding">${$.escape(style)}</button> <button aria-label="align" data-testid="align-binding">${$.escape(align)}</button> <span data-testid="clicked-binding">${$.escape(clicked)}</span> `);

		if (Toolbar.Root) {
			$$renderer.push('<!--[-->');

			Toolbar.Root($$renderer, $.spread_props([
				{ 'data-testid': 'root' },
				restProps,
				{
					children: ($$renderer) => {
						if (Toolbar.Group) {
							$$renderer.push('<!--[-->');

							Toolbar.Group($$renderer, $.spread_props([
								{ 'data-testid': 'group-multiple', type: 'multiple' },
								multipleProps,
								{
									get value() {
										return style;
									},

									set value($$value) {
										style = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										if (Toolbar.GroupItem) {
											$$renderer.push('<!--[-->');

											Toolbar.GroupItem($$renderer, {
												'data-testid': 'group-multiple-bold',
												'aria-label': 'toggle bold',
												value: 'bold',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Bold`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Toolbar.GroupItem) {
											$$renderer.push('<!--[-->');

											Toolbar.GroupItem($$renderer, {
												'data-testid': 'group-multiple-italic',
												'aria-label': 'toggle italic',
												value: 'italic',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Italic`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Toolbar.GroupItem) {
											$$renderer.push('<!--[-->');

											Toolbar.GroupItem($$renderer, {
												'data-testid': 'group-multiple-strikethrough',
												'aria-label': 'toggle strikethrough',
												value: 'strikethrough',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Strikethrough`);
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
								}
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Toolbar.Group) {
							$$renderer.push('<!--[-->');

							Toolbar.Group($$renderer, $.spread_props([
								{ 'data-testid': 'group-single', type: 'single' },
								singleProps,
								{
									get value() {
										return align;
									},

									set value($$value) {
										align = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										if (Toolbar.GroupItem) {
											$$renderer.push('<!--[-->');

											Toolbar.GroupItem($$renderer, {
												'data-testid': 'group-single-left',
												'aria-label': 'align left',
												value: 'left',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Left`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Toolbar.GroupItem) {
											$$renderer.push('<!--[-->');

											Toolbar.GroupItem($$renderer, {
												'data-testid': 'group-single-center',
												'aria-label': 'align center',
												value: 'center',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Center`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Toolbar.GroupItem) {
											$$renderer.push('<!--[-->');

											Toolbar.GroupItem($$renderer, {
												'data-testid': 'group-single-right',
												'aria-label': 'align right',
												value: 'right',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Right`);
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
								}
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Toolbar.Link) {
							$$renderer.push('<!--[-->');

							Toolbar.Link($$renderer, {
								'data-testid': 'link',
								onclick: () => clicked = "link",
								children: ($$renderer) => {
									$$renderer.push(`<!---->Edited 2 hours ago`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Toolbar.Button) {
							$$renderer.push('<!--[-->');

							Toolbar.Button($$renderer, {
								'data-testid': 'button',
								onclick: () => clicked = "button",
								children: ($$renderer) => {
									$$renderer.push(`<!---->Save`);
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
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}