import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function GroupColor($$anchor) {
	let singleValue = $.state(null);

	function handleSingleSelect(value) {
		if (typeof value === "string" || value === null) {
			$.set(singleValue, value, true);
			console.log("Single selection:", value);
		}
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	ButtonToggleGroup(node, {
		color: 'secondary',
		onSelect: handleSingleSelect,
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

	var node_4 = $.sibling(node, 2);

	ButtonToggleGroup(node_4, {
		color: 'gray',
		onSelect: handleSingleSelect,
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

	var node_8 = $.sibling(node_4, 2);

	ButtonToggleGroup(node_8, {
		color: 'red',
		onSelect: handleSingleSelect,
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

	var node_12 = $.sibling(node_8, 2);

	ButtonToggleGroup(node_12, {
		color: 'orange',
		onSelect: handleSingleSelect,
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

	var node_16 = $.sibling(node_12, 2);

	ButtonToggleGroup(node_16, {
		color: 'amber',
		onSelect: handleSingleSelect,
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

	var node_20 = $.sibling(node_16, 2);

	ButtonToggleGroup(node_20, {
		color: 'yellow',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_21 = $.first_child(fragment_6);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_21, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_15 = $.text('One');

						$.append($$anchor, text_15);
					},
					$$slots: { default: true }
				});
			}

			var node_22 = $.sibling(node_21, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_22, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_16 = $.text('Two');

						$.append($$anchor, text_16);
					},
					$$slots: { default: true }
				});
			}

			var node_23 = $.sibling(node_22, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_23, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_17 = $.text('Three');

						$.append($$anchor, text_17);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_20, 2);

	ButtonToggleGroup(node_24, {
		color: 'lime',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root();
			var node_25 = $.first_child(fragment_7);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_25, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_18 = $.text('One');

						$.append($$anchor, text_18);
					},
					$$slots: { default: true }
				});
			}

			var node_26 = $.sibling(node_25, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_26, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_19 = $.text('Two');

						$.append($$anchor, text_19);
					},
					$$slots: { default: true }
				});
			}

			var node_27 = $.sibling(node_26, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_27, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_20 = $.text('Three');

						$.append($$anchor, text_20);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_28 = $.sibling(node_24, 2);

	ButtonToggleGroup(node_28, {
		color: 'green',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root();
			var node_29 = $.first_child(fragment_8);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_29, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_21 = $.text('One');

						$.append($$anchor, text_21);
					},
					$$slots: { default: true }
				});
			}

			var node_30 = $.sibling(node_29, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_30, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_22 = $.text('Two');

						$.append($$anchor, text_22);
					},
					$$slots: { default: true }
				});
			}

			var node_31 = $.sibling(node_30, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_31, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_23 = $.text('Three');

						$.append($$anchor, text_23);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_32 = $.sibling(node_28, 2);

	ButtonToggleGroup(node_32, {
		color: 'emerald',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root();
			var node_33 = $.first_child(fragment_9);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_33, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_24 = $.text('One');

						$.append($$anchor, text_24);
					},
					$$slots: { default: true }
				});
			}

			var node_34 = $.sibling(node_33, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_34, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_25 = $.text('Two');

						$.append($$anchor, text_25);
					},
					$$slots: { default: true }
				});
			}

			var node_35 = $.sibling(node_34, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_35, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_26 = $.text('Three');

						$.append($$anchor, text_26);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_36 = $.sibling(node_32, 2);

	ButtonToggleGroup(node_36, {
		color: 'teal',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root();
			var node_37 = $.first_child(fragment_10);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_37, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_27 = $.text('One');

						$.append($$anchor, text_27);
					},
					$$slots: { default: true }
				});
			}

			var node_38 = $.sibling(node_37, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_38, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_28 = $.text('Two');

						$.append($$anchor, text_28);
					},
					$$slots: { default: true }
				});
			}

			var node_39 = $.sibling(node_38, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_39, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_29 = $.text('Three');

						$.append($$anchor, text_29);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var node_40 = $.sibling(node_36, 2);

	ButtonToggleGroup(node_40, {
		color: 'cyan',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root();
			var node_41 = $.first_child(fragment_11);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_41, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_30 = $.text('One');

						$.append($$anchor, text_30);
					},
					$$slots: { default: true }
				});
			}

			var node_42 = $.sibling(node_41, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_42, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_31 = $.text('Two');

						$.append($$anchor, text_31);
					},
					$$slots: { default: true }
				});
			}

			var node_43 = $.sibling(node_42, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_43, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_32 = $.text('Three');

						$.append($$anchor, text_32);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	var node_44 = $.sibling(node_40, 2);

	ButtonToggleGroup(node_44, {
		color: 'sky',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root();
			var node_45 = $.first_child(fragment_12);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_45, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_33 = $.text('One');

						$.append($$anchor, text_33);
					},
					$$slots: { default: true }
				});
			}

			var node_46 = $.sibling(node_45, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_46, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_34 = $.text('Two');

						$.append($$anchor, text_34);
					},
					$$slots: { default: true }
				});
			}

			var node_47 = $.sibling(node_46, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_47, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_35 = $.text('Three');

						$.append($$anchor, text_35);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	var node_48 = $.sibling(node_44, 2);

	ButtonToggleGroup(node_48, {
		color: 'blue',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root();
			var node_49 = $.first_child(fragment_13);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_49, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_36 = $.text('One');

						$.append($$anchor, text_36);
					},
					$$slots: { default: true }
				});
			}

			var node_50 = $.sibling(node_49, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_50, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_37 = $.text('Two');

						$.append($$anchor, text_37);
					},
					$$slots: { default: true }
				});
			}

			var node_51 = $.sibling(node_50, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_51, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_38 = $.text('Three');

						$.append($$anchor, text_38);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	var node_52 = $.sibling(node_48, 2);

	ButtonToggleGroup(node_52, {
		color: 'indigo',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root();
			var node_53 = $.first_child(fragment_14);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_53, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_39 = $.text('One');

						$.append($$anchor, text_39);
					},
					$$slots: { default: true }
				});
			}

			var node_54 = $.sibling(node_53, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_54, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_40 = $.text('Two');

						$.append($$anchor, text_40);
					},
					$$slots: { default: true }
				});
			}

			var node_55 = $.sibling(node_54, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_55, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_41 = $.text('Three');

						$.append($$anchor, text_41);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	var node_56 = $.sibling(node_52, 2);

	ButtonToggleGroup(node_56, {
		color: 'violet',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = root();
			var node_57 = $.first_child(fragment_15);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_57, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_42 = $.text('One');

						$.append($$anchor, text_42);
					},
					$$slots: { default: true }
				});
			}

			var node_58 = $.sibling(node_57, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_58, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_43 = $.text('Two');

						$.append($$anchor, text_43);
					},
					$$slots: { default: true }
				});
			}

			var node_59 = $.sibling(node_58, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_59, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_44 = $.text('Three');

						$.append($$anchor, text_44);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});

	var node_60 = $.sibling(node_56, 2);

	ButtonToggleGroup(node_60, {
		color: 'purple',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root();
			var node_61 = $.first_child(fragment_16);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_61, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_45 = $.text('One');

						$.append($$anchor, text_45);
					},
					$$slots: { default: true }
				});
			}

			var node_62 = $.sibling(node_61, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_62, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_46 = $.text('Two');

						$.append($$anchor, text_46);
					},
					$$slots: { default: true }
				});
			}

			var node_63 = $.sibling(node_62, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_63, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_47 = $.text('Three');

						$.append($$anchor, text_47);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});

	var node_64 = $.sibling(node_60, 2);

	ButtonToggleGroup(node_64, {
		color: 'fuchsia',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_17 = root();
			var node_65 = $.first_child(fragment_17);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_65, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_48 = $.text('One');

						$.append($$anchor, text_48);
					},
					$$slots: { default: true }
				});
			}

			var node_66 = $.sibling(node_65, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_66, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_49 = $.text('Two');

						$.append($$anchor, text_49);
					},
					$$slots: { default: true }
				});
			}

			var node_67 = $.sibling(node_66, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_67, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_50 = $.text('Three');

						$.append($$anchor, text_50);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_17);
		},
		$$slots: { default: true }
	});

	var node_68 = $.sibling(node_64, 2);

	ButtonToggleGroup(node_68, {
		color: 'pink',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_18 = root();
			var node_69 = $.first_child(fragment_18);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_69, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_51 = $.text('One');

						$.append($$anchor, text_51);
					},
					$$slots: { default: true }
				});
			}

			var node_70 = $.sibling(node_69, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_70, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_52 = $.text('Two');

						$.append($$anchor, text_52);
					},
					$$slots: { default: true }
				});
			}

			var node_71 = $.sibling(node_70, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_71, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_53 = $.text('Three');

						$.append($$anchor, text_53);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_18);
		},
		$$slots: { default: true }
	});

	var node_72 = $.sibling(node_68, 2);

	ButtonToggleGroup(node_72, {
		color: 'rose',
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_19 = root();
			var node_73 = $.first_child(fragment_19);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_73, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_54 = $.text('One');

						$.append($$anchor, text_54);
					},
					$$slots: { default: true }
				});
			}

			var node_74 = $.sibling(node_73, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_74, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_55 = $.text('Two');

						$.append($$anchor, text_55);
					},
					$$slots: { default: true }
				});
			}

			var node_75 = $.sibling(node_74, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_75, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_56 = $.text('Three');

						$.append($$anchor, text_56);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_19);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}