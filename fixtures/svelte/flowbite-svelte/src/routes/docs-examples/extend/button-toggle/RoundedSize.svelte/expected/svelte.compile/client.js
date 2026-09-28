import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div><h3 class="mb-2 text-lg font-medium dark:text-white">Rounded size: sm</h3> <!></div> <div><h3 class="mb-2 text-lg font-medium dark:text-white">Rounded size: md</h3> <!></div> <div><h3 class="mb-2 text-lg font-medium dark:text-white">Rounded size: lg</h3> <!></div> <div><h3 class="mb-2 text-lg font-medium dark:text-white">Rounded size: xl</h3> <!></div> <div><h3 class="mb-2 text-lg font-medium dark:text-white">Rounded size: full</h3> <!></div>`, 1);

export default function RoundedSize($$anchor) {
	let singleValue = $.state(null);

	function handleSingleSelect(value) {
		if (typeof value === "string" || value === null) {
			$.set(singleValue, value, true);
			console.log("Single selection:", value);
		}
	}

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	ButtonToggleGroup(node, {
		onSelect: handleSingleSelect,
		roundedSize: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_1, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('One');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_2, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Two');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_3, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Three');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.sibling($.child(div_1), 2);

	ButtonToggleGroup(node_4, {
		onSelect: handleSingleSelect,
		roundedSize: 'md',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_5, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('One');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			}

			var node_6 = $.sibling(node_5, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_6, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Two');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			}

			var node_7 = $.sibling(node_6, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_7, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Three');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_8 = $.sibling($.child(div_2), 2);

	ButtonToggleGroup(node_8, {
		onSelect: handleSingleSelect,
		roundedSize: 'lg',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_9 = $.first_child(fragment_3);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_9, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('One');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});
			}

			var node_10 = $.sibling(node_9, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_10, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Two');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});
			}

			var node_11 = $.sibling(node_10, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_11, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text('Three');

						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_12 = $.sibling($.child(div_3), 2);

	ButtonToggleGroup(node_12, {
		onSelect: handleSingleSelect,
		roundedSize: 'xl',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_13 = $.first_child(fragment_4);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_13, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text('One');

						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});
			}

			var node_14 = $.sibling(node_13, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_14, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text('Two');

						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});
			}

			var node_15 = $.sibling(node_14, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_15, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text('Three');

						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_16 = $.sibling($.child(div_4), 2);

	ButtonToggleGroup(node_16, {
		onSelect: handleSingleSelect,
		roundedSize: 'full',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_17 = $.first_child(fragment_5);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_17, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_12 = $.text('One');

						$.append($$anchor, text_12);
					},
					$$slots: { default: true }
				});
			}

			var node_18 = $.sibling(node_17, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_18, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_13 = $.text('Two');

						$.append($$anchor, text_13);
					},
					$$slots: { default: true }
				});
			}

			var node_19 = $.sibling(node_18, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_19, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_14 = $.text('Three');

						$.append($$anchor, text_14);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.append($$anchor, fragment);
}