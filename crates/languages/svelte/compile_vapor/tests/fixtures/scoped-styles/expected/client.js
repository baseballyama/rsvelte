import { currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, getCurrentScope as $$v_getCurrentScope, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, renderEffect as $$v_renderEffect, restoreCurrentInstance as $$v_restoreCurrentInstance, setCurrentInstance as $$v_setCurrentInstance, template as $$v_template } from 'vue';

import { customRef as $$createState, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect, watch as $$watch, onScopeDispose as $$onScopeDispose } from 'vue';

const $$keys = (o, seen = [], out = []) => {
	if (o == null) return out;
	Object.getOwnPropertyNames(o).forEach((k) => {
		if (seen.indexOf(k) < 0) {
			seen.push(k);
			if (Object.prototype.propertyIsEnumerable.call(o, k)) out.push(k);
		}
	});
	return $$keys(Object.getPrototypeOf(o), seen, out);
};

const $$clsx = (mix) => {
	if (typeof mix === 'string' || typeof mix === 'number') return '' + mix;
	if (typeof mix !== 'object' || mix === null) return '';
	if (Array.isArray(mix)) {
		return Array.from({ length: mix.length }, (_, k) => mix[k]).filter((x) => x).map((x) => $$clsx(x)).filter((y) => y).join(' ');
	}
	return $$keys(mix).filter((k) => mix[k]).join(' ');
};

const $$sclsx = (v) => typeof v === 'object' ? $$clsx(v) : v ?? '';

const $$ws = [32, 9, 10, 13, 12, 160, 11, 65279].map((c) => String.fromCharCode(c));

const $$remove_class = (name, key, a) => {
	const at = name.indexOf(key, a);
	if (at < 0) return name;
	const b = at + key.length;
	if ((at === 0 || $$ws.includes(name[at - 1])) && (b === name.length || $$ws.includes(name[b]))) {
		const head = at === 0 ? '' : name.substring(0, at);
		return $$remove_class(head + name.substring(b + 1), key, at);
	}
	return $$remove_class(name, key, b);
};

const $$to_class = (value, directives) => {
	let name = value == null ? '' : '' + value;
	if (directives) {
		Object.keys(directives).forEach((key) => {
			if (directives[key]) name = name ? name + ' ' + key : key; else if (name.length) name = $$remove_class(name, key, 0);
		});
	}
	return name === '' ? null : name;
};

const $$set_class = (el, value, next) => {
	const prev = el.$$class;
	if (prev !== value || prev === undefined) {
		const name = $$to_class(value, next);
		if (name == null) el.removeAttribute('class'); else el.setAttribute('class', name);
		el.$$class = value;
	} else if (el.$$classes !== next) {
		const before = el.$$classes;
		Object.keys(next).forEach((key) => {
			const present = !!next[key];
			if (before == null || present !== !!before[key]) {
				el.classList.toggle(key, present);
			}
		});
	}
	el.$$classes = next;
};

const $$setters_cache = new Map();

const $$collect_setters = (proto, setters) => {
	if (proto === Element.prototype) return setters;
	const descriptors = Object.getOwnPropertyDescriptors(proto);
	Object.keys(descriptors).forEach((key) => {
		if (descriptors[key].set && key !== 'innerHTML' && key !== 'textContent' && key !== 'innerText') setters.add(key);
	});
	return $$collect_setters(Object.getPrototypeOf(proto), setters);
};

const $$setters = (el) => {
	const id = el.getAttribute('is') || el.nodeName;
	let setters = $$setters_cache.get(id);
	if (setters) return setters;
	$$setters_cache.set(id, setters = new Set());
	return $$collect_setters(el, setters);
};

const $$uninitialized = Symbol();

const $$set_attribute = (el, name, value) => {
	const cache = el.$$attributes;
	if (cache[name] === (cache[name] = value)) return;
	if (value == null) el.removeAttribute(name); else if (typeof value !== 'string' && $$setters(el).has(name)) el[name] = value; else el.setAttribute(name, value);
};

const $$aliases = { formnovalidate: 'formNoValidate', ismap: 'isMap', nomodule: 'noModule', playsinline: 'playsInline', readonly: 'readOnly', defaultvalue: 'defaultValue', defaultchecked: 'defaultChecked', srcobject: 'srcObject', novalidate: 'noValidate', allowfullscreen: 'allowFullscreen', disablepictureinpicture: 'disablePictureInPicture', disableremoteplayback: 'disableRemotePlayback' };

const $$delegated = ['beforeinput', 'click', 'change', 'dblclick', 'contextmenu', 'focusin', 'focusout', 'input', 'keydown', 'keyup', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'pointerdown', 'pointermove', 'pointerout', 'pointerover', 'pointerup', 'touchend', 'touchmove', 'touchstart'];

const $$set_event = (el, current, key, value, prev_value) => {
	let name = key.slice(2);
	const delegated = $$delegated.includes(name);
	const capture = name.endsWith('capture') && name !== 'gotpointercapture' && name !== 'lostpointercapture';
	if (capture) name = name.slice(0, -7);
	const opts = capture ? { capture: true } : {};
	if (!delegated && prev_value) {
		if (value != null) return;
		el.removeEventListener(name, current['$$' + key], opts);
		current['$$' + key] = null;
	}
	if (delegated) {
		el['__' + name] = value;
		if (el['$$delegate_' + name]) return;
		el['$$delegate_' + name] = true;
		el.addEventListener(name, (evt) => {
			const handler = el['__' + name];
			if (handler != null && (!el.disabled || evt.target === el)) {
				if (Array.isArray(handler)) handler[0].apply(el, [evt, ...handler.slice(1)]); else handler.call(el, evt);
			}
		}, { passive: name === 'touchstart' || name === 'touchmove' });
	} else if (value != null) {
		const handle = function (evt) {
			if (!evt.cancelBubble) current[key].call(this, evt);
		};
		current['$$' + key] = handle;
		if (name.startsWith('pointer') || name.startsWith('touch') || name === 'wheel') {
			queueMicrotask(() => el.addEventListener(name, handle, opts));
		} else {
			el.addEventListener(name, handle, opts);
		}
	}
};

const $$set_key = (el, cache, prev, current, setters, key, value) => {
	const custom = el.nodeName.includes('-');
	if (key === 'class') {
		if (el.$$class !== value || el.$$class === undefined) {
			const name = $$to_class(value);
			if (name == null) el.removeAttribute('class'); else el.setAttribute('class', name);
			el.$$class = value;
		}
		current[key] = value;
		return;
	}
	if (key === 'style') {
		if (el.$$style !== value) {
			if (value == null) el.removeAttribute('style'); else el.style.cssText = String(value);
			el.$$style = value;
		}
		current[key] = value;
		return;
	}
	const prev_value = current[key];
	if (value === prev_value && !(value === undefined && el.hasAttribute(key))) return;
	current[key] = value;
	const prefix = key[0] + key[1];
	if (prefix === '$$') return;
	if (prefix === 'on') {
		$$set_event(el, current, key, value, prev_value);
	} else if (key === 'autofocus') {
		if (value) {
			const body = document.body;
			el.autofocus = true;
			queueMicrotask(() => {
				if (document.activeElement === body) el.focus();
			});
		}
	} else if (!custom && (key === '__value' || key === 'value' && value != null)) {
		el.value = el.__value = value;
	} else {
		const lower = key.toLowerCase();
		const name = el.namespaceURI === 'http://www.w3.org/1999/xhtml' ? $$aliases[lower] ?? lower : key;
		const is_default = name === 'defaultValue' || name === 'defaultChecked';
		if (value == null && !custom && !is_default) {
			cache[key] = null;
			if (name === 'value') {
				const previous = el.defaultValue;
				el.removeAttribute(name);
				el.defaultValue = previous;
				el.value = el.__value = prev === undefined ? previous : null;
			} else if (name === 'checked') {
				const previous = el.defaultChecked;
				el.removeAttribute(name);
				el.defaultChecked = previous;
				el.checked = prev === undefined ? previous : false;
			} else {
				el.removeAttribute(key);
			}
		} else if (is_default || (custom || typeof value !== 'string') && setters.has(name)) {
			el[name] = value;
			if (name in cache) cache[name] = $$uninitialized;
		} else if (typeof value !== 'function') {
			$$set_attribute(el, name, value);
		}
	}
};

const $$attributes = (el, next) => {
	el.$$attributes ??= {};
	const prev = el.$$prev;
	const current = prev || {};
	if (prev) {
		Object.keys(prev).forEach((key) => {
			if (!(key in next) && key[0] + key[1] !== '$$') next[key] = null;
		});
	}
	if (next.class) next.class = $$sclsx(next.class);
	const setters = $$setters(el);
	Object.keys(next).forEach((key) => $$set_key(el, el.$$attributes, prev, current, setters, key, next[key]));
	$$spread_attachments(el, next);
	el.$$prev = current;
};

const $$fail = (message) => Object.defineProperty(Object.preventExtensions({}), 'vuelte: ' + message, { value: 0 });

const $$scoped_class = (value, hash) => {
	const name = $$sclsx(value);
	return name == null || name === '' ? hash : name + ' ' + hash;
};

const $$scoped_spread = (value, hash) => ({ ...value, class: $$scoped_class(value.class, hash) });

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

const $$v_n0 = $$v_template('<button>');

const $$v_n2 = $$v_template('<span>toggle</span>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<p>');

const $$v_n10 = $$v_template('<span>styled</span>');

const $$v_n14 = $$v_template('<span> </span>');

const $$v_n17 = $$v_template('<div>');

const $$v_n19 = $$v_template('<span>spread</span>');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const active = $$ref(false);
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_n3.firstChild;
	$$v_insert([$$v_n4], $$v_n1);
	$$v_on($$v_n1, 'click', () => active.value = !active.value);
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n9 = $$v_n8();
	const $$v_n11 = $$v_n10();
	const $$v_n12 = $$v_n11.firstChild;
	$$v_insert([$$v_n12], $$v_n9);
	const $$v_n13 = ($$el) => {
		if ($$el !== null) {
			$$set_class($$el, $$scoped_class($$sclsx(active.value ? ['active'] : []), 'svelte-5pfsdn'), { 'extra': active.value });
		}
	};
	$$v_onScopeDispose(() => $$v_n13(null));
	const $$v_n15 = $$v_n14();
	const $$v_n16 = $$v_n15.firstChild;
	const $$v_n18 = $$v_n17();
	const $$v_n20 = $$v_n19();
	const $$v_n21 = $$v_n20.firstChild;
	$$v_insert([$$v_n21], $$v_n18);
	const $$v_n22 = ($$el) => {
		if ($$el !== null) {
			$$attributes($$el, $$scoped_spread({ ...{ class: active.value ? 'active' : '', title: 'spread' } }, 'svelte-5pfsdn'));
		}
	};
	$$v_renderEffect(() => $$v_n22($$v_n18));
	$$v_onScopeDispose(() => $$v_n22(null));
	$$v_renderEffect(() => {
		$$v_n13($$v_n9);
	});
	return [$$v_n1, $$v_n7, $$v_n9, $$v_n16, $$v_n18];
} });
