import { VaporFragment as $$v_VaporFragment, computed as $$v_computed, createFor as $$v_createFor, currentInstance as $$v_currentInstance, defineVaporComponent as $$v_defineVaporComponent, getCurrentScope as $$v_getCurrentScope, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, queuePostFlushCb as $$v_queuePostFlushCb, remove as $$v_remove, renderEffect as $$v_renderEffect, restoreCurrentInstance as $$v_restoreCurrentInstance, setCurrentInstance as $$v_setCurrentInstance, setText as $$v_setText, template as $$v_template } from 'vue';

import { customRef as $$createState, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect, watch as $$watch, onScopeDispose as $$onScopeDispose } from 'vue';

const $$each = (c) => c == null ? [] : Array.from(c);

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

let $$transition_context = null;

const $$transition_controllers = new WeakMap();

const $$transition_visit = (block, callback) => {
	if (block instanceof Element) {
		callback(block);
		block.querySelectorAll('*').forEach(callback);
	} else if (Array.isArray(block)) {
		block.forEach((child) => $$transition_visit(child, callback));
	} else if (block && !(block instanceof Node)) {
		$$transition_visit(block.nodes ?? block.block, callback);
	}
};

const $$transition_pause = (root, paused) => {
	if (paused) root.effects.pause(); else root.effects.resume();
	root.children.forEach((child) => $$transition_pause(child, paused));
};

const $$transition_branch = (render, key) => {
	const owner = $$transition_context;
	const roots = new Map();
	let disposed = false;
	$$onScopeDispose(() => {
		disposed = true;
		roots.forEach((root) => root.destroy());
		roots.clear();
	});
	const branch = (...args) => {
		const identity = key ? key() : args.length ? args : render;
		const previous = roots.get(identity);
		if (previous?.leaving) {
			previous.leaving = false;
			previous.version++;
			$$transition_pause(previous, false);
			previous.active.forEach((controller) => controller.enter());
			return previous;
		}
		const initializing = $$transition_context;
		const parent = initializing ?? owner;
		const root = Object.assign(new $$v_VaporFragment(null), { nodes: null, effects: $$effectScope(true), children: new Set(), active: [], intro: !initializing, leaving: false, version: 0, destroy() {
			root.version++;
			root.active.forEach((controller) => controller.stop());
			root.effects.stop();
			parent?.children.delete(root);
			roots.delete(identity);
		}, remove(container) {
			if (disposed) {
				root.destroy();
				$$v_remove(root.nodes, container);
				return;
			}
			root.leaving = true;
			$$transition_pause(root, true);
			const version = ++root.version;
			const controllers = [];
			$$transition_visit(root.nodes, (element) => {
				($$transition_controllers.get(element) ?? []).forEach((controller) => {
					if (controller.root === root || controller.global) controllers.push(controller);
				});
			});
			root.active = controllers;
			let remaining = controllers.length;
			const finish = () => {
				if (version !== root.version || !root.leaving) return;
				remaining--;
				if (remaining > 0) return;
				root.destroy();
				$$v_remove(root.nodes, container);
			};
			if (!remaining) finish(); else controllers.forEach((controller) => controller.leave(finish));
		} });
		roots.set(identity, root);
		parent?.children.add(root);
		$$transition_context = root;
		try {
			root.nodes = root.effects.run(() => render(...args));
		} finally {
			$$transition_context = initializing;
		}
		return root;
	};
	Object.defineProperty(branch, 'length', { value: render.length });
	return branch;
};

const $$transition_keyed = (getKey, render) => {
	let key;
	return $$v_createKeyedFragment(() => key = getKey(), $$transition_branch(render, () => key));
};

const $$transition_frame_ms = 1000 / 60;

const $$transition_keyframe = (css) => {
	const style = document.createElement('div').style;
	style.cssText = css;
	const frame = {};
	Array.from(style).forEach((name) => {
		const key = name.startsWith('--') ? name : name === 'float' ? 'cssFloat' : name === 'offset' ? 'cssOffset' : name.split('-').map((part, index) => index ? part[0].toUpperCase() + part.slice(1) : part).join('');
		frame[key] = style.getPropertyValue(name);
	});
	return frame;
};

