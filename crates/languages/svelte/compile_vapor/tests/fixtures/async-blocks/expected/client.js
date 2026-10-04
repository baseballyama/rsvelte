import { ReactiveEffect as $$v_ReactiveEffect, createFor as $$v_createFor, createIf as $$v_createIf, currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, handleError as $$v_handleError, inject as $$v_inject, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, renderEffect as $$v_renderEffect, setText as $$v_setText, shallowRef as $$v_shallowRef, template as $$v_template } from 'vue';

import { customRef as $$createState } from 'vue';

const $$each = (c) => c == null ? [] : Array.from(c);

const $$value = (el, v) => {
	const last = el.$$value;
	el.$$value = v ?? undefined;
	if (last === el.$$value || el.value === v) return;
	el.value = v ?? '';
};

const $$async_cell = (getter, initialize = false) => {
	let ready;
	let fail;
	const instance = $$v_currentInstance;
	const result = $$v_shallowRef(undefined);
	result.resolved = $$v_shallowRef(false);
	if (initialize) result.ready = new Promise((resolve, reject) => {
		ready = resolve;
		fail = reject;
	});
	const boundary = $$v_inject(Symbol.for('rsvelte.async.boundary'), null);
	let pendingCount = 0;
	let pendingVersion = 0;
	const clearPending = () => {
		if (boundary) boundary.count.value -= pendingCount;
		pendingCount = 0;
		pendingVersion++;
	};
	let initialized = false;
	if (boundary) boundary.waiting++;
	const reads = new Map();
	let active = true;
	let version = 0;
	let queued = false;
	let root;
	const schedule = () => {
		if (!active || queued) return;
		queued = true;
		queueMicrotask(() => {
			queued = false;
			if (active) run();
		});
	};
	const clear = () => {
		root?.stop();
		reads.forEach((effect) => effect.stop());
		reads.clear();
	};
	const run = () => {
		clear();
		let finish = () => {};
		if (boundary) {
			boundary.count.value++;
			pendingCount++;
			const epoch = pendingVersion;
			let pending = true;
			finish = () => {
				if (!pending || epoch !== pendingVersion) return;
				pending = false;
				pendingCount--;
				boundary.count.value--;
			};
		}
		const current = ++version;
		const read = (key, callback) => {
			if (!active || current !== version) return callback();
			let effect = reads.get(key);
			if (!effect) {
				effect = new $$v_ReactiveEffect(callback);
				effect.notify = () => {
					if (effect.dirty) schedule();
				};
				reads.set(key, effect);
			} else effect.fn = callback;
			return effect.run();
		};
		root = new $$v_ReactiveEffect(() => getter(read));
		root.notify = () => {
			if (root.dirty) schedule();
		};
		Promise.resolve(root.run()).then((value) => {
			finish();
			if (active && current === version) {
				clearPending();
				result.value = value;
				result.resolved.value = true;
				if (!initialized) {
					initialized = true;
					ready?.();
					if (boundary && --boundary.waiting === 0) boundary.initial.value = false;
				}
			}
		}, (error) => {
			finish();
			if (active && current === version) {
				if (initialize && !initialized) fail(error); else $$v_handleError(error, instance, 'render');
			}
		});
	};
	$$v_onScopeDispose(() => {
		active = false;
		++version;
		clear();
		clearPending();
		if (boundary && !initialized && --boundary.waiting === 0) boundary.initial.value = false;
	});
	run();
	return result;
};

const $$async_derived = async (getter) => {
	const cell = $$async_cell(getter, true);
	await cell.ready;
	return cell;
};

const $$state_marker = Symbol();

const $$state_deleted = Symbol();

const $$state_equal = (left, right) => left === right || left !== left && right !== right;

const $$state_source = (initial, convert = false) => {
	let current = initial;
	const source = $$createState((track, trigger) => ({ get() {
		track();
		return current;
	}, set(value) {
		const next = convert ? $$state_proxy(value) : value;
		if (!$$state_equal(current, next)) {
			current = next;
			trigger();
		}
	} }));
	source.peek = () => current;
	return source;
};

