import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Native_select_sizes($$anchor) {
	Example($$anchor, {
		title: 'Sizes',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			$.component(node, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
				NativeSelect_Root($$anchor, {
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
							NativeSelect_Option($$anchor, {
								value: '',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Select a fruit');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
							NativeSelect_Option_1($$anchor, {
								value: 'apple',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Apple');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
							NativeSelect_Option_2($$anchor, {
								value: 'banana',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Banana');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_3) => {
							NativeSelect_Option_3($$anchor, {
								value: 'blueberry',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Blueberry');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node, 2);

			$.component(node_5, () => NativeSelect.Root, ($$anchor, NativeSelect_Root_1) => {
				NativeSelect_Root_1($$anchor, {
					size: 'default',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_6 = $.first_child(fragment_2);

						$.component(node_6, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_4) => {
							NativeSelect_Option_4($$anchor, {
								value: '',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Select a fruit');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_5) => {
							NativeSelect_Option_5($$anchor, {
								value: 'apple',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Apple');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_6) => {
							NativeSelect_Option_6($$anchor, {
								value: 'banana',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Banana');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_7) => {
							NativeSelect_Option_7($$anchor, {
								value: 'blueberry',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Blueberry');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}