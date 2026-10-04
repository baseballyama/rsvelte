import { currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, getCurrentScope as $$v_getCurrentScope, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, renderEffect as $$v_renderEffect, restoreCurrentInstance as $$v_restoreCurrentInstance, setCurrentInstance as $$v_setCurrentInstance, setText as $$v_setText, template as $$v_template } from 'vue';

import { customRef as $$createState, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect, watch as $$watch, onScopeDispose as $$onScopeDispose } from 'vue';

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

const $$property_binding = (element, name, event, getter, setter, readonly) => {
	if (!$$lifecycle_once(element, 'bind:' + name)) return;
	const update = () => setter(name === 'focused' ? element === document.activeElement : element[name]);
	const events = event.split(' ');
	events.forEach((event) => element.addEventListener(event, update));
	$$onScopeDispose(() => events.forEach((event) => element.removeEventListener(event, update)));
	if (readonly) update(); else $$watchPostEffect(() => {
		const value = getter();
		if (name === 'innerHTML' || name === 'innerText' || name === 'textContent') {
			if (element[name] !== value) {
				if (value == null) setter(element[name]); else element[name] = String(value);
			}
		} else element[name] = value;
	});
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

const $$v_n0 = $$v_template('<div class="html" contenteditable="true">');

const $$v_n2 = $$v_template('<span>fallback html</span>');

const $$v_n6 = $$v_template('<span> </span>');

const $$v_n9 = $$v_template('<div class="text" contenteditable="true">');

const $$v_n11 = $$v_template('<span>fallback text</span>');

const $$v_n15 = $$v_template('<span> </span>');

const $$v_n18 = $$v_template('<div class="adopted" contenteditable="true">');

const $$v_n20 = $$v_template('<span>');

const $$v_n22 = $$v_template('<span>initial</span>');

const $$v_n26 = $$v_template('<span> </span>');

const $$v_n29 = $$v_template('<button class="edit">');

const $$v_n31 = $$v_template('<span>edit</span>');

const $$v_n34 = $$v_template('<span> </span>');

const $$v_n37 = $$v_template('<button class="replace">');

const $$v_n39 = $$v_template('<span>replace</span>');

const $$v_n42 = $$v_template('<span> </span>');

const $$v_n45 = $$v_template('<p>');

const $$v_n47 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const html = $$ref('<b>first</b>');
	const text = $$ref('plain <text>');
	const adopted = $$ref();
	const htmlElement = $$ref();
	const textElement = $$ref();
	function edit() {
		htmlElement.value.innerHTML = '<em>edited</em>';
		htmlElement.value.dispatchEvent(new Event('input', { bubbles: true }));
		textElement.value.textContent = 'edited <text>';
		textElement.value.dispatchEvent(new Event('input', { bubbles: true }));
	}
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_n3.firstChild;
	$$v_insert([$$v_n4], $$v_n1);
	const $$v_n5 = ($$el) => {
		if ($$el !== null) {
			$$property_binding($$el, 'innerHTML', 'input', () => html.value, ($$value) => html.value = $$value, false);
		}
		htmlElement.value = $$el;
	};
	$$v_renderEffect(() => $$v_n5($$v_n1));
	$$v_onScopeDispose(() => $$v_n5(null));
	const $$v_n7 = $$v_n6();
	const $$v_n8 = $$v_n7.firstChild;
	const $$v_n10 = $$v_n9();
	const $$v_n12 = $$v_n11();
	const $$v_n13 = $$v_n12.firstChild;
	$$v_insert([$$v_n13], $$v_n10);
	const $$v_n14 = ($$el) => {
		if ($$el !== null) {
			$$property_binding($$el, 'textContent', 'input', () => text.value, ($$value) => text.value = $$value, false);
		}
		textElement.value = $$el;
	};
	$$v_renderEffect(() => $$v_n14($$v_n10));
	$$v_onScopeDispose(() => $$v_n14(null));
	const $$v_n16 = $$v_n15();
	const $$v_n17 = $$v_n16.firstChild;
	const $$v_n19 = $$v_n18();
	const $$v_n21 = $$v_n20();
	const $$v_n23 = $$v_n22();
	const $$v_n24 = $$v_n23.firstChild;
	$$v_insert([$$v_n24], $$v_n21);
	$$v_insert([$$v_n21], $$v_n19);
	const $$v_n25 = ($$el) => {
		if ($$el !== null) {
			$$property_binding($$el, 'textContent', 'input', () => adopted.value, ($$value) => adopted.value = $$value, false);
		}
	};
	$$v_renderEffect(() => $$v_n25($$v_n19));
	$$v_onScopeDispose(() => $$v_n25(null));
	const $$v_n27 = $$v_n26();
	const $$v_n28 = $$v_n27.firstChild;
	const $$v_n30 = $$v_n29();
	const $$v_n32 = $$v_n31();
	const $$v_n33 = $$v_n32.firstChild;
	$$v_insert([$$v_n33], $$v_n30);
	$$v_on($$v_n30, 'click', edit);
	const $$v_n35 = $$v_n34();
	const $$v_n36 = $$v_n35.firstChild;
	const $$v_n38 = $$v_n37();
	const $$v_n40 = $$v_n39();
	const $$v_n41 = $$v_n40.firstChild;
	$$v_insert([$$v_n41], $$v_n38);
	$$v_on($$v_n38, 'click', () => {
		html.value = '<i>replacement</i>';
		text.value = 'replacement & text';
		adopted.value = '';
	});
	const $$v_n43 = $$v_n42();
	const $$v_n44 = $$v_n43.firstChild;
	const $$v_n46 = $$v_n45();
	const $$v_n48 = $$v_n47();
	$$v_insert([$$v_n48], $$v_n46);
	$$v_renderEffect(() => {
		$$v_setText($$v_n48, `${html.value ?? ''}:${text.value ?? ''}:${adopted.value ?? ''}`);
	});
	return [$$v_n1, $$v_n8, $$v_n10, $$v_n17, $$v_n19, $$v_n28, $$v_n30, $$v_n36, $$v_n38, $$v_n44, $$v_n46];
} });
