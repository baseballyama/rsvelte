import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List, { Item, Graphic, Label } from '@smui/list';
import Radio from '@smui/radio';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="svelte-11gtsfb"><!></div> <pre class="status svelte-11gtsfb"> </pre>`, 1);

export default function _Radio($$anchor) {
	const binding_group = [];
	let selected = $.state('Tom Hanks');
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	List(node, {
		class: 'demo-list',
		radioList: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Item(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Graphic(node_2, {
						children: ($$anchor, $$slotProps) => {
							Radio($$anchor, {
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

					var node_3 = $.sibling(node_2, 2);

					Label(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Bruce Willis');

							$.append($$anchor, text);
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

					Graphic(node_5, {
						children: ($$anchor, $$slotProps) => {
							Radio($$anchor, {
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

					var node_6 = $.sibling(node_5, 2);

					Label(node_6, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Tom Hanks');

							$.append($$anchor, text_1);
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

					Graphic(node_8, {
						children: ($$anchor, $$slotProps) => {
							Radio($$anchor, {
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

					var node_9 = $.sibling(node_8, 2);

					Label(node_9, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Jack Nicholson');

							$.append($$anchor, text_2);
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

					Graphic(node_11, {
						children: ($$anchor, $$slotProps) => {
							Radio($$anchor, {
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

					var node_12 = $.sibling(node_11, 2);

					Label(node_12, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Leonardo DiCaprio');

							$.append($$anchor, text_3);
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

					Graphic(node_14, {
						children: ($$anchor, $$slotProps) => {
							Radio($$anchor, {
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

					var node_15 = $.sibling(node_14, 2);

					Label(node_15, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Matt Damon');

							$.append($$anchor, text_4);
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

	$.template_effect(() => $.set_text(text_5, `Selected: ${$.get(selected) ?? ''}`));
	$.append($$anchor, fragment);
}