const $$ref = (value) => $$state_source($$state_proxy(value), true);

const $$state_proxy = (value) => {
	if (value === null || typeof value !== 'object' || $$state_marker in value) return value;
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== Array.prototype) return value;
	const array = Array.isArray(value);
	const sources = new Map();
	const version = $$state_source(0);
	let revision = 0;
	const changed = () => {
		version.value = ++revision;
	};
	const write = (property, next) => {
		let source = sources.get(property);
		if (!source) {
			source = $$state_source(next);
			sources.set(property, source);
		} else source.value = next;
	};
	if (array) sources.set('length', $$state_source(value.length));
	return new Proxy(value, { get(target, property, receiver) {
		if (property === $$state_marker) return target;
		let source = sources.get(property);
		const exists = property in target;
		if (!source && (!exists || Object.getOwnPropertyDescriptor(target, property)?.writable)) {
			source = $$state_source(exists ? $$state_proxy(target[property]) : $$state_deleted);
			sources.set(property, source);
		}
		if (!source) return Reflect.get(target, property, receiver);
		const result = source.value;
		return result === $$state_deleted ? undefined : result;
	}, set(target, property, next, receiver) {
		const source = sources.get(property);
		const existed = source ? source.peek() !== $$state_deleted : property in target;
		if (array && property === 'length') {
			const length = sources.get('length').peek();
			for (let index = next; index < length; index++) {
				if (sources.has(String(index)) || index in target) write(String(index), $$state_deleted);
			}
		}
		const descriptor = Object.getOwnPropertyDescriptor(target, property);
		if (source || !existed || descriptor?.writable) write(property, $$state_proxy(next));
		if (descriptor?.set) descriptor.set.call(receiver, next);
		if (!existed) {
			if (array && typeof property === 'string') {
				const index = Number(property);
				const length = sources.get('length');
				if (Number.isInteger(index) && index >= length.peek()) length.value = index + 1;
			}
			changed();
		}
		return true;
	}, deleteProperty(target, property) {
		if (sources.has(property) || property in target) {
			write(property, $$state_deleted);
			changed();
		}
		return true;
	}, has(target, property) {
		if (property === $$state_marker) return true;
		let source = sources.get(property);
		const exists = Reflect.has(target, property);
		if (!source && (!exists || Object.getOwnPropertyDescriptor(target, property)?.writable)) {
			source = $$state_source(exists ? $$state_proxy(target[property]) : $$state_deleted);
			sources.set(property, source);
		}
		return source ? source.value !== $$state_deleted : exists;
	}, ownKeys(target) {
		version.value;
		const keys = Reflect.ownKeys(target).filter((key) => !sources.has(key) || sources.get(key).peek() !== $$state_deleted);
		sources.forEach((source, key) => {
			if (source.peek() !== $$state_deleted && !(key in target)) keys.push(key);
		});
		return keys;
	}, getOwnPropertyDescriptor(target, property) {
		this.has(target, property);
		const descriptor = Object.getOwnPropertyDescriptor(target, property);
		const source = sources.get(property);
		if (!source) return descriptor;
		const current = source.value;
		if (current === $$state_deleted) return undefined;
		if (descriptor && 'value' in descriptor) return { ...descriptor, value: current };
		return { value: current, writable: true, enumerable: true, configurable: true };
	}, defineProperty(target, property, descriptor) {
		if (!('value' in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
			throw new TypeError('state_descriptors_fixed');
		}
		write(property, descriptor.value);
		return true;
	}, setPrototypeOf() {
		throw new TypeError('state_prototype_fixed');
	} });
};

const $$v_n0 = $$v_template('<button>');

const $$v_n2 = $$v_template('<span>change</span>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<p>');

const $$v_n10 = $$v_template(' ');

const $$v_n12 = $$v_template('<p>');

const $$v_n14 = $$v_template(' ');

const $$v_n16 = $$v_template('<p>');

const $$v_n18 = $$v_template(' ');

const $$v_n23 = $$v_template('<span> </span>');

const $$v_n27 = $$v_template('<strong>');

