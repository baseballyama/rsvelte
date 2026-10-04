import { computed as $$v_computed, currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, getCurrentScope as $$v_getCurrentScope, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, renderEffect as $$v_renderEffect, restoreCurrentInstance as $$v_restoreCurrentInstance, setCurrentInstance as $$v_setCurrentInstance, setText as $$v_setText, template as $$v_template } from 'vue';

import { customRef as $$createState, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect, watch as $$watch, onScopeDispose as $$onScopeDispose } from 'vue';

const $$once = (el, f) => {
	if (el.$$once === true) return;
	el.$$once = true;
	f();
};

const $$select = (element, value, setter) => {
	const mounting = element.$$mounted !== true;
	element.$$mounted = true;
	if (element.multiple) {
		if (mounting && value === undefined) setter($$option(element)); else Array.from(element.options).forEach((option) => {
			option.selected = value != null && value.includes(option.value);
		});
		return;
	}
	const option = Array.from(element.options).find((option) => Object.is(option.value, value));
	if (option !== undefined) option.selected = true; else if (!mounting || value !== undefined) element.selectedIndex = -1;
	if (mounting && value === undefined) {
		const selected = element.querySelector(':checked');
		if (selected !== null) setter(selected.value);
	}
};

const $$selected = (value, option) => value != null && value.includes(option);

const $$option = (element) => {
	if (element.multiple) return Array.from(element.querySelectorAll(':checked'), (option) => option.value);
	const option = element.querySelector(':checked') ?? element.querySelector('option:not([disabled])');
	return option && option.value;
};

const $$lifecycle_owner = () => new WeakMap();

const $$lifecycles = $$lifecycle_owner();

const $$lifecycle_once = (element, key, lifecycles = $$lifecycles) => {
	let keys = lifecycles.get(element);
	if (!keys) {
		keys = new Set();
		lifecycles.set(element, keys);
	}
	if (keys.has(key)) return false;
	keys.add(key);
	$$onScopeDispose(() => {
		keys.delete(key);
		if (!keys.size) lifecycles.delete(element);
	});
	return true;
};

const $$attachment_scope = (element, getter) => {
	const scope = $$effectScope(true);
	scope.run(() => $$watchPostEffect((register) => $$tracked(() => {
		const attachment = getter();
		if (!attachment) return;
		const child = $$effectScope();
		register(() => child.stop());
		child.run(() => {
			const cleanup = attachment(element);
			if (typeof cleanup === 'function') $$onScopeDispose(cleanup);
		});
	})));
	return scope;
};

const $$attachment = (element, key, getter) => {
	if (!$$lifecycle_once(element, key)) return;
	const scope = $$attachment_scope(element, getter);
	$$onScopeDispose(() => scope.stop());
};

const $$spread_attachments = (element, next) => {
	let scopes = element.$$attachments;
	if (!scopes) {
		scopes = new Map();
		element.$$attachments = scopes;
		$$onScopeDispose(() => {
			scopes.forEach((entry) => entry.scope.stop());
			scopes.clear();
			delete element.$$attachments;
		});
	}
	scopes.forEach((entry, key) => {
		if (entry.value !== next[key]) {
			entry.scope.stop();
			scopes.delete(key);
		}
	});
	Object.getOwnPropertySymbols(next).forEach((key) => {
		const value = next[key];
		if (key.description === '@attach' && value && !scopes.has(key)) {
			scopes.set(key, { value, scope: $$attachment_scope(element, () => value) });
		}
	});
};

const $$action = (element, key, action, parameter) => {
	if (!$$lifecycle_once(element, key)) return;
	$$watchPostEffect((register) => {
		let result;
		let mounted = false;
		const stop = $$watch(parameter, (value) => {
			if (!mounted) {
				mounted = true;
				result = action(element, value);
			} else if (result && typeof result.update === 'function') {
				result.update(value);
			}
		}, { immediate: true, deep: true, flush: 'post' });
		register(() => {
			stop();
			if (result && typeof result.destroy === 'function') result.destroy();
		});
	});
};

