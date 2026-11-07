import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import * as Drawer from '$lib/components/ui/drawer/index.js';
import { useModal } from './modal.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'open', 'children']);

export default function Modal($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		rest = $.rest_props($$props, rest_excludes);

	const modal = useModal();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, $.spread_props(() => rest, {
					get open() {
						return open();
					},

					set open($$value) {
						open($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.snippet(node_2, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			$.component(node_3, () => Drawer.Root, ($$anchor, Drawer_Root) => {
				Drawer_Root($$anchor, $.spread_props(() => rest, {
					get open() {
						return open();
					},

					set open($$value) {
						open($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_4 = $.first_child(fragment_4);

						$.snippet(node_4, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				}));
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if (modal.view === 'desktop') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}