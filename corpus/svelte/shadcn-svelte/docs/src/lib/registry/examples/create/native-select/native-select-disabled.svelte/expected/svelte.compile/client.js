import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Native_select_disabled($$anchor) {
	Example($$anchor, {
		title: 'Disabled',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
				NativeSelect_Root($$anchor, {
					disabled: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
							NativeSelect_Option($$anchor, {
								value: '',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Disabled');

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

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}