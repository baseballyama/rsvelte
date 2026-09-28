import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List, { Item, Meta, Label } from '@smui/list';
import Checkbox from '@smui/checkbox';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="svelte-1wd4xne"><!></div> <pre class="status svelte-1wd4xne"> </pre> <pre class="status svelte-1wd4xne"> </pre>`, 1);

export default function _Check($$anchor) {
	const binding_group = [];
	let selected = $.state($.proxy(['Tom Hanks']));
	let changeEvent = $.state(null);
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	List(node, {
		class: 'demo-list',
		checkList: true,
		onSMUIListSelectionChange: (event) => $.set(changeEvent, event, true),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Item(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Label(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Bruce Willis');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Meta(node_3, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								value: 'Bruce Willis',
								get group() {
									return $.get(selected);
								},

								set group($$value) {
									$.set(selected, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Item(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_5 = $.first_child(fragment_4);

					Label(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Tom Hanks');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Meta(node_6, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								value: 'Tom Hanks',
								get group() {
									return $.get(selected);
								},

								set group($$value) {
									$.set(selected, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_4, 2);

			Item(node_7, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_8 = $.first_child(fragment_6);

					Label(node_8, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Jack Nicholson');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Meta(node_9, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								value: 'Jack Nicholson',
								get group() {
									return $.get(selected);
								},

								set group($$value) {
									$.set(selected, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_7, 2);

			Item(node_10, {
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root();
					var node_11 = $.first_child(fragment_8);

					Label(node_11, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Leonardo DiCaprio');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Meta(node_12, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								value: 'Leonardo DiCaprio',
								get group() {
									return $.get(selected);
								},

								set group($$value) {
									$.set(selected, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_10, 2);

			Item(node_13, {
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();
					var node_14 = $.first_child(fragment_10);

					Label(node_14, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Matt Damon');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					Meta(node_15, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								value: 'Matt Damon',
								get group() {
									return $.get(selected);
								},

								set group($$value) {
									$.set(selected, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_5 = $.only_child(pre);
	var pre_1 = $.sibling(pre, 2);
	var text_6 = $.only_child(pre_1);

	$.template_effect(
		($0, $1) => {
			$.set_text(text_5, `Selected: ${$0 ?? ''}`);
			$.set_text(text_6, `Change Event Detail: ${$1 ?? ''}`);
		},
		[
			() => $.get(selected).join(', '),
			() => $.get(changeEvent)
				? JSON.stringify($.get(changeEvent).detail)
				: 'No change yet.'
		]
	);

	$.append($$anchor, fragment);
}