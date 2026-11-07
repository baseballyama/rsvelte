import * as $ from 'svelte/internal/server';
import { resolvePropertyPath } from '@threlte/core';
import { List } from 'svelte-tweakpane-ui';
import { useTransactions } from '../../transactions/useTransactions.js';
import { buildTransaction } from '../../transactions/TransactionQueue/buildTransaction.js';

export default function TransactionalList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { commit } = useTransactions();
		let { objects, key, label, options, $$slots, $$events, ...rest } = $$props;
		const firstObject = $.derived(() => objects[0]);
		const carrier = {};
		const { target, key: targetKey } = resolvePropertyPath(firstObject(), key);

		if (typeof target[targetKey] === 'object' && target[targetKey] !== null && 'clone' in target[targetKey] && typeof target[targetKey].clone === 'function') {
			const cloned = target[targetKey].clone();

			carrier[targetKey] = cloned;
		} else {
			carrier[targetKey] = target[targetKey];
		}

		List($$renderer, $.spread_props([{ value: carrier[targetKey], options, label }, rest]));
	});
}