const $$global_binding = (element, name, setter, owner) => {
	if (!$$lifecycle_once(element, name, owner)) return;
	const events = name === 'online' ? ['online', 'offline'] : name === 'visibilityState' ? ['visibilitychange'] : name === 'activeElement' ? ['focusin', 'focusout'] : name === 'fullscreenElement' ? ['fullscreenchange'] : name === 'scrollX' || name === 'scrollY' ? ['scroll'] : ['resize'];
	const update = () => setter(name === 'online' ? navigator.onLine : element[name]);
	update();
	events.forEach((event) => element.addEventListener(event, update));
	$$onScopeDispose(() => events.forEach((event) => element.removeEventListener(event, update)));
};

const $$event = (element, name, getter) => {
	if (!$$lifecycle_once(element, 'on' + name)) return;
	const capture = name.endsWith('capture') && name !== 'gotpointercapture' && name !== 'lostpointercapture';
	if (capture) name = name.slice(0, -7);
	const options = { capture, passive: name === 'touchstart' || name === 'touchmove' };
	const listener = (event) => {
		const handler = getter();
		if (handler != null && (!element.disabled || event.target === element)) handler.call(element, event);
	};
	element.addEventListener(name, listener, options);
	$$onScopeDispose(() => element.removeEventListener(name, listener, options));
};

const $$number = (value) => value === '' ? null : +value;

const $$number_value = (element, value, setter) => {
	if (!element.$$number_mounted) {
		element.$$number_mounted = true;
		if (value == null && element.value !== '') {
			value = $$number(element.value);
			setter(value);
		}
	}
	if (value !== $$number(element.value)) element.value = value == null ? '' : value;
};

const $$groups = new WeakMap();

const $$group_checked = (value, option, checkbox) => checkbox ? value != null && value.includes(option) : value === option;

const $$group_members = new WeakMap();

