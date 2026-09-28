import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { List, Li } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`List item one <!>`, 1);
var root_2 = $.from_html(`List item two <!>`, 1);
var root_3 = $.from_html(`List item three <!>`, 1);

export default function UnorderedNested($$anchor) {
	List($$anchor, {
		tag: 'ul',
		class: 'space-y-4 text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Li(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root_1();
					var node_1 = $.sibling($.first_child(fragment_2));

					List(node_1, {
						tag: 'ol',
						class: 'mt-2 space-y-1 ps-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							Li(node_2, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('You might feel like you are being really "organized" o');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Li(node_3, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Nested navigation in UIs is a bad idea too, keep things as flat as possible.');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Li(node_4, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Nesting tons of folders in your source code is also not helpful.');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node, 2);

			Li(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_4 = root_2();
					var node_6 = $.sibling($.first_child(fragment_4));

					List(node_6, {
						tag: 'ol',
						class: 'mt-2 space-y-1 ps-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_7 = $.first_child(fragment_5);

							Li(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('I\'m not sure if we\'ll bother styling more than two levels deep.');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							Li(node_8, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Two is already too much, three is guaranteed to be a bad idea.');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Li(node_9, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('If you nest four levels deep you belong in prison.');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_5, 2);

			Li(node_10, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_6 = root_3();
					var node_11 = $.sibling($.first_child(fragment_6));

					List(node_11, {
						tag: 'ol',
						class: 'mt-2 space-y-1 ps-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_12 = $.first_child(fragment_7);

							Li(node_12, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Again please don\'t nest lists if you want');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_12, 2);

							Li(node_13, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Nobody wants to look at this.');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_14 = $.sibling(node_13, 2);

							Li(node_14, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('I\'m upset that we even have to bother styling this.');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}