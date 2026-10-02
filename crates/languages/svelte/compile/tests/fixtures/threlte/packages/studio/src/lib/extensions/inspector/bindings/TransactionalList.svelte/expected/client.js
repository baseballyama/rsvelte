import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolvePropertyPath } from '@threlte/core';
import { List } from 'svelte-tweakpane-ui';
import { useTransactions } from '../../transactions/useTransactions.js';
import { buildTransaction } from '../../transactions/TransactionQueue/buildTransaction.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'objects',
	'key',
	'label',
	'options'
]);

export default function TransactionalList($$anchor, $$props) {
	$.push($$props, true);

	const { commit } = useTransactions();
	let rest = $.rest_props($$props, rest_excludes);
	const firstObject = $.derived(() => $$props.objects[0]);
	const carrier = {};
	const { target, key: targetKey } = resolvePropertyPath($.get(firstObject), $$props.key);

	if (typeof target[targetKey] === 'object' && target[targetKey] !== null && 'clone' in target[targetKey] && typeof target[targetKey].clone === 'function') {
		const cloned = target[targetKey].clone();

		carrier[targetKey] = cloned;
	} else {
		carrier[targetKey] = target[targetKey];
	}

	List($$anchor, $.spread_props(
		{
			get value() {
				return carrier[targetKey];
			},

			get options() {
				return $$props.options;
			},

			get label() {
				return $$props.label;
			}
		},
		() => rest,
		{
			$$events: {
				change: [
					(e) => {
						commit($$props.objects.map((object) => buildTransaction({ object, propertyPath: $$props.key, value: e.detail.value })));
					},

					function ($$arg) {
						$.bubble_event.call(this, $$props, $$arg);
					}
				]
			}
		}
	));

	$.pop();
}