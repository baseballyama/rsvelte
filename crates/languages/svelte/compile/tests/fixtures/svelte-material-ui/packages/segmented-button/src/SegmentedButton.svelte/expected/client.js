import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext } from 'svelte';
import { writable } from 'svelte/store';
import { classMap, useActions, dispatch } from '@smui/common/internal';
import { ContextFragment } from '@smui/common';
import { MDCSegmentedButtonFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'segments',
	'key',
	'singleSelect',
	'selected',
	'segment'
]);

var root = $.from_html(`<div></div>`);

export default function SegmentedButton($$anchor, $$props) {
	$.push($$props, true);

	const $singleSelectStore = () => $.store_get(singleSelectStore, '$singleSelectStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * An array of segment objects.
	 */
	/**
	 * Function that takes segment object and returns a unique string or number.
	 *
	 * If your segments are strings or numbers, you don't need this.
	 */
	/**
	 * Allow only one selection.
	 *
	 * When this is true, `selected` will be one segment object.
	 */
	/**
	 * The segment that is or segments that are currently selected.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		segments = $.prop($$props, 'segments', 19, () => []),
		key = $.prop($$props, 'key', 3, (segment) => segment),
		singleSelect = $.prop($$props, 'singleSelect', 3, false),
		selected = $.prop($$props, 'selected', 15),
		restProps = $.rest_props($$props, rest_excludes);

	if (singleSelect() && typeof selected() === 'object' && 'findIndex' in selected()) {
		throw new Error('Single-select segmented buttons must not be given multiple selected segments.');
	}

	if (!singleSelect() && selected() !== undefined && (typeof selected() !== 'object' || !('findIndex' in selected()))) {
		throw new Error('Multi-select segmented buttons must be given an array of selected segments.');
	}

	let element;
	let instance = $.state(void 0);
	let segmentAccessorMap = {};
	let segmentAccessorWeakMap = new WeakMap();
	let initialSelected = segments().map((segmentId) => singleSelect() && selected() != null && key()(selected()) === key()(segmentId) || !singleSelect() && selected() != null && selected().findIndex((segment) => key()(segment) === key()(segmentId)) !== -1);

	setContext('SMUI:icon:context', 'segmented-button');
	setContext('SMUI:label:context', 'segmented-button');

	const singleSelectStore = writable(singleSelect());

	$.user_effect(() => {
		$.store_set(singleSelectStore, singleSelect());
	});

	setContext('SMUI:segmented-button:singleSelect', singleSelectStore);

	let previousSelected = singleSelect() ? selected() : new Set(selected() ?? []);

	$.user_effect(() => {
		if ($.get(instance) && singleSelect() && previousSelected !== selected()) {
			if (previousSelected != null) {
				$.get(instance).unselectSegment(segments().findIndex((segment) => key()(segment) === key()(previousSelected)));
			}

			previousSelected = selected();

			if (selected() != null) {
				$.get(instance).selectSegment(segments().findIndex((segment) => key()(segment) === key()(selected())));
			}
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && !singleSelect()) {
			const setSelected = new Set(selected() ?? []);
			const unSelected = setDifference(previousSelected, setSelected);
			const newSelected = setDifference(setSelected, previousSelected);

			if (unSelected.size || newSelected.size) {
				previousSelected = setSelected;

				for (let segmentId of unSelected) {
					const idx = segments().findIndex((segment) => key()(segment) === key()(segmentId));

					if (idx !== -1) {
						$.get(instance).unselectSegment(idx);
					}
				}

				for (let segmentId of newSelected) {
					$.get(instance).selectSegment(segments().findIndex((segment) => key()(segment) === key()(segmentId)));
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

	setContext('SMUI:segmented-button:segment:mount', (accessor) => {
		addAccessor(accessor.segmentId, accessor);
	});

	setContext('SMUI:segmented-button:segment:unmount', (accessor) => {
		removeAccessor(accessor.segmentId);
	});

	onMount(() => {
		$.set(
			instance,
			new MDCSegmentedButtonFoundation({
				hasClass: (className) => {
					return getElement().classList.contains(className);
				},

				getSegments: () => {
					return segments().map((segmentKey, index) => ({
						index,
						selected: selected() == null
							? false
							: singleSelect()
								? key()(selected()) === key()(segmentKey)
								: selected().findIndex((segment) => key()(segment) === key()(segmentKey)) !== -1

						// segmentId: segmentKey, // Not necessarily a string.
					}));
				},
				selectSegment,
				unselectSegment,
				notifySelectedChange: (detail) => {
					if (detail.selected) {
						selectSegment(detail.index);
					} else {
						unselectSegment(detail.index);
					}

					dispatch(getElement(), 'change', detail);
				}
			}),
			true
		);

		$.get(instance).init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	function handleSelected(event) {
		if ($.get(instance)) {
			$.get(instance).handleSelected(event.detail);
		}
	}

	function getAccessor(segmentId) {
		return segmentId instanceof Object
			? segmentAccessorWeakMap.get(segmentId)
			: segmentAccessorMap[segmentId];
	}

	function addAccessor(segmentId, accessor) {
		if (segmentId instanceof Object) {
			segmentAccessorWeakMap.set(segmentId, accessor);
		} else {
			segmentAccessorMap[segmentId] = accessor;
		}
	}

	function removeAccessor(segmentId) {
		if (segmentId instanceof Object) {
			segmentAccessorWeakMap.delete(segmentId);
		} else {
			delete segmentAccessorMap[segmentId];
		}
	}

	function selectSegment(indexOrSegmentId) {
		let index = segments().findIndex((segment) => key()(segment) === indexOrSegmentId);

		if (index === -1) {
			index = indexOrSegmentId;
		}

		const segmentKey = key()(segments()[index]);

		if (!singleSelect()) {
			if (selected() == null) {
				selected([]);
			}

			const selIndex = selected().findIndex((segment) => key()(segment) === segmentKey);

			if (selIndex === -1) {
				selected().push(segments()[index]);
			}
		} else if (selected() == null || key()(selected()) !== segmentKey) {
			selected(segments()[index]);
		}

		const accessor = getAccessor(segments()[index]);

		if (accessor) {
			accessor.selected = true;
		}
	}

	function unselectSegment(indexOrSegmentId) {
		let index = segments().findIndex((segment) => key()(segment) === indexOrSegmentId);

		if (index === -1) {
			index = indexOrSegmentId;
		}

		if (!singleSelect()) {
			if (selected() != null) {
				const selIndex = selected().findIndex((segment) => key()(segment) === key()(segments()[index]));

				if (selIndex !== -1) {
					selected().splice(selIndex, 1);
				}
			}
		} else if (selected() != null && key()(selected()) === key()(segments()[index])) {
			selected(undefined);
		}

		const accessor = getAccessor(segments()[index]);

		if (accessor) {
			accessor.selected = false;
		}
	}

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	var event_handler = (e) => {
		handleSelected(e);
		$$props.onselected?.(e);
	};

	$.attribute_effect(
		div,
		($0) => ({
			class: $0,
			role: singleSelect() ? 'radiogroup' : 'group',
			...restProps,
			onselected: event_handler
		}),
		[
			() => classMap({
				'mdc-segmented-button': true,
				'mdc-segmented-button--single-select': singleSelect(),
				[className()]: true
			})
		]
	);

	$.each(div, 23, segments, (segmentKey) => key()(segmentKey), ($$anchor, segmentKey, i) => {
		ContextFragment($$anchor, {
			key: 'SMUI:segmented-button:segment:index',
			get value() {
				return $.get(i);
			},

			children: ($$anchor, $$slotProps) => {
				ContextFragment($$anchor, {
					key: 'SMUI:segmented-button:segment:initialSelected',
					get value() {
						return initialSelected[$.get(i)];
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.snippet(node, () => $$props.segment, () => $.get(segmentKey));
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