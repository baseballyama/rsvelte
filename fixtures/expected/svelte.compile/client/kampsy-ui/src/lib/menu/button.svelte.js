import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/button/button.svelte";
import { getContext } from "svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);

export default function Button_1($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const rootState = getContext("menu");
	let buttonElement = $.state(void 0);

	$.user_effect(() => {
		if ($.get(buttonElement)) {
			if (rootState.getIsActive()) {
				$.get(buttonElement).setAttribute("aria-expanded", "true");
			} else {
				$.get(buttonElement).setAttribute("aria-expanded", "false");
			}
		}
	});

	const toogle = (evt) => {
		const target = evt.currentTarget;
		const position = target.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const positionFromTop = position.top;
		const positionFromBottom = viewportHeight - position.bottom;

		if (positionFromTop > positionFromBottom) {
			rootState.setContentPosition(`bottom-[112%]`);
			rootState.setTransY(10);
		} else {
			rootState.setContentPosition(`top-[112%]`);
			rootState.setTransY(-10);
		}

		rootState.setIsActive(!rootState.getIsActive());
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, $.spread_props(() => rest, {
				onclick: toogle,
				get buttonElement() {
					return $.get(buttonElement);
				},

				set buttonElement($$value) {
					$.set(buttonElement, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.children);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			}));
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}