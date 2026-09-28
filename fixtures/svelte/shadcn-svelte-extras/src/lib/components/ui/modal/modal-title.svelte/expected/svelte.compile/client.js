import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useModalSub } from './modal.svelte.js';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import * as Drawer from '$lib/components/ui/drawer/index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Modal_title($$anchor, $$props) {
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

			$.component(node_1, () => Dialog.Title, ($$anchor, Dialog_Title) => {
				Dialog_Title($$anchor, $.spread_props(() => rest, {
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}));
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, () => Drawer.Title, ($$anchor, Drawer_Title) => {
				Drawer_Title($$anchor, $.spread_props(() => rest, {
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}));
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (modal.view === 'desktop') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}