import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext } from 'svelte';
import { writable } from 'svelte/store';
import { announce, classMap, useActions } from '@smui/common/internal';
import { ContextFragment } from '@smui/common';
import { deprecated } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'chips',
	'key',
	'selected',
	'nonInteractive',
	'choice',
	'filter',
	'input',
	'chip'
]);

var root = $.from_html(`<div></div>`);

export default function ChipSet($$anchor, $$props) {
	$.push($$props, true);

	const $nonInteractiveStore = () => $.store_get(nonInteractiveStore, '$nonInteractiveStore', $$stores);
	const $choiceStore = () => $.store_get(choiceStore, '$choiceStore', $$stores);
	const $filterStore = () => $.store_get(filterStore, '$filterStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { MDCChipSetFoundation } = deprecated;

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * An array of chip objects.
	 */
	/**
	 * Function that takes a chip object and returns a unique string.
	 *
	 * If your chips are strings or convert to unique strings (like numbers),
	 * you don't need this.
	 */
	/**
	 * The chip that is or chips that are currently selected.
	 */
	/**
	 * Whether to not allow user interaction.
	 */
	/**
	 * Choice chips allow the user to pick one of the chips.
	 *
	 * When this is true, `selected` will be one chip object.
	 */
	/**
	 * Filter chips allow the user to pick multiple chips.
	 *
	 * When this is true, `selected` will be an array of chip objects.
	 */
	/**
	 * Input chips allow the user to remove chips.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		chips = $.prop($$props, 'chips', 27, () => $.proxy([])),
		key = $.prop($$props, 'key', 3, (chip) => `${chip}`),
		selected = $.prop($$props, 'selected', 15),
		nonInteractive = $.prop($$props, 'nonInteractive', 3, false),
		choice = $.prop($$props, 'choice', 3, false),
		filter = $.prop($$props, 'filter', 3, false),
		input = $.prop($$props, 'input', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	if (filter() && choice()) {
		throw new Error('Chip sets can be either filter or choice, but not both.');
	}

	if (choice() && typeof selected() === 'object' && 'findIndex' in selected()) {
		throw new Error('Choice chips must not be given multiple selected chips.');
	}

	if (filter() && selected() !== undefined && (typeof selected() !== 'object' || !('findIndex' in selected()))) {
		throw new Error('Filter chips must be given an array of selected chips.');
	}

	let element;
	let instance = $.state(void 0);
	let chipAccessorMap = {};
	let chipAccessorWeakMap = new WeakMap();
	let initialSelected = chips().map((chipId) => choice() && selected() != null && key()(selected()) === key()(chipId) || filter() && selected() != null && selected().findIndex((chip) => key()(chip) === key()(chipId)) !== -1);

	setContext('SMUI:chips:key', key());

	const nonInteractiveStore = writable(nonInteractive());

	$.user_effect(() => {
		$.store_set(nonInteractiveStore, nonInteractive());
	});

	setContext('SMUI:chips:nonInteractive', nonInteractiveStore);

	const choiceStore = writable(choice());

	$.user_effect(() => {
		$.store_set(choiceStore, choice());
	});

	setContext('SMUI:chips:choice', choiceStore);

	const filterStore = writable(filter());

	$.user_effect(() => {
		$.store_set(filterStore, filter());
	});

	setContext('SMUI:chips:filter', filterStore);

	let previousSelected = filter() ? new Set(selected() ?? []) : selected();

	$.user_effect(() => {
		if ($.get(instance) && choice() && previousSelected !== selected()) {
			const oldSelected = previousSelected;

			previousSelected = selected();

			if (selected() != null) {
				$.get(instance).select(key()(selected()));
			} else {
				$.get(instance).handleChipSelection({
					chipId: key()(oldSelected),
					selected: false,
					shouldIgnore: false
				});
			}
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && filter()) {
			const setSelected = new Set(selected() ?? []);
			const unSelected = setDifference(previousSelected, setSelected);
			const newSelected = setDifference(setSelected, previousSelected);

			if (unSelected.size || newSelected.size) {
				previousSelected = setSelected;

				for (let chipId of unSelected) {
					if (chips().findIndex((chip) => key()(chip) === key()(chipId)) !== -1) {
						$.get(instance).handleChipSelection({ chipId: key()(chipId), selected: false, shouldIgnore: false });
					}
				}

				for (let chipId of newSelected) {
					$.get(instance).handleChipSelection({ chipId: key()(chipId), selected: true, shouldIgnore: false });
				}
			}
		}
	});

	function setDifference(setA, setB) {
		let _difference = new Set(setA);

		for (let elem of setB) {
			_difference.delete(elem);
		}

		return _difference;
	}

	setContext('SMUI:chips:chip:mount', (accessor) => {
		addAccessor(accessor.chipId, accessor);
	});

	setContext('SMUI:chips:chip:unmount', (accessor) => {
		removeAccessor(accessor.chipId);
	});

	onMount(() => {
		$.set(
			instance,
			new MDCChipSetFoundation({
				announceMessage: announce,
				focusChipPrimaryActionAtIndex: (index) => {
					getAccessor(chips()[index])?.focusPrimaryAction();
				},

				focusChipTrailingActionAtIndex: (index) => {
					getAccessor(chips()[index])?.focusTrailingAction();
				},
				getChipListCount: () => chips().length,
				getIndexOfChipById: (chipId) => chips().findIndex((chip) => key()(chip) === chipId),
				hasClass: (className) => getElement().classList.contains(className),
				isRTL: () => getComputedStyle(getElement()).getPropertyValue('direction') === 'rtl',
				removeChipAtIndex: (index) => {
					if (index >= 0 && index < chips().length) {
						const chipKey = key()(chips()[index]);

						// If it's selected, remove it.
						if (choice() && selected() != null && key()(selected()) === chipKey) {
							selected(undefined);
						} else if (filter() && selected() != null) {
							const selIndex = selected().findIndex((chip) => key()(chip) === chipKey);

							if (selIndex !== -1) {
								selected().splice(selIndex, 1);
							}
						}

						// Now remove it from the chips.
						chips().splice(index, 1);
					}
				},

				removeFocusFromChipAtIndex: (index) => {
					getAccessor(chips()[index])?.removeFocus();
				},

				selectChipAtIndex: (index, selectedValue, shouldNotifyClients) => {
					if (index >= 0 && index < chips().length) {
						if (filter()) {
							if (selected() == null) {
								selected([]);
							}

							const chipKey = key()(chips()[index]);
							const selIndex = selected().findIndex((chip) => key()(chip) === chipKey);

							if (selectedValue && selIndex === -1) {
								selected().push(chips()[index]);
							} else if (!selectedValue && selIndex !== -1) {
								selected().splice(selIndex, 1);
							}
						} else if (choice() && (selectedValue || key()(selected()) === key()(chips()[index]))) {
							selected(selectedValue ? chips()[index] : undefined);
						}

						getAccessor(chips()[index])?.setSelectedFromChipSet(selectedValue, shouldNotifyClients);
					}
				}
			}),
			true
		);

		$.get(instance).init();

		if (choice() && selected() != null) {
			$.get(instance).select(key()(selected()));
		} else if (filter() && selected() != null && selected().length) {
			for (const chipId of selected()) {
				$.get(instance).select(key()(chipId));
			}
		}

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	function handleChipInteraction(event) {
		if ($.get(instance)) {
			$.get(instance).handleChipInteraction({ chipId: key()(event.detail.chipId) });
		}
	}

	function handleChipSelection(event) {
		if ($.get(instance)) {
			$.get(instance).handleChipSelection({
				chipId: key()(event.detail.chipId),
				selected: event.detail.selected,
				shouldIgnore: event.detail.shouldIgnore
			});
		}
	}

	function handleChipRemoval(event) {
		if ($.get(instance)) {
			$.get(instance).handleChipRemoval({
				chipId: key()(event.detail.chipId),
				removedAnnouncement: event.detail.removedAnnouncement
			});
		}
	}

	function handleChipNavigation(event) {
		if ($.get(instance)) {
			$.get(instance).handleChipNavigation({
				chipId: key()(event.detail.chipId),
				key: event.detail.key,
				source: event.detail.source
			});
		}
	}

	function getAccessor(chipId) {
		return chipId instanceof Object
			? chipAccessorWeakMap.get(chipId)
			: chipAccessorMap[chipId];
	}

	function addAccessor(chipId, accessor) {
		if (chipId instanceof Object) {
			chipAccessorWeakMap.set(chipId, accessor);
		} else {
			chipAccessorMap[chipId] = accessor;
		}
	}

	function removeAccessor(chipId) {
		if (chipId instanceof Object) {
			chipAccessorWeakMap.delete(chipId);
		} else {
			delete chipAccessorMap[chipId];
		}
	}

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	var event_handler = (e) => {
		handleChipInteraction(e);
		$$props.onSMUIChipInteraction?.(e);
	};

	var event_handler_1 = (e) => {
		handleChipSelection(e);
		$$props.onSMUIChipSelection?.(e);
	};

	var event_handler_2 = (e) => {
		handleChipRemoval(e);
		$$props.onSMUIChipRemoval?.(e);
	};

	var event_handler_3 = (e) => {
		handleChipNavigation(e);
		$$props.onSMUIChipNavigation?.(e);
	};

	$.attribute_effect(
		div,
		($0) => ({
			class: $0,
			role: 'grid',
			...restProps,
			onSMUIChipInteraction: event_handler,
			onSMUIChipSelection: event_handler_1,
			onSMUIChipRemoval: event_handler_2,
			onSMUIChipNavigation: event_handler_3
		}),
		[
			() => classMap({
				'mdc-chip-set': true,
				'smui-chip-set--non-interactive': nonInteractive(),
				'mdc-chip-set--choice': choice(),
				'mdc-chip-set--filter': filter(),
				'mdc-chip-set--input': input(),
				[className()]: true
			})
		]
	);

	$.each(div, 23, chips, (chipKey) => key()(chipKey), ($$anchor, chipKey, i) => {
		ContextFragment($$anchor, {
			key: 'SMUI:chips:chip:index',
			get value() {
				return $.get(i);
			},

			children: ($$anchor, $$slotProps) => {
				ContextFragment($$anchor, {
					key: 'SMUI:chips:chip:initialSelected',
					get value() {
						return initialSelected[$.get(i)];
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.snippet(node, () => $$props.chip, () => $.get(chipKey));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}