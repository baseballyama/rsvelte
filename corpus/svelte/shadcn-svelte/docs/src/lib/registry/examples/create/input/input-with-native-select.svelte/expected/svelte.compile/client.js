import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Input from "$lib/registry/ui/input/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-full gap-2"><!> <!></div>`);

export default function Input_with_native_select($$anchor) {
	Example($$anchor, {
		title: 'With Native Select',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			$.component(node, () => Input.Root, ($$anchor, Input_Root) => {
				Input_Root($$anchor, { type: 'tel', placeholder: '(555) 123-4567', class: 'flex-1' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
				NativeSelect_Root($$anchor, {
					value: '+1',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
							NativeSelect_Option($$anchor, {
								value: '+1',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('+1');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
							NativeSelect_Option_1($$anchor, {
								value: '+44',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('+44');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
							NativeSelect_Option_2($$anchor, {
								value: '+46',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('+46');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
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