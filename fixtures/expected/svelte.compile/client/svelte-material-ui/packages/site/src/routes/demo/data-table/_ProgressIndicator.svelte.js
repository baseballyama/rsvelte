import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
import LinearProgress from '@smui/linear-progress';
import Button from '@smui/button';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div style="margin-bottom: 1em;"><!></div> <!>`, 1);

export default function _ProgressIndicator($$anchor, $$props) {
	$.push($$props, true);

	let items = $.state($.proxy([]));
	let loaded = $.state(false);

	loadThings(false);

	function loadThings(wait) {
		if (typeof fetch !== 'undefined') {
			$.set(loaded, false);

			fetch('https://gist.githubusercontent.com/hperrin/e24a4ebd9afdf2a8c283338ae5160a62/raw/dcbf8e6382db49b0dcab70b22f56b1cc444f26d4/users.json').then((response) => response.json()).then((json) => setTimeout(
				() => {
					$.set(items, json, true);
					$.set(loaded, true);
				},
				// Simulate a long load time.
				wait ? 2000 : 0
			));
		}
	}

	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => loadThings(true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Do Pretend Loading');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		const progress = ($$anchor) => {
			LinearProgress($$anchor, {
				indeterminate: true,
				get closed() {
					return $.get(loaded);
				},
				'aria-label': 'Data is being loaded...'
			});
		};

		DataTable(node_1, {
			'table$aria-label': 'User list',
			style: 'width: 100%;',
			progress,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_2 = $.first_child(fragment_2);

				Head(node_2, {
					children: ($$anchor, $$slotProps) => {
						Row($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_3 = $.first_child(fragment_4);

								Cell(node_3, {
									numeric: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('ID');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								var node_4 = $.sibling(node_3, 2);

								Cell(node_4, {
									style: 'width: 100%;',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Name');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});

								var node_5 = $.sibling(node_4, 2);

								Cell(node_5, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Username');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								Cell(node_6, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Email');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_2, 2);

				Body(node_7, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_8 = $.first_child(fragment_5);

						$.each(node_8, 17, () => $.get(items), (item) => item.id, ($$anchor, item) => {
							Row($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root();
									var node_9 = $.first_child(fragment_7);

									Cell(node_9, {
										numeric: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text();

											$.template_effect(() => $.set_text(text_5, $.get(item).id));
											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									Cell(node_10, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text();

											$.template_effect(() => $.set_text(text_6, $.get(item).name));
											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var node_11 = $.sibling(node_10, 2);

									Cell(node_11, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text();

											$.template_effect(() => $.set_text(text_7, $.get(item).username));
											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_11, 2);

									Cell(node_12, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text();

											$.template_effect(() => $.set_text(text_8, $.get(item).email));
											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { progress: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}