const $$group = (element, owner, key, property, getter, setter, option) => {
	element.__value = option;
	const checkbox = element.type === 'checkbox';
	let groups = $$groups.get(owner);
	if (!groups) {
		groups = new Map();
		$$groups.set(owner, groups);
	}
	const name = property === null ? null : typeof property === 'symbol' ? property : String(property);
	let properties = groups.get(key);
	if (!properties) {
		properties = new Map();
		groups.set(key, properties);
	}
	let group = properties.get(name);
	if (!group) {
		group = new Set();
		properties.set(name, group);
	}
	const previous = $$group_members.get(element);
	if (previous?.group !== group) {
		if (previous) previous.dispose();
		group.add(element);
		const update = () => {
			if (checkbox) {
				const elements = Array.from(group).sort((left, right) => left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
				setter(Array.from(new Set(elements.filter((element) => element.checked).map((element) => element.__value))));
			} else setter(element.__value);
		};
		element.addEventListener('change', update);
		const record = { group, dispose() {
			group.delete(element);
			element.removeEventListener('change', update);
			if (!group.size) {
				properties.delete(name);
				if (!properties.size) groups.delete(key);
			}
			$$group_members.delete(element);
		} };
		$$group_members.set(element, record);
		if (!previous) $$onScopeDispose(() => $$group_members.get(element)?.dispose());
	}
	element.checked = $$group_checked(getter(), element.__value, checkbox);
};

const $$reset_bindings = new WeakMap();

let $$reset_count = 0;

const $$reset_listener = (event) => {
	queueMicrotask(() => {
		if (!event.defaultPrevented) {
			for (const element of event.target.elements) $$reset_bindings.get(element)?.forEach((update) => update());
		}
	});
};

const $$form_reset = (element, name, update) => {
	if (!$$lifecycle_once(element, 'reset:' + name)) return;
	let bindings = $$reset_bindings.get(element);
	if (!bindings) {
		bindings = new Map();
		$$reset_bindings.set(element, bindings);
	}
	bindings.set(name, update);
	if ($$reset_count++ === 0) document.addEventListener('reset', $$reset_listener, true);
	$$onScopeDispose(() => {
		bindings.delete(name);
		if (--$$reset_count === 0) document.removeEventListener('reset', $$reset_listener, true);
	});
};

const $$text_initial = (element, value, setter) => {
	if ($$lifecycle_once(element, 'text:initial') && value == null && element.value !== '') setter(element.value);
};

const $$reset_value = (element, value) => element.localName === 'select' ? element.multiple ? Array.from(element.selectedOptions, (option) => option.value) : element.value : value;

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

const $$effect_run = (callback, register, state) => {
	const scope = $$effectScope();
	state.failed = true;
	const cleanup = scope.run(() => $$tracked(callback));
	state.failed = false;
	state.cleanup = typeof cleanup === 'function' ? cleanup : null;
	register(() => {
		scope.stop();
		state.cleanup?.();
	});
};

const $$effect_watch = (callback, watch, options) => {
	const state = { cleanup: null, failed: false };
	$$onScopeDispose(() => {
		if (state.failed) state.cleanup?.();
	});
	const instance = $$v_currentInstance;
	const scope = $$v_getCurrentScope();
	watch((register) => {
		const previous = $$v_setCurrentInstance(instance, scope);
		try {
			$$effect_run(callback, register, state);
		} finally {
			$$v_restoreCurrentInstance(previous);
		}
	}, options);
};

const $$effect = (callback) => {
	if (typeof window !== 'undefined') $$effect_watch(callback, $$watchPostEffect);
};

const $$effect_pre = (callback) => {
	if (typeof window !== 'undefined') $$effect_watch(callback, $$watchEffect, { flush: 'pre' });
};

const $$effect_root = (callback) => {
	const scope = $$effectScope(true);
	const cleanup = scope.run(() => $$untrack(callback));
	let active = true;
	return () => {
		if (!active) return;
		active = false;
		scope.stop();
		if (typeof cleanup === 'function') cleanup();
	};
};

const $$snapshot = (value, seen = new Map(), original = null) => {
	if (value !== null && typeof value === 'object') {
		if (seen.has(value)) return seen.get(value);
		if (value instanceof Map) return new Map(value);
		if (value instanceof Set) return new Set(value);
		const array = Array.isArray(value);
		if (array || Object.getPrototypeOf(value) === Object.prototype) {
			const result = array ? Array(value.length) : {};
			seen.set(value, result);
			if (original !== null) seen.set(original, result);
			if (array) {
				for (let index = 0; index < value.length; index++) {
					if (index in value) result[index] = $$snapshot(value[index], seen);
				}
			} else {
				Object.keys(value).forEach((key) => {
					result[key] = $$snapshot(value[key], seen);
				});
			}
			return result;
		}
		if (value instanceof Date) {
			value.getTime();
			return structuredClone(value);
		}
		if (typeof value.toJSON === 'function') return $$snapshot(value.toJSON(), seen, value);
	}
	if (typeof EventTarget !== 'undefined' && value instanceof EventTarget) return value;
	try {
		return structuredClone(value);
	} catch {
		return value;
	}
};

let $$tracking_depth = 0;

const $$tracked = (callback) => {
	$$tracking_depth++;
	try {
		return callback();
	} finally {
		$$tracking_depth--;
	}
};

const $$effect_tracking = () => $$tracking_depth > 0;

const $$untrack = (callback) => {
	const depth = $$tracking_depth;
	$$tracking_depth = 0;
	const effect = new $$ReactiveEffect(callback);
	try {
		return effect.run();
	} finally {
		effect.stop();
		$$tracking_depth = depth;
	}
};

const $$v_n0 = $$v_template('<form>');

const $$v_n2 = $$v_template('<input class="text">');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<input class="adopted">');

const $$v_n11 = $$v_template('<span> </span>');

const $$v_n14 = $$v_template('<input class="number" type="number">');

const $$v_n17 = $$v_template('<span> </span>');

const $$v_n20 = $$v_template('<input class="checked" type="checkbox">');

const $$v_n23 = $$v_template('<span> </span>');

const $$v_n26 = $$v_template('<input class="adopted-checked" type="checkbox">');

const $$v_n29 = $$v_template('<span> </span>');

const $$v_n32 = $$v_template('<select class="single">');

const $$v_n34 = $$v_template('<option value="a">');

const $$v_n36 = $$v_template('<span>a</span>');

const $$v_n39 = $$v_template('<option value="b">');

const $$v_n41 = $$v_template('<span>b</span>');

const $$v_n45 = $$v_template('<span> </span>');

const $$v_n48 = $$v_template('<select class="multiple" multiple>');

const $$v_n50 = $$v_template('<option value="a" selected>');

const $$v_n52 = $$v_template('<span>a</span>');

const $$v_n55 = $$v_template('<option value="b">');

const $$v_n57 = $$v_template('<span>b</span>');

const $$v_n61 = $$v_template('<span> </span>');

const $$v_n64 = $$v_template('<input class="group" type="checkbox" value="a">');

const $$v_n67 = $$v_template('<span> </span>');

const $$v_n70 = $$v_template('<input class="group" type="checkbox" value="b">');

const $$v_n73 = $$v_template('<span> </span>');

const $$v_n76 = $$v_template('<input class="radio" type="radio" value="a">');

const $$v_n79 = $$v_template('<span> </span>');

const $$v_n82 = $$v_template('<input class="radio" type="radio" value="b">');

const $$v_n85 = $$v_template('<span> </span>');

const $$v_n88 = $$v_template('<button class="reset" type="reset">');

const $$v_n90 = $$v_template('<span>reset</span>');

const $$v_n94 = $$v_template('<span> </span>');

const $$v_n97 = $$v_template('<button class="program">');

const $$v_n99 = $$v_template('<span>program reset</span>');

const $$v_n102 = $$v_template('<span> </span>');

const $$v_n105 = $$v_template('<button class="cancel">');

const $$v_n107 = $$v_template('<span>cancel</span>');

const $$v_n110 = $$v_template('<span> </span>');

const $$v_n113 = $$v_template('<p>');

const $$v_n115 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const $$instance_groups = {};
	const text = $$ref('first');
	const adopted = $$ref();
	const number = $$ref(1);
	const checked = $$ref(false);
	const adoptedChecked = $$ref();
	const selected = $$ref('a');
	const multiple = $$ref(['a']);
	const group = $$ref(['a']);
	const radio = $$ref('a');
	const cancelled = $$ref(false);
	const form = $$ref();
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	$$v_on($$v_n3, 'input', ($$e) => text.value = $$e.currentTarget.value);
	const $$v_n4 = ($$el) => {
		if ($$el !== null) {
			$$el.defaultValue = 'default';
			$$form_reset($$el, 'value', () => text.value = $$reset_value($$el, $$el.value));
			$$text_initial($$el, text.value, ($$value) => text.value = $$value);
			text.value !== $$el.value && ($$el.value = text.value ?? '');
		}
	};
	$$v_renderEffect(() => $$v_n4($$v_n3));
	$$v_onScopeDispose(() => $$v_n4(null));
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n9 = $$v_n8();
	$$v_on($$v_n9, 'input', ($$e) => adopted.value = $$e.currentTarget.value);
	const $$v_n10 = ($$el) => {
		if ($$el !== null) {
			$$el.defaultValue = 'adopted';
			$$form_reset($$el, 'value', () => adopted.value = $$reset_value($$el, $$el.value));
			$$text_initial($$el, adopted.value, ($$value) => adopted.value = $$value);
			adopted.value !== $$el.value && ($$el.value = adopted.value ?? '');
		}
	};
	$$v_renderEffect(() => $$v_n10($$v_n9));
	$$v_onScopeDispose(() => $$v_n10(null));
	const $$v_n12 = $$v_n11();
	const $$v_n13 = $$v_n12.firstChild;
	const $$v_n15 = $$v_n14();
	$$v_on($$v_n15, 'input', ($$event) => number.value = $$number($$event.currentTarget.value));
	const $$v_n16 = ($$el) => {
		if ($$el !== null) {
			$$el.defaultValue = '4';
			$$form_reset($$el, 'value', () => number.value = $$reset_value($$el, $$number($$el.defaultValue)));
			$$number_value($$el, number.value, ($$value) => number.value = $$value);
		}
	};
	$$v_renderEffect(() => $$v_n16($$v_n15));
	$$v_onScopeDispose(() => $$v_n16(null));
	const $$v_n18 = $$v_n17();
	const $$v_n19 = $$v_n18.firstChild;
	const $$v_n21 = $$v_n20();
	$$v_on($$v_n21, 'change', ($$e) => checked.value = $$e.currentTarget.checked);
	const $$v_n22 = ($$el) => {
		if ($$el !== null) {
			$$el.defaultChecked = true;
			$$form_reset($$el, 'checked', () => checked.value = $$el.defaultChecked);
			$$once($$el, () => checked.value == null && (checked.value = $$el.checked));
			$$el.checked = Boolean(checked.value);
		}
	};
	$$v_renderEffect(() => $$v_n22($$v_n21));
	$$v_onScopeDispose(() => $$v_n22(null));
	const $$v_n24 = $$v_n23();
	const $$v_n25 = $$v_n24.firstChild;
	const $$v_n27 = $$v_n26();
	$$v_on($$v_n27, 'change', ($$e) => adoptedChecked.value = $$e.currentTarget.checked);
	const $$v_n28 = ($$el) => {
		if ($$el !== null) {
			$$el.defaultChecked = true;
			$$form_reset($$el, 'checked', () => adoptedChecked.value = $$el.defaultChecked);
			$$once($$el, () => adoptedChecked.value == null && (adoptedChecked.value = $$el.checked));
			$$el.checked = Boolean(adoptedChecked.value);
		}
	};
	$$v_renderEffect(() => $$v_n28($$v_n27));
	$$v_onScopeDispose(() => $$v_n28(null));
	const $$v_n30 = $$v_n29();
	const $$v_n31 = $$v_n30.firstChild;
	const $$v_n33 = $$v_n32();
	const $$v_n35 = $$v_n34();
	const $$v_n37 = $$v_n36();
	const $$v_n38 = $$v_n37.firstChild;
	$$v_insert([$$v_n38], $$v_n35);
	const $$v_n40 = $$v_n39();
	const $$v_n42 = $$v_n41();
	const $$v_n43 = $$v_n42.firstChild;
	$$v_insert([$$v_n43], $$v_n40);
	$$v_insert([$$v_n35, $$v_n40], $$v_n33);
	$$v_on($$v_n33, 'change', ($$e) => selected.value = $$option($$e.currentTarget));
	const $$v_n44 = ($$el) => {
		if ($$el !== null) {
			$$form_reset($$el, 'value', () => selected.value = $$reset_value($$el, $$el.value));
			$$select($$el, selected.value, ($$v) => selected.value = $$v);
		}
	};
	$$v_renderEffect(() => $$v_n44($$v_n33));
	$$v_onScopeDispose(() => $$v_n44(null));
	const $$v_n46 = $$v_n45();
	const $$v_n47 = $$v_n46.firstChild;
	const $$v_n49 = $$v_n48();
	const $$v_n51 = $$v_n50();
	const $$v_n53 = $$v_n52();
	const $$v_n54 = $$v_n53.firstChild;
	$$v_insert([$$v_n54], $$v_n51);
	const $$v_n56 = $$v_n55();
	const $$v_n58 = $$v_n57();
	const $$v_n59 = $$v_n58.firstChild;
	$$v_insert([$$v_n59], $$v_n56);
	$$v_insert([$$v_n51, $$v_n56], $$v_n49);
	$$v_on($$v_n49, 'change', ($$e) => multiple.value = $$option($$e.currentTarget));
	const $$v_n60 = ($$el) => {
		if ($$el !== null) {
			$$form_reset($$el, 'value', () => multiple.value = $$reset_value($$el, $$el.value));
			$$select($$el, multiple.value, ($$v) => multiple.value = $$v);
		}
	};
	$$v_renderEffect(() => $$v_n60($$v_n49));
	$$v_onScopeDispose(() => $$v_n60(null));
	const $$v_n62 = $$v_n61();
	const $$v_n63 = $$v_n62.firstChild;
	const $$v_n65 = $$v_n64();
	const $$v_n66 = ($$el) => {
		if ($$el !== null) {
			$$form_reset($$el, 'group', () => group.value = []);
			$$group($$el, $$instance_groups, group, null, () => group.value, ($$value) => group.value = $$value, 'a');
		}
	};
	$$v_renderEffect(() => $$v_n66($$v_n65));
	$$v_onScopeDispose(() => $$v_n66(null));
	const $$v_n68 = $$v_n67();
	const $$v_n69 = $$v_n68.firstChild;
	const $$v_n71 = $$v_n70();
	const $$v_n72 = ($$el) => {
		if ($$el !== null) {
			$$form_reset($$el, 'group', () => group.value = []);
			$$group($$el, $$instance_groups, group, null, () => group.value, ($$value) => group.value = $$value, 'b');
		}
	};
	$$v_renderEffect(() => $$v_n72($$v_n71));
	$$v_onScopeDispose(() => $$v_n72(null));
	const $$v_n74 = $$v_n73();
	const $$v_n75 = $$v_n74.firstChild;
	const $$v_n77 = $$v_n76();
	const $$v_n78 = ($$el) => {
		if ($$el !== null) {
			$$form_reset($$el, 'group', () => radio.value = null);
			$$group($$el, $$instance_groups, radio, null, () => radio.value, ($$value) => radio.value = $$value, 'a');
		}
	};
	$$v_renderEffect(() => $$v_n78($$v_n77));
	$$v_onScopeDispose(() => $$v_n78(null));
	const $$v_n80 = $$v_n79();
	const $$v_n81 = $$v_n80.firstChild;
	const $$v_n83 = $$v_n82();
	const $$v_n84 = ($$el) => {
		if ($$el !== null) {
			$$form_reset($$el, 'group', () => radio.value = null);
			$$group($$el, $$instance_groups, radio, null, () => radio.value, ($$value) => radio.value = $$value, 'b');
		}
	};
	$$v_renderEffect(() => $$v_n84($$v_n83));
	$$v_onScopeDispose(() => $$v_n84(null));
	const $$v_n86 = $$v_n85();
	const $$v_n87 = $$v_n86.firstChild;
	const $$v_n89 = $$v_n88();
	const $$v_n91 = $$v_n90();
	const $$v_n92 = $$v_n91.firstChild;
	$$v_insert([$$v_n92], $$v_n89);
	$$v_insert([$$v_n3, $$v_n7, $$v_n9, $$v_n13, $$v_n15, $$v_n19, $$v_n21, $$v_n25, $$v_n27, $$v_n31, $$v_n33, $$v_n47, $$v_n49, $$v_n63, $$v_n65, $$v_n69, $$v_n71, $$v_n75, $$v_n77, $$v_n81, $$v_n83, $$v_n87, $$v_n89], $$v_n1);
	$$v_on($$v_n1, 'reset', (event) => {
		if (cancelled.value) event.preventDefault();
	});
	const $$v_n93 = ($$el) => {
		form.value = $$el;
	};
	$$v_renderEffect(() => $$v_n93($$v_n1));
	$$v_onScopeDispose(() => $$v_n93(null));
	const $$v_n95 = $$v_n94();
	const $$v_n96 = $$v_n95.firstChild;
	const $$v_n98 = $$v_n97();
	const $$v_n100 = $$v_n99();
	const $$v_n101 = $$v_n100.firstChild;
	$$v_insert([$$v_n101], $$v_n98);
	$$v_on($$v_n98, 'click', () => form.value.reset());
	const $$v_n103 = $$v_n102();
	const $$v_n104 = $$v_n103.firstChild;
	const $$v_n106 = $$v_n105();
	const $$v_n108 = $$v_n107();
	const $$v_n109 = $$v_n108.firstChild;
	$$v_insert([$$v_n109], $$v_n106);
	$$v_on($$v_n106, 'click', () => cancelled.value = !cancelled.value);
	const $$v_n111 = $$v_n110();
	const $$v_n112 = $$v_n111.firstChild;
	const $$v_n114 = $$v_n113();
	const $$v_n116 = $$v_n115();
	const $$v_n117 = $$v_computed(() => group.value.join(','));
	const $$v_n118 = $$v_computed(() => multiple.value.join(','));
	$$v_insert([$$v_n116], $$v_n114);
	$$v_renderEffect(() => {
		$$v_n118.value;
		$$v_n117.value;
		$$v_setText($$v_n116, `${text.value ?? ''}:${adopted.value ?? ''}:${number.value ?? ''}:${typeof number.value}:${checked.value ?? ''}:${adoptedChecked.value ?? ''}:${selected.value ?? ''}:${$$v_n118.value ?? ''}:${$$v_n117.value ?? ''}:${radio.value ?? ''}:${cancelled.value ?? ''}`);
	});
	return [$$v_n1, $$v_n96, $$v_n98, $$v_n104, $$v_n106, $$v_n112, $$v_n114];
} });
