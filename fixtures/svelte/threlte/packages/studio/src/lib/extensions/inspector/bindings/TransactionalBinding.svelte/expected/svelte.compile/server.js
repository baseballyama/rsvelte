import * as $ from 'svelte/internal/server';
import { resolvePropertyPath, useTask } from '@threlte/core';
import { onMount, tick } from 'svelte';
import { Binding } from 'svelte-tweakpane-ui';
import { useTransactions } from '../../transactions/useTransactions.js';
import { buildTransaction } from '../../transactions/TransactionQueue/buildTransaction.js';

const getClonedValue = (target, key) => {
	if (typeof target[key] === 'object' && target[key] !== null && 'clone' in target[key] && typeof target[key].clone === 'function') {
		return target[key].clone();
	}

	if (typeof target[key] === 'object' && target[key] !== null) {
		console.error('The object does not have a clone method', target[key]);
	}

	return target[key];
};

export default function TransactionalBinding($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { commit, onTransaction } = useTransactions();

		/** Transform values from and to display values, e.g. radians to degrees and vice versa */
		/** The transformation applied when reading the initial value */
		/** The transformation applied when writing the value back to the object */
		let {
			objects,
			key,
			label,
			autoUpdate = false,
			ref = void 0,
			transform,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const firstObject = $.derived(() => objects[0]);
		const carrier = {};

		// This first resolves the target object and the key of the property we want to
		// bind. Example: firstObject is an object with a property 'position' that is a
		// Vector3. The result is target = firstObject and targetKey = 'position'. We
		// use this to clone the object.
		const { target, key: targetKey } = resolvePropertyPath(firstObject(), key);

		carrier[targetKey] = getClonedValue(target, targetKey);

		// Maybe transform, e.g. radian to degree
		if (transform) {
			carrier[targetKey] = transform.read(carrier[targetKey]);
		}

		let ignoreChangeEvent = false;
		let running = $.derived(() => autoUpdate);

		useTask(
			async () => {
				if (!ref) return;

				if (typeof carrier[targetKey] === 'object' && carrier[targetKey] !== null) {
					if ('copy' in carrier[targetKey] && typeof carrier[targetKey].copy === 'function') {
						carrier[targetKey].copy(target[targetKey]);
					}
				} else {
					carrier[targetKey] = target[targetKey];
				}

				if (transform) {
					carrier[targetKey] = transform.read(carrier[targetKey]);
				}

				ignoreChangeEvent = true;
				ref.refresh();
				await tick();
				ignoreChangeEvent = false;
			},
			{ autoInvalidate: false, running: () => running() }
		);

		onMount(() => onTransaction(() => running(true)));

		let isFirst = true;

		// Because properties can be mutated continouosly but should only record
		// history on interaction start, we need to store the value of the first
		// change event.
		let historicValue;

		// This function is called when the value of the binding changes. It writes
		// the value to the target object and commits the change to the transaction
		// queue. Arguably, this is the most important part of the binding.
		const changeHandler = (e) => {
			if (ignoreChangeEvent) return;

			// Only write the value to the target object if it's the last or the first
			// change event.
			if (isFirst) {
				// no need to transform here, because the value is already transformed
				historicValue = getClonedValue(target, targetKey);
			}

			let value = getClonedValue(carrier, targetKey);

			if (transform) {
				value = transform.write(value);
			}

			// we commit the changes made to the object, but we only record history on
			// the last user interaction. syncing also only happens when the last user
			// interaction is completed.
			commit(objects.map((object) => buildTransaction({
				object,
				propertyPath: key,
				value,
				historicValue,
				createHistoryRecord: e.last,
				sync: e.last
			})));

			// on the last user interaction, e.last is true. We use that to reset the
			// isFirst flag.
			isFirst = e.last;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Binding($$renderer, $.spread_props([
				{ object: carrier, key: targetKey, label },
				rest,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					}
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}