const $$transition_motion = (element, config, counterpart, destination, start, finish) => {
	let active = true;
	let completing = true;
	let animation;
	let frame;
	let progress = () => 1 - destination;
	const motion = { position: () => progress(), deactivate() {
		completing = false;
	}, stop() {
		active = false;
		cancelAnimationFrame(frame);
		if (animation) {
			animation.onfinish = null;
			animation.cancel();
			animation.effect = null;
		}
	} };
	counterpart?.deactivate();
	queueMicrotask(() => {
		if (!active) return;
		if (typeof config === 'function') config = config({ direction: destination ? 'in' : 'out' });
		const { delay = 0, duration = 0, easing = (value) => value, css, tick } = config ?? {};
		const initial = counterpart ? counterpart.position() : 1 - destination;
		if (!delay && !duration) {
			counterpart?.stop();
			progress = () => destination;
			start();
			tick?.(destination, 1 - destination);
			if (completing) finish();
			return;
		}
		const delayed = [];
		if (destination && !counterpart) {
			tick?.(0, 1);
			if (css) {
				const frame = $$transition_keyframe(css(0, 1));
				delayed.push(frame, frame);
			}
		}
		animation = element.animate(delayed, { duration: delay, fill: 'forwards' });
		animation.onfinish = () => {
			if (!active) return;
			animation.cancel();
			const from = counterpart ? counterpart.position() : initial;
			counterpart?.stop();
			const length = duration * Math.abs(destination - from);
			const frames = [];
			if (css && length) {
				const count = Math.ceil(length / $$transition_frame_ms);
				for (let index = 0; index <= count; index++) {
					const value = from + (destination - from) * easing(index / count);
					frames.push($$transition_keyframe(css(value, 1 - value)));
				}
			}
			animation = element.animate(frames, { duration: length, fill: 'forwards' });
			progress = () => length ? from + (destination - from) * easing(Math.min(1, Number(animation.currentTime) / length)) : destination;
			start();
			const update = () => {
				if (!active || animation.playState !== 'running') return;
				const value = progress();
				tick?.(value, 1 - value);
				frame = requestAnimationFrame(update);
			};
			if (tick) frame = requestAnimationFrame(update);
			animation.onfinish = () => {
				progress = () => destination;
				tick?.(destination, 1 - destination);
				if (completing) finish();
			};
		};
	});
	return motion;
};

