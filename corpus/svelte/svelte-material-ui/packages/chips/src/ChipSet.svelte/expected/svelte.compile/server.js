import * as $ from 'svelte/internal/server';
import { onMount, setContext } from 'svelte';
import { writable } from 'svelte/store';
import { announce, classMap, useActions } from '@smui/common/internal';
import { ContextFragment } from '@smui/common';
import { deprecated } from './mdc';

export default function ChipSet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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
		let {
			use = [],
			class: className = '',
			chips = [],
			key = (chip) => `${chip}`,
			selected = void 0,
			nonInteractive = false,
			choice = false,
			filter = false,
			input = false,
			chip,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (filter && choice) {
			throw new Error('Chip sets can be either filter or choice, but not both.');
		}

		if (choice && typeof selected === 'object' && 'findIndex' in selected) {
			throw new Error('Choice chips must not be given multiple selected chips.');
		}

		if (filter && selected !== undefined && (typeof selected !== 'object' || !('findIndex' in selected))) {
			throw new Error('Filter chips must be given an array of selected chips.');
		}

		let element;
		let instance = void 0;
		let chipAccessorMap = {};
		let chipAccessorWeakMap = new WeakMap();
		let initialSelected = chips.map((chipId) => choice && selected != null && key(selected) === key(chipId) || filter && selected != null && selected.findIndex((chip) => key(chip) === key(chipId)) !== -1);

		setContext('SMUI:chips:key', key);

		const nonInteractiveStore = writable(nonInteractive);

		setContext('SMUI:chips:nonInteractive', nonInteractiveStore);

		const choiceStore = writable(choice);

		setContext('SMUI:chips:choice', choiceStore);

		const filterStore = writable(filter);

		setContext('SMUI:chips:filter', filterStore);

		let previousSelected = filter ? new Set(selected ?? []) : selected;

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
			instance = new MDCChipSetFoundation({
				announceMessage: announce,
				focusChipPrimaryActionAtIndex: (index) => {
					getAccessor(chips[index])?.focusPrimaryAction();
				},

				focusChipTrailingActionAtIndex: (index) => {
					getAccessor(chips[index])?.focusTrailingAction();
				},
				getChipListCount: () => chips.length,
				getIndexOfChipById: (chipId) => chips.findIndex((chip) => key(chip) === chipId),
				hasClass: (className) => getElement().classList.contains(className),
				isRTL: () => getComputedStyle(getElement()).getPropertyValue('direction') === 'rtl',
				removeChipAtIndex: (index) => {
					if (index >= 0 && index < chips.length) {
						const chipKey = key(chips[index]);

						// If it's selected, remove it.
						if (choice && selected != null && key(selected) === chipKey) {
							selected = undefined;
						} else if (filter && selected != null) {
							const selIndex = selected.findIndex((chip) => key(chip) === chipKey);

							if (selIndex !== -1) {
								selected.splice(selIndex, 1);
							}
						}

						// Now remove it from the chips.
						chips.splice(index, 1);
					}
				},

				removeFocusFromChipAtIndex: (index) => {
					getAccessor(chips[index])?.removeFocus();
				},

				selectChipAtIndex: (index, selectedValue, shouldNotifyClients) => {
					if (index >= 0 && index < chips.length) {
						if (filter) {
							if (selected == null) {
								selected = [];
							}

							const chipKey = key(chips[index]);
							const selIndex = selected.findIndex((chip) => key(chip) === chipKey);

							if (selectedValue && selIndex === -1) {
								selected.push(chips[index]);
							} else if (!selectedValue && selIndex !== -1) {
								selected.splice(selIndex, 1);
							}
						} else if (choice && (selectedValue || key(selected) === key(chips[index]))) {
							selected = selectedValue ? chips[index] : undefined;
						}

						getAccessor(chips[index])?.setSelectedFromChipSet(selectedValue, shouldNotifyClients);
					}
				}
			});

			instance.init();

			if (choice && selected != null) {
				instance.select(key(selected));
			} else if (filter && selected != null && selected.length) {
				for (const chipId of selected) {
					instance.select(key(chipId));
				}
			}

			return () => {
				instance?.destroy();
				instance = undefined;
			};
		});

		function handleChipInteraction(event) {
			if (instance) {
				instance.handleChipInteraction({ chipId: key(event.detail.chipId) });
			}
		}

		function handleChipSelection(event) {
			if (instance) {
				instance.handleChipSelection({
					chipId: key(event.detail.chipId),
					selected: event.detail.selected,
					shouldIgnore: event.detail.shouldIgnore
				});
			}
		}

		function handleChipRemoval(event) {
			if (instance) {
				instance.handleChipRemoval({
					chipId: key(event.detail.chipId),
					removedAnnouncement: event.detail.removedAnnouncement
				});
			}
		}

		function handleChipNavigation(event) {
			if (instance) {
				instance.handleChipNavigation({
					chipId: key(event.detail.chipId),
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

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-chip-set': true,
				'smui-chip-set--non-interactive': nonInteractive,
				'mdc-chip-set--choice': choice,
				'mdc-chip-set--filter': filter,
				'mdc-chip-set--input': input,
				[className]: true
			})),
			role: 'grid',
			...restProps
		})}><!--[-->`);

		const each_array = $.ensure_array_like(chips);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let chipKey = each_array[i];

			ContextFragment($$renderer, {
				key: 'SMUI:chips:chip:index',
				value: i,
				children: ($$renderer) => {
					ContextFragment($$renderer, {
						key: 'SMUI:chips:chip:initialSelected',
						value: initialSelected[i],
						children: ($$renderer) => {
							chip($$renderer, chipKey);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { chips, selected, getElement });
	});
}