const $$v_n29 = $$v_template(' ');

const $$v_n32 = $$v_template('<em>');

const $$v_n34 = $$v_template('<span>empty</span>');

const $$v_n39 = $$v_template('<span> </span>');

const $$v_n43 = $$v_template('<input>');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const value = $$ref(0);
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_n3.firstChild;
	$$v_insert([$$v_n4], $$v_n1);
	$$v_on($$v_n1, 'click', () => value.value++);
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n22 = (() => {
		const $$v_n21 = $$async_cell(async ($$async_read) => await Promise.resolve($$async_read(6, () => value.value) % 3 === 0));
		return $$v_createIf(() => $$v_n21.resolved.value, () => $$v_createIf(() => $$v_n21.value, () => {
			const $$v_n9 = $$v_n8();
			const $$v_n11 = $$v_n10();
			$$v_insert([$$v_n11], $$v_n9);
			$$v_renderEffect(() => {
				$$v_setText($$v_n11, `zero:${value.value ?? ''}`);
			});
			return $$v_n9;
		}, () => (() => {
			const $$v_n20 = $$async_cell(async ($$async_read) => await Promise.resolve($$async_read(25, () => value.value) % 3 === 1));
			return $$v_createIf(() => $$v_n20.resolved.value, () => $$v_createIf(() => $$v_n20.value, () => {
				const $$v_n13 = $$v_n12();
				const $$v_n15 = $$v_n14();
				$$v_insert([$$v_n15], $$v_n13);
				$$v_renderEffect(() => {
					$$v_setText($$v_n15, `one:${value.value ?? ''}`);
				});
				return $$v_n13;
			}, () => {
				const $$v_n17 = $$v_n16();
				const $$v_n19 = $$v_n18();
				$$v_insert([$$v_n19], $$v_n17);
				$$v_renderEffect(() => {
					$$v_setText($$v_n19, `two:${value.value ?? ''}`);
				});
				return $$v_n17;
			}));
		})()));
	})();
	const $$v_n24 = $$v_n23();
	const $$v_n25 = $$v_n24.firstChild;
	const $$v_n26 = $$async_cell(async ($$async_read) => [$$each(await Promise.resolve($$async_read(53, () => value.value) % 2 ? [$$async_read(56, () => value.value)] : []))]);
	const $$v_n38 = $$v_createFor(() => $$v_n26.value, ($$each_collection_265) => {
		const $$v_n37 = $$v_createIf(() => $$each_collection_265.value.length, () => {
			const $$v_n31 = $$v_createFor(() => $$each_collection_265.value, (item) => {
				const $$v_n28 = $$v_n27();
				const $$v_n30 = $$v_n29();
				$$v_insert([$$v_n30], $$v_n28);
				$$v_renderEffect(() => {
					$$v_setText($$v_n30, `${item.value ?? ''}`);
				});
				return $$v_n28;
			});
			return $$v_n31;
		}, () => {
			const $$v_n33 = $$v_n32();
			const $$v_n35 = $$v_n34();
			const $$v_n36 = $$v_n35.firstChild;
			$$v_insert([$$v_n36], $$v_n33);
			return $$v_n33;
		});
		return [$$v_n37];
	});
	const $$v_n40 = $$v_n39();
	const $$v_n41 = $$v_n40.firstChild;
	const $$v_n42 = $$async_cell(async ($$async_read) => [await Promise.resolve($$async_read(81, () => value.value))]);
	const $$v_n46 = $$v_createFor(() => $$v_n42.value, ($$key) => {
		const $$v_n44 = $$v_n43();
		const $$v_n45 = ($$el) => {
			if ($$el !== null) {
				$$value($$el, value.value);
			}
		};
		$$v_onScopeDispose(() => $$v_n45(null));
		$$v_renderEffect(() => {
			$$v_n45($$v_n44);
		});
		return $$v_n44;
	}, ($$key) => $$key);
	return [$$v_n1, $$v_n7, $$v_n22, $$v_n25, $$v_n38, $$v_n41, $$v_n46];
} });
