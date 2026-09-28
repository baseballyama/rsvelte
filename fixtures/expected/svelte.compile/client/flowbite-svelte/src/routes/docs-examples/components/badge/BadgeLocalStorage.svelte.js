import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib";
import { Button } from "flowbite-svelte";
import { onMount } from "svelte";

var root = $.from_html(`<div class="mb-3 flex items-center gap-3 text-sm text-gray-600"><span>Badge is hidden because you dismissed it earlier. Remove <code></code> from localStorage or click Reset:</span> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function BadgeLocalStorage($$anchor, $$props) {
	$.push($$props, true);

	const STORAGE_KEY = "example-badge-hidden";
	let badgeVisible = $.state(true);
	let hasSeen = $.state(false);

	onMount(() => {
		const exists = localStorage.getItem(STORAGE_KEY);

		$.set(hasSeen, Boolean(exists), true);
		$.set(badgeVisible, !exists // hide if localStorage says so
		);
	});

	function dismiss() {
		localStorage.setItem(STORAGE_KEY, "true");
		$.set(badgeVisible, false);
		$.set(hasSeen, true);
	}

	function reset() {
		localStorage.removeItem(STORAGE_KEY);
		$.set(badgeVisible, true);
		$.set(hasSeen, false);
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var span = $.child(div);
			var code = $.sibling($.child(span));

			code.textContent = 'example-badge-hidden';
			$.next();
			$.reset(span);

			var node_1 = $.sibling(span, 2);

			Button(node_1, {
				size: 'xs',
				onclick: reset,
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
			if ($.get(hasSeen)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			Badge($$anchor, {
				dismissable: true,
				onclose: dismiss,
				color: 'primary',
				class: 'cursor-pointer',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Example badge (click × to dismiss)');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_2, ($$render) => {
			if ($.get(badgeVisible)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}