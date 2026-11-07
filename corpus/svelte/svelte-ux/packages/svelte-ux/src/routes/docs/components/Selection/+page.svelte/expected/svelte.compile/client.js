import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Checkbox, Paginate, Pagination, Radio, Selection } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <!> `, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Initial selection</h2> <!> <h2>Select all</h2> <!> <h2>Select all (paginated)</h2> <!> <h2>Single</h2> <!> <h2>change event</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const data = Array.from({ length: 5 }).map((_, i) => {
		return { id: i + 1 };
	});

	const data2 = Array.from({ length: 50 }).map((_, i) => {
		return { id: i + 1 };
	});

	var fragment = root_4();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Selection($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const selected = $.derived(() => $$slotProps.selected);
						const isSelected = $.derived(() => $$slotProps.isSelected);
						const toggleSelected = $.derived(() => $$slotProps.toggleSelected);
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 17, () => data, $.index, ($$anchor, d) => {
							var div = root();
							var node_2 = $.child(div);

							{
								let $0 = $.derived(() => $.get(isSelected)($.get(d).id));

								Checkbox(node_2, {
									get checked() {
										return $.get($0);
									},
									$$events: { change: () => $.get(toggleSelected)($.get(d).id) },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(d).id));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div);
							$.append($$anchor, div);
						});

						var text_1 = $.sibling(node_1);

						$.template_effect(($0) => $.set_text(text_1, ` selected: ${$0 ?? ''}`), [() => JSON.stringify($.get(selected))]);
						$.append($$anchor, fragment_2);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			Selection($$anchor, {
				initial: [1, 2, 3],
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const selected = $.derived(() => $$slotProps.selected);
						const isSelected = $.derived(() => $$slotProps.isSelected);
						const toggleSelected = $.derived(() => $$slotProps.toggleSelected);
						var fragment_5 = root_1();
						var node_4 = $.first_child(fragment_5);

						$.each(node_4, 17, () => data, $.index, ($$anchor, d) => {
							var div_1 = root();
							var node_5 = $.child(div_1);

							{
								let $0 = $.derived(() => $.get(isSelected)($.get(d).id));

								Checkbox(node_5, {
									get checked() {
										return $.get($0);
									},
									$$events: { change: () => $.get(toggleSelected)($.get(d).id) },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, $.get(d).id));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_1);
							$.append($$anchor, div_1);
						});

						var text_3 = $.sibling(node_4);

						$.template_effect(($0) => $.set_text(text_3, ` selected: ${$0 ?? ''}`), [() => JSON.stringify($.get(selected))]);
						$.append($$anchor, fragment_5);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => data.map((d) => d.id));

				Selection($$anchor, {
					get all() {
						return $.get($0);
					},
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							const isAnySelected = $.derived(() => $$slotProps.isAnySelected);
							const isAllSelected = $.derived(() => $$slotProps.isAllSelected);
							const toggleAll = $.derived(() => $$slotProps.toggleAll);
							const selected = $.derived(() => $$slotProps.selected);
							const isSelected = $.derived(() => $$slotProps.isSelected);
							const toggleSelected = $.derived(() => $$slotProps.toggleSelected);
							var fragment_8 = root_2();
							var node_7 = $.first_child(fragment_8);

							{
								let $0 = $.derived(() => $.get(isAnySelected)());
								let $1 = $.derived(() => !$.get(isAllSelected)());

								Checkbox(node_7, {
									get checked() {
										return $.get($0);
									},

									get indeterminate() {
										return $.get($1);
									},
									$$events: { change: () => $.get(toggleAll)() },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Select all');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							}

							var node_8 = $.sibling(node_7, 2);

							$.each(node_8, 17, () => data, $.index, ($$anchor, d) => {
								var div_2 = root();
								var node_9 = $.child(div_2);

								{
									let $0 = $.derived(() => $.get(isSelected)($.get(d).id));

									Checkbox(node_9, {
										get checked() {
											return $.get($0);
										},
										$$events: { change: () => $.get(toggleSelected)($.get(d).id) },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text();

											$.template_effect(() => $.set_text(text_5, $.get(d).id));
											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});
								}

								$.reset(div_2);
								$.append($$anchor, div_2);
							});

							var text_6 = $.sibling(node_8);

							$.template_effect(($0) => $.set_text(text_6, ` selected: ${$0 ?? ''}`), [() => JSON.stringify($.get(selected))]);
							$.append($$anchor, fragment_8);
						}
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_6, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			Paginate($$anchor, {
				get data() {
					return data2;
				},
				perPage: 5,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const pagination = $.derived(() => $$slotProps.pagination);
						const pageData = $.derived(() => $$slotProps.pageData);

						{
							let $0 = $.derived(() => $.get(pageData).map((d) => d.id));

							Selection($$anchor, {
								get all() {
									return $.get($0);
								},
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$anchor, $$slotProps) => {
										const selected = $.derived(() => $$slotProps.selected);
										const isAnySelected = $.derived(() => $$slotProps.isAnySelected);
										const isAllSelected = $.derived(() => $$slotProps.isAllSelected);
										const toggleAll = $.derived(() => $$slotProps.toggleAll);
										const isSelected = $.derived(() => $$slotProps.isSelected);
										const toggleSelected = $.derived(() => $$slotProps.toggleSelected);
										const clear = $.derived(() => $$slotProps.clear);
										var fragment_12 = root_3();
										var node_11 = $.first_child(fragment_12);

										{
											let $0 = $.derived(() => $.get(isAnySelected)());
											let $1 = $.derived(() => !$.get(isAllSelected)());

											Checkbox(node_11, {
												get checked() {
													return $.get($0);
												},

												get indeterminate() {
													return $.get($1);
												},
												$$events: { change: () => $.get(toggleAll)() },
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Select all');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										}

										var node_12 = $.sibling(node_11, 2);

										$.each(node_12, 17, () => $.get(pageData), $.index, ($$anchor, d) => {
											var div_3 = root();
											var node_13 = $.child(div_3);

											{
												let $0 = $.derived(() => $.get(isSelected)($.get(d).id));

												Checkbox(node_13, {
													get checked() {
														return $.get($0);
													},
													$$events: { change: () => $.get(toggleSelected)($.get(d).id) },
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text();

														$.template_effect(() => $.set_text(text_8, $.get(d).id));
														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});
											}

											$.reset(div_3);
											$.append($$anchor, div_3);
										});

										var node_14 = $.sibling(node_12, 2);

										{
											var consequent = ($$anchor) => {
												Pagination($$anchor, {
													get pagination() {
														return $.get(pagination);
													}
												});
											};

											$.if(node_14, ($$render) => {
												if ($.get(pageData).length > 0) $$render(consequent);
											});
										}

										var text_9 = $.sibling(node_14);
										var node_15 = $.sibling(text_9);

										Button(node_15, {
											$$events: { click: () => $.get(clear)() },
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('clear');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});

										$.template_effect(($0) => $.set_text(text_9, ` selected: ${$0 ?? ''} `), [() => JSON.stringify($.get(selected))]);
										$.append($$anchor, fragment_12);
									}
								}
							});
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_10, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			Selection($$anchor, {
				single: true,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const selected = $.derived(() => $$slotProps.selected);
						const toggleSelected = $.derived(() => $$slotProps.toggleSelected);
						var fragment_16 = root_1();
						var node_17 = $.first_child(fragment_16);

						$.each(node_17, 17, () => data, $.index, ($$anchor, d) => {
							var div_4 = root();
							var node_18 = $.child(div_4);

							Radio(node_18, {
								get group() {
									return $.get(selected);
								},

								get value() {
									return $.get(d).id;
								},
								$$events: { change: () => $.get(toggleSelected)($.get(d).id) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text();

									$.template_effect(() => $.set_text(text_11, $.get(d).id));
									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							$.reset(div_4);
							$.append($$anchor, div_4);
						});

						var text_12 = $.sibling(node_17);

						$.template_effect(($0) => $.set_text(text_12, ` selected: ${$0 ?? ''}`), [() => JSON.stringify($.get(selected))]);
						$.append($$anchor, fragment_16);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_16, 4);

	Preview(node_19, {
		children: ($$anchor, $$slotProps) => {
			Selection($$anchor, {
				$$events: { change: (e) => console.log(e.detail) },
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const selected = $.derived(() => $$slotProps.selected);
						const isSelected = $.derived(() => $$slotProps.isSelected);
						const toggleSelected = $.derived(() => $$slotProps.toggleSelected);
						var fragment_19 = root_1();
						var node_20 = $.first_child(fragment_19);

						$.each(node_20, 17, () => data, $.index, ($$anchor, d) => {
							var div_5 = root();
							var node_21 = $.child(div_5);

							{
								let $0 = $.derived(() => $.get(isSelected)($.get(d).id));

								Checkbox(node_21, {
									get checked() {
										return $.get($0);
									},
									$$events: { change: () => $.get(toggleSelected)($.get(d).id) },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_13 = $.text();

										$.template_effect(() => $.set_text(text_13, $.get(d).id));
										$.append($$anchor, text_13);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_5);
							$.append($$anchor, div_5);
						});

						var text_14 = $.sibling(node_20);

						$.template_effect(($0) => $.set_text(text_14, ` selected: ${$0 ?? ''}`), [() => JSON.stringify($.get(selected))]);
						$.append($$anchor, fragment_19);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}