const $$transition = (element, key, getFunction, getParameter, intro, outro, global) => {
	if (!$$lifecycle_once(element, key)) return;
	const root = $$transition_context;
	const direction = intro && outro ? 'both' : intro ? 'in' : 'out';
	const inert = element.inert;
	let options;
	let entering;
	let leaving;
	const configuration = () => options ??= $$untrack(() => getFunction()(element, getParameter(), { direction }));
	const event = (name) => $$untrack(() => element.dispatchEvent(new CustomEvent(name)));
	const controller = { root, global, enter() {
		element.inert = inert;
		if (!intro) {
			leaving?.stop();
			return;
		}
		if (!outro) entering?.stop();
		entering = $$transition_motion(element, configuration(), leaving, 1, () => event('introstart'), () => {
			event('introend');
			entering?.stop();
			entering = options = undefined;
		});
	}, leave(done) {
		if (!outro) {
			done();
			return;
		}
		element.inert = true;
		leaving = $$transition_motion(element, configuration(), intro ? entering : undefined, 0, () => event('outrostart'), () => {
			event('outroend');
			done();
		});
	}, stop() {
		entering?.stop();
		leaving?.stop();
	} };
	const controllers = $$transition_controllers.get(element) ?? [];
	controllers.push(controller);
	$$transition_controllers.set(element, controllers);
	$$onScopeDispose(() => {
		controller.stop();
		$$transition_controllers.delete(element);
	});
	if (intro && (global || root?.intro)) $$v_queuePostFlushCb(() => controller.enter());
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

const $$v_n2 = $$v_template('<span>remove</span>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<button>');

const $$v_n10 = $$v_template('<span>add</span>');

const $$v_n13 = $$v_template('<span> </span>');

const $$v_n16 = $$v_template('<button>');

const $$v_n18 = $$v_template('<span>reverse</span>');

const $$v_n21 = $$v_template('<span> </span>');

const $$v_n24 = $$v_template('<button>');

const $$v_n26 = $$v_template('<span>key</span>');

const $$v_n29 = $$v_template('<span> </span>');

const $$v_n32 = $$v_template('<output>');

const $$v_n34 = $$v_template(' ');

const $$v_n37 = $$v_template('<span> </span>');

const $$v_n40 = $$v_template('<ul>');

const $$v_n42 = $$v_template('<li>');

const $$v_n44 = $$v_template(' ');

const $$v_n48 = $$v_template('<span> </span>');

const $$v_n51 = $$v_template('<p>');

const $$v_n53 = $$v_template(' ');

const $$v_n56 = $$v_template('<span> </span>');

const $$v_n59 = $$v_template('<span>');

const $$v_n61 = $$v_template('<span>key group</span>');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const items = $$ref([1, 2]);
	const revision = $$ref(0);
	const events = $$ref([]);
	function fade() {
		return { duration: 400, css: (t) => `opacity: ${t}` };
	}
	return $$transition_branch(() => {
		const $$v_n1 = $$v_n0();
		const $$v_n3 = $$v_n2();
		const $$v_n4 = $$v_n3.firstChild;
		$$v_insert([$$v_n4], $$v_n1);
		$$v_on($$v_n1, 'click', () => items.value = items.value.slice(1));
		const $$v_n6 = $$v_n5();
		const $$v_n7 = $$v_n6.firstChild;
		const $$v_n9 = $$v_n8();
		const $$v_n11 = $$v_n10();
		const $$v_n12 = $$v_n11.firstChild;
		$$v_insert([$$v_n12], $$v_n9);
		$$v_on($$v_n9, 'click', () => items.value = [...items.value, (items.value.at(-1) ?? 0) + 1]);
		const $$v_n14 = $$v_n13();
		const $$v_n15 = $$v_n14.firstChild;
		const $$v_n17 = $$v_n16();
		const $$v_n19 = $$v_n18();
		const $$v_n20 = $$v_n19.firstChild;
		$$v_insert([$$v_n20], $$v_n17);
		$$v_on($$v_n17, 'click', () => items.value.reverse());
		const $$v_n22 = $$v_n21();
		const $$v_n23 = $$v_n22.firstChild;
		const $$v_n25 = $$v_n24();
		const $$v_n27 = $$v_n26();
		const $$v_n28 = $$v_n27.firstChild;
		$$v_insert([$$v_n28], $$v_n25);
		$$v_on($$v_n25, 'click', () => revision.value++);
		const $$v_n30 = $$v_n29();
		const $$v_n31 = $$v_n30.firstChild;
		const $$v_n33 = $$v_n32();
		const $$v_n35 = $$v_n34();
		const $$v_n36 = $$v_computed(() => events.value.join(','));
		$$v_insert([$$v_n35], $$v_n33);
		const $$v_n38 = $$v_n37();
		const $$v_n39 = $$v_n38.firstChild;
		const $$v_n41 = $$v_n40();
		const $$v_n47 = $$v_createFor(() => $$each(items.value), $$transition_branch((item, index) => {
			const $$v_n43 = $$v_n42();
			const $$v_n45 = $$v_n44();
			$$v_insert([$$v_n45], $$v_n43);
			$$v_on($$v_n43, 'introstart', () => events.value.push('in' + item.value));
			$$v_on($$v_n43, 'outrostart', () => events.value.push('out' + item.value));
			const $$v_n46 = ($$el) => {
				if ($$el !== null) {
					$$transition($$el, 517, () => fade, () => ({}), true, true, false);
				}
			};
			$$v_renderEffect(() => $$v_n46($$v_n43));
			$$v_onScopeDispose(() => $$v_n46(null));
			$$v_renderEffect(() => {
				$$v_setText($$v_n45, `${item.value ?? ''}:${index.value}`);
			});
			return $$v_n43;
		}), (item, index) => item);
		$$v_insert([$$v_n47], $$v_n41);
		const $$v_n49 = $$v_n48();
		const $$v_n50 = $$v_n49.firstChild;
		const $$v_n64 = $$v_createFor(() => [revision.value], $$transition_branch(($$key) => {
			const $$v_n52 = $$v_n51();
			const $$v_n54 = $$v_n53();
			$$v_insert([$$v_n54], $$v_n52);
			$$v_on($$v_n52, 'introstart', () => events.value.push('key-in'));
			$$v_on($$v_n52, 'outrostart', () => events.value.push('key-out'));
			const $$v_n55 = ($$el) => {
				if ($$el !== null) {
					$$transition($$el, 683, () => fade, () => ({}), true, true, false);
				}
			};
			$$v_renderEffect(() => $$v_n55($$v_n52));
			$$v_onScopeDispose(() => $$v_n55(null));
			const $$v_n57 = $$v_n56();
			const $$v_n58 = $$v_n57.firstChild;
			const $$v_n60 = $$v_n59();
			const $$v_n62 = $$v_n61();
			const $$v_n63 = $$v_n62.firstChild;
			$$v_insert([$$v_n63], $$v_n60);
			$$v_renderEffect(() => {
				$$v_setText($$v_n54, `${revision.value ?? ''}`);
			});
			return [$$v_n52, $$v_n58, $$v_n60];
		}), ($$key) => $$key);
		$$v_renderEffect(() => {
			$$v_n36.value;
			$$v_setText($$v_n35, `${$$v_n36.value ?? ''}`);
		});
		return [$$v_n1, $$v_n7, $$v_n9, $$v_n15, $$v_n17, $$v_n23, $$v_n25, $$v_n31, $$v_n33, $$v_n39, $$v_n41, $$v_n50, $$v_n64];
	})();
} });
