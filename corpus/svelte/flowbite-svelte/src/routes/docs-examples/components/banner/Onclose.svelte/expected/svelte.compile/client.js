import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { Banner, P, Button } from "flowbite-svelte";

var root = $.from_html(`<div class="mb-3 flex items-center gap-3 text-sm text-gray-600"><span>Banner is hidden because you dismissed it earlier. Remove <code>announcement-example</code> from localStorage to show it again or click the reset button.</span> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Onclose($$anchor, $$props) {
	$.push($$props, true);

	function useDismissableBanner(storageKey) {
		let open = $.state(false);
		let hasSeen = $.state(false);

		onMount(() => {
			const exists = localStorage.getItem(storageKey);

			$.set(hasSeen, Boolean(exists), true);
			$.set(open, !exists);
		});

		function onclose(_event) {
			localStorage.setItem(storageKey, "true");
			$.set(open, false);
			$.set(hasSeen, true);
		}

		function reset() {
			localStorage.removeItem(storageKey);
			$.set(hasSeen, false);
			$.set(open, true // show banner again
			);
		}

		return {
			get open() {
				return $.get(open);
			},

			set open(value) {
				$.set(open, value, true);
			},

			get hasSeen() {
				return $.get(hasSeen);
			},
			onclose,
			reset
		};
	}

	const banner = useDismissableBanner("announcement-example");
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.sibling($.child(div), 2);

			Button(node_1, {
				size: 'xs',
				get onclick() {
					return banner.reset;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Reset');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (banner.hasSeen) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	Banner(node_2, {
		get onclose() {
			return banner.onclose;
		},

		get open() {
			return banner.open;
		},

		set open($$value) {
			banner.open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			P($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('This keeps announcement banners hidden after dismissal across page refreshes!');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}