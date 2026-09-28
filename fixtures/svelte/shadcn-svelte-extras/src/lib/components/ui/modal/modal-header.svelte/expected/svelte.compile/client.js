import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useModalSub } from './modal.svelte.js';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import * as Drawer from '$lib/components/ui/drawer/index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'children']);

export default function Modal_header($$anchor, $$props) {
	$.push($$props, true);

	const modal = useModalSub();

	let ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Dialog.Header, ($$anchor, Dialog_Header) => {
				Dialog_Header($$anchor, $.spread_props(() => rest, {
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
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

			$.component(node_3, () => Drawer.Header, ($$anchor, Drawer_Header) => {
				Drawer_Header($$anchor, $.spread_props(() => rest, {
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
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