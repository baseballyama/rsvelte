import * as $ from 'svelte/internal/server';
import { Button, Checkbox, Paginate, Pagination, Radio, Selection } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = Array.from({ length: 5 }).map((_, i) => {
			return { id: i + 1 };
		});

		const data2 = Array.from({ length: 50 }).map((_, i) => {
			return { id: i + 1 };
		});

		$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Selection($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { selected, isSelected, toggleSelected }) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(data);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let d = each_array[$$index];

								$$renderer.push(`<div>`);

								Checkbox($$renderer, {
									checked: isSelected(d.id),
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(d.id)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							}

							$$renderer.push(`<!--]--> selected: ${$.escape(JSON.stringify(selected))}`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Initial selection</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Selection($$renderer, {
					initial: [1, 2, 3],
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { selected, isSelected, toggleSelected }) => {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(data);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let d = each_array_1[$$index_1];

								$$renderer.push(`<div>`);

								Checkbox($$renderer, {
									checked: isSelected(d.id),
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(d.id)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							}

							$$renderer.push(`<!--]--> selected: ${$.escape(JSON.stringify(selected))}`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Select all</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Selection($$renderer, {
					all: data.map((d) => d.id),
					children: $.invalid_default_snippet,
					$$slots: {
						default: (
							$$renderer,
							{
								isAnySelected,
								isAllSelected,
								toggleAll,
								selected,
								isSelected,
								toggleSelected
							}
						) => {
							Checkbox($$renderer, {
								checked: isAnySelected(),
								indeterminate: !isAllSelected(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Select all`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <!--[-->`);

							const each_array_2 = $.ensure_array_like(data);

							for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
								let d = each_array_2[$$index_2];

								$$renderer.push(`<div>`);

								Checkbox($$renderer, {
									checked: isSelected(d.id),
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(d.id)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							}

							$$renderer.push(`<!--]--> selected: ${$.escape(JSON.stringify(selected))}`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Select all (paginated)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Paginate($$renderer, {
					data: data2,
					perPage: 5,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { pagination, pageData }) => {
							Selection($$renderer, {
								all: pageData.map((d) => d.id),
								children: $.invalid_default_snippet,
								$$slots: {
									default: (
										$$renderer,
										{
											selected,
											isAnySelected,
											isAllSelected,
											toggleAll,
											isSelected,
											toggleSelected,
											clear
										}
									) => {
										Checkbox($$renderer, {
											checked: isAnySelected(),
											indeterminate: !isAllSelected(),
											children: ($$renderer) => {
												$$renderer.push(`<!---->Select all`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <!--[-->`);

										const each_array_3 = $.ensure_array_like(pageData);

										for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
											let d = each_array_3[$$index_3];

											$$renderer.push(`<div>`);

											Checkbox($$renderer, {
												checked: isSelected(d.id),
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(d.id)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></div>`);
										}

										$$renderer.push(`<!--]--> `);

										if (pageData.length > 0) {
											$$renderer.push('<!--[0-->');
											Pagination($$renderer, { pagination });
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> selected: ${$.escape(JSON.stringify(selected))} `);

										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->clear`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									}
								}
							});
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Single</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Selection($$renderer, {
					single: true,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { selected, toggleSelected }) => {
							$$renderer.push(`<!--[-->`);

							const each_array_4 = $.ensure_array_like(data);

							for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
								let d = each_array_4[$$index_4];

								$$renderer.push(`<div>`);

								Radio($$renderer, {
									group: selected,
									value: d.id,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(d.id)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							}

							$$renderer.push(`<!--]--> selected: ${$.escape(JSON.stringify(selected))}`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>change event</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Selection($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { selected, isSelected, toggleSelected }) => {
							$$renderer.push(`<!--[-->`);

							const each_array_5 = $.ensure_array_like(data);

							for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
								let d = each_array_5[$$index_5];

								$$renderer.push(`<div>`);

								Checkbox($$renderer, {
									checked: isSelected(d.id),
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(d.id)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							}

							$$renderer.push(`<!--]--> selected: ${$.escape(JSON.stringify(selected))}`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}