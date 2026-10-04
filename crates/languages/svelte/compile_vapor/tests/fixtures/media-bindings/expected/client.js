import { computed as $$v_computed, currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, getCurrentScope as $$v_getCurrentScope, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, renderEffect as $$v_renderEffect, restoreCurrentInstance as $$v_restoreCurrentInstance, setCurrentInstance as $$v_setCurrentInstance, setText as $$v_setText, template as $$v_template } from 'vue';

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

const $$media_ranges = (ranges) => Array.from({ length: ranges.length }, (_, index) => ({ start: ranges.start(index), end: ranges.end(index) }));

const $$media_binding = (element, name, event, getter, setter, readonly) => {
	if (!$$lifecycle_once(element, 'bind:' + name)) return;
	const ranges = name === 'buffered' || name === 'played' || name === 'seekable';
	let previous;
	let frame;
	let initial = true;
	const update = () => {
		const value = ranges ? $$media_ranges(element[name]) : element[name];
		const equal = ranges ? name === 'buffered' && previous && previous.length === value.length && previous.every((range, index) => range.start === value[index].start && range.end === value[index].end) : Object.is(previous, value);
		if (!equal) {
			previous = value;
			setter(value);
		}
	};
	const tick = () => {
		cancelAnimationFrame(frame);
		if (!element.paused) frame = requestAnimationFrame(tick);
		update();
	};
	const events = event.split(' ');
	const listener = name === 'currentTime' ? tick : update;
	events.forEach((event) => element.addEventListener(event, listener));
	$$onScopeDispose(() => {
		events.forEach((event) => element.removeEventListener(event, listener));
		if (frame !== undefined) cancelAnimationFrame(frame);
	});
	if (readonly || (name === 'volume' || name === 'muted' || name === 'paused') && getter() == null) update();
	if (name === 'currentTime') frame = requestAnimationFrame(tick);
	if (!readonly) $$watchPostEffect(() => {
		const value = getter();
		if (name === 'paused') {
			const paused = !!value;
			if (paused !== element.paused) {
				if (paused) element.pause(); else element.play().catch((error) => {
					setter(true);
					throw error;
				});
			}
		} else if (name === 'muted') {
			if (element.muted !== !!value) element.muted = !!value;
		} else {
			const number = Number(value);
			if (!Number.isNaN(number) && element[name] !== number) {
				element[name] = number;
				if (name === 'currentTime') previous = number;
			}
			if (name === 'playbackRate' && initial) {
				initial = false;
				update();
			}
		}
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

const $$v_n0 = $$v_template('<video>');

const $$v_n3 = $$v_template('<span> </span>');

const $$v_n6 = $$v_template('<button class="write">');

const $$v_n8 = $$v_template('<span>write</span>');

const $$v_n11 = $$v_template('<span> </span>');

const $$v_n14 = $$v_template('<button class="inspect">');

const $$v_n16 = $$v_template('<span>inspect</span>');

const $$v_n19 = $$v_template('<span> </span>');

const $$v_n22 = $$v_template('<button class="event">');

const $$v_n24 = $$v_template('<span>event</span>');

const $$v_n27 = $$v_template('<span> </span>');

const $$v_n30 = $$v_template('<p>');

const $$v_n32 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const video = $$ref();
	const time = $$ref(0);
	const duration = $$ref();
	const volume = $$ref();
	const muted = $$ref();
	const paused = $$ref();
	const rate = $$ref();
	const buffered = $$ref();
	const seekable = $$ref();
	const played = $$ref();
	const seeking = $$ref();
	const ended = $$ref();
	const ready = $$ref();
	const width = $$ref();
	const height = $$ref();
	function inspect() {
		return `${video.value.currentTime}:${video.value.volume}:${video.value.muted}:${video.value.playbackRate}`;
	}
	const observed = $$ref('');
	function dispatch() {
		video.value.currentTime = 8;
		video.value.volume = 0.25;
		video.value.muted = false;
		video.value.playbackRate = 0.5;
		for (const event of ['timeupdate', 'volumechange', 'ratechange', 'durationchange', 'loadedmetadata', 'seeking', 'seeked', 'ended', 'resize']) video.value.dispatchEvent(new Event(event));
	}
	const $$v_n1 = $$v_n0();
	const $$v_n2 = ($$el) => {
		if ($$el !== null) {
			$$media_binding($$el, 'currentTime', 'timeupdate', () => time.value, ($$value) => time.value = $$value, false);
			$$media_binding($$el, 'duration', 'durationchange', () => duration.value, ($$value) => duration.value = $$value, true);
			$$media_binding($$el, 'volume', 'volumechange', () => volume.value, ($$value) => volume.value = $$value, false);
			$$media_binding($$el, 'muted', 'volumechange', () => muted.value, ($$value) => muted.value = $$value, false);
			$$media_binding($$el, 'paused', 'play pause canplay', () => paused.value, ($$value) => paused.value = $$value, false);
			$$media_binding($$el, 'playbackRate', 'ratechange', () => rate.value, ($$value) => rate.value = $$value, false);
			$$media_binding($$el, 'buffered', 'loadedmetadata progress timeupdate seeking', () => buffered.value, ($$value) => buffered.value = $$value, true);
			$$media_binding($$el, 'seekable', 'loadedmetadata', () => seekable.value, ($$value) => seekable.value = $$value, true);
			$$media_binding($$el, 'played', 'timeupdate', () => played.value, ($$value) => played.value = $$value, true);
			$$media_binding($$el, 'seeking', 'seeking seeked', () => seeking.value, ($$value) => seeking.value = $$value, true);
			$$media_binding($$el, 'ended', 'timeupdate ended', () => ended.value, ($$value) => ended.value = $$value, true);
			$$media_binding($$el, 'readyState', 'loadedmetadata loadeddata canplay canplaythrough playing waiting emptied', () => ready.value, ($$value) => ready.value = $$value, true);
			$$property_binding($$el, 'videoWidth', 'resize', () => width.value, ($$value) => width.value = $$value, true);
			$$property_binding($$el, 'videoHeight', 'resize', () => height.value, ($$value) => height.value = $$value, true);
		}
		video.value = $$el;
	};
	$$v_renderEffect(() => $$v_n2($$v_n1));
	$$v_onScopeDispose(() => $$v_n2(null));
	const $$v_n4 = $$v_n3();
	const $$v_n5 = $$v_n4.firstChild;
	const $$v_n7 = $$v_n6();
	const $$v_n9 = $$v_n8();
	const $$v_n10 = $$v_n9.firstChild;
	$$v_insert([$$v_n10], $$v_n7);
	$$v_on($$v_n7, 'click', () => {
		time.value = 5;
		volume.value = 0.5;
		muted.value = true;
		rate.value = 2;
	});
	const $$v_n12 = $$v_n11();
	const $$v_n13 = $$v_n12.firstChild;
	const $$v_n15 = $$v_n14();
	const $$v_n17 = $$v_n16();
	const $$v_n18 = $$v_n17.firstChild;
	$$v_insert([$$v_n18], $$v_n15);
	$$v_on($$v_n15, 'click', () => observed.value = inspect());
	const $$v_n20 = $$v_n19();
	const $$v_n21 = $$v_n20.firstChild;
	const $$v_n23 = $$v_n22();
	const $$v_n25 = $$v_n24();
	const $$v_n26 = $$v_n25.firstChild;
	$$v_insert([$$v_n26], $$v_n23);
	$$v_on($$v_n23, 'click', dispatch);
	const $$v_n28 = $$v_n27();
	const $$v_n29 = $$v_n28.firstChild;
	const $$v_n31 = $$v_n30();
	const $$v_n33 = $$v_n32();
	const $$v_n34 = $$v_computed(() => String(duration.value));
	$$v_insert([$$v_n33], $$v_n31);
	$$v_renderEffect(() => {
		$$v_n34.value;
		$$v_setText($$v_n33, `${time.value ?? ''}:${$$v_n34.value}:${volume.value ?? ''}:${muted.value ?? ''}:${paused.value ?? ''}:${rate.value ?? ''}:${buffered.value?.length ?? ''}:${seekable.value?.length ?? ''}:${played.value?.length ?? ''}:${seeking.value ?? ''}:${ended.value ?? ''}:${ready.value ?? ''}:${width.value ?? ''}:${height.value ?? ''}:${observed.value ?? ''}`);
	});
	return [$$v_n1, $$v_n5, $$v_n7, $$v_n13, $$v_n15, $$v_n21, $$v_n23, $$v_n29, $$v_n31];
} });
