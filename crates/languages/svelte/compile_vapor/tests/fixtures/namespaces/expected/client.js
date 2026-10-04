import { createIf as $$v_createIf, createKeyedFragment as $$v_createKeyedFragment, defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, on as $$v_on, onScopeDispose as $$v_onScopeDispose, renderEffect as $$v_renderEffect, setAttr as $$v_setAttr, setText as $$v_setText, template as $$v_template } from 'vue';

import { customRef as $$createState } from 'vue';

const $$attr = (v) => v == null ? null : `${v}`;

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

const $$raw_markup = (value, namespace) => {
	const template = namespace ? document.createElementNS(namespace, namespace.endsWith('svg') ? 'svg' : 'math') : document.createElement('template');
	template.innerHTML = value == null ? '' : value;
	return Array.from((namespace ? template : template.content).childNodes);
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

const $$v_n0 = $$v_template('<svg>', 0, 1);

const $$v_n2 = $$v_template('<title>', 0, 1);

const $$v_n4 = $$v_template(' ');

const $$v_n6 = $$v_template('<defs>', 0, 1);

const $$v_n8 = $$v_template('<clipPath id="clip">', 0, 1);

const $$v_n10 = $$v_template('<rect width="5" height="5">', 0, 1);

const $$v_n12 = $$v_template('<circle cx="5" cy="5">', 0, 1);

const $$v_n15 = $$v_template('<foreignObject>', 0, 1);

const $$v_n17 = $$v_template('<div>');

const $$v_n19 = $$v_template(' ');

const $$v_n26 = $$v_template('<g>', 0, 1);

const $$v_n28 = $$v_template('<path d="M0 0L1 1">', 0, 1);

const $$v_n32 = $$v_template('<use>', 0, 1);

const $$v_n34 = $$v_template('<use>', 0, 1);

const $$v_n36 = $$v_template('<span> </span>');

const $$v_n39 = $$v_template('<math>', 0, 2);

const $$v_n41 = $$v_template('<mrow>', 0, 2);

const $$v_n43 = $$v_template('<mi>', 0, 2);

const $$v_n45 = $$v_template('<span>x</span>');

const $$v_n48 = $$v_template('<mo>', 0, 2);

const $$v_n50 = $$v_template('<span>+</span>');

const $$v_n53 = $$v_template('<mn>', 0, 2);

const $$v_n55 = $$v_template(' ');

const $$v_n58 = $$v_template('<span> </span>');

const $$v_n61 = $$v_template('<button class="inspect">');

const $$v_n63 = $$v_template('<span>inspect</span>');

const $$v_n66 = $$v_template('<span> </span>');

const $$v_n69 = $$v_template('<button class="change">');

const $$v_n71 = $$v_template('<span>change</span>');

const $$v_n74 = $$v_template('<span> </span>');

const $$v_n77 = $$v_template('<p>');

const $$v_n79 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const size = $$ref(12);
	const active = $$ref(true);
	const tag = $$ref('g');
	const circle = $$ref();
	const html = $$ref();
	const dynamic = $$ref();
	const math = $$ref();
	const raw = $$ref('<rect class="raw" width="3" />');
	const observed = $$ref('');
	function inspect() {
		observed.value = [circle.value.namespaceURI, html.value.namespaceURI, dynamic.value.namespaceURI, math.value.namespaceURI, circle.value.classList.contains('active'), circle.value.getAttribute('r')].join(':');
	}
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n5 = $$v_n4();
	$$v_insert([$$v_n5], $$v_n3);
	const $$v_n7 = $$v_n6();
	const $$v_n9 = $$v_n8();
	const $$v_n11 = $$v_n10();
	$$v_insert([$$v_n11], $$v_n9);
	$$v_insert([$$v_n9], $$v_n7);
	const $$v_n13 = $$v_n12();
	const $$v_n14 = ($$el) => {
		if ($$el !== null) {
			$$set_class($$el, 'circle', { 'active': active.value });
		}
		circle.value = $$el;
	};
	$$v_renderEffect(() => $$v_n14($$v_n13));
	$$v_onScopeDispose(() => $$v_n14(null));
	const $$v_n16 = $$v_n15();
	const $$v_n18 = $$v_n17();
	const $$v_n20 = $$v_n19();
	$$v_insert([$$v_n20], $$v_n18);
	const $$v_n21 = ($$el) => {
		html.value = $$el;
	};
	$$v_renderEffect(() => $$v_n21($$v_n18));
	$$v_onScopeDispose(() => $$v_n21(null));
	$$v_insert([$$v_n18], $$v_n16);
	let $$v_n22;
	const $$v_n25 = $$v_createKeyedFragment(() => $$v_n22 = tag.value, () => $$v_n22 ? (() => {
		const $$v_n23 = document.createElementNS('http://www.w3.org/2000/svg', $$v_n22);
		const $$v_n24 = ($$el) => {
			dynamic.value = $$el;
		};
		$$v_renderEffect(() => $$v_n24($$v_n23));
		$$v_onScopeDispose(() => $$v_n24(null));
		$$v_renderEffect(() => {
			$$v_setAttr($$v_n23, 'data-size', $$attr(size.value), true);
		});
		return $$v_n23;
	})() : []);
	const $$v_n30 = $$v_createIf(() => active.value, () => {
		const $$v_n27 = $$v_n26();
		const $$v_n29 = $$v_n28();
		$$v_insert([$$v_n29], $$v_n27);
		return $$v_n27;
	});
	const $$v_n31 = $$v_createKeyedFragment(() => raw.value, () => $$raw_markup(raw.value, 'http://www.w3.org/2000/svg'));
	const $$v_n33 = $$v_n32();
	const $$v_n35 = $$v_n34();
	$$v_insert([$$v_n3, $$v_n7, $$v_n13, $$v_n16, $$v_n25, $$v_n30, $$v_n31, $$v_n33, $$v_n35], $$v_n1);
	const $$v_n37 = $$v_n36();
	const $$v_n38 = $$v_n37.firstChild;
	const $$v_n40 = $$v_n39();
	const $$v_n42 = $$v_n41();
	const $$v_n44 = $$v_n43();
	const $$v_n46 = $$v_n45();
	const $$v_n47 = $$v_n46.firstChild;
	$$v_insert([$$v_n47], $$v_n44);
	const $$v_n49 = $$v_n48();
	const $$v_n51 = $$v_n50();
	const $$v_n52 = $$v_n51.firstChild;
	$$v_insert([$$v_n52], $$v_n49);
	const $$v_n54 = $$v_n53();
	const $$v_n56 = $$v_n55();
	$$v_insert([$$v_n56], $$v_n54);
	$$v_insert([$$v_n44, $$v_n49, $$v_n54], $$v_n42);
	const $$v_n57 = ($$el) => {
		math.value = $$el;
	};
	$$v_renderEffect(() => $$v_n57($$v_n42));
	$$v_onScopeDispose(() => $$v_n57(null));
	$$v_insert([$$v_n42], $$v_n40);
	const $$v_n59 = $$v_n58();
	const $$v_n60 = $$v_n59.firstChild;
	const $$v_n62 = $$v_n61();
	const $$v_n64 = $$v_n63();
	const $$v_n65 = $$v_n64.firstChild;
	$$v_insert([$$v_n65], $$v_n62);
	$$v_on($$v_n62, 'click', inspect);
	const $$v_n67 = $$v_n66();
	const $$v_n68 = $$v_n67.firstChild;
	const $$v_n70 = $$v_n69();
	const $$v_n72 = $$v_n71();
	const $$v_n73 = $$v_n72.firstChild;
	$$v_insert([$$v_n73], $$v_n70);
	$$v_on($$v_n70, 'click', () => {
		size.value++;
		active.value = !active.value;
		tag.value = tag.value === 'g' ? 'path' : 'g';
		raw.value = '<ellipse class="raw" rx="4" />';
	});
	const $$v_n75 = $$v_n74();
	const $$v_n76 = $$v_n75.firstChild;
	const $$v_n78 = $$v_n77();
	const $$v_n80 = $$v_n79();
	$$v_insert([$$v_n80], $$v_n78);
	$$v_renderEffect(() => {
		$$v_setAttr($$v_n1, 'viewBox', `0 0 ${size.value} ${size.value}`, true);
		$$v_setText($$v_n5, `diagram ${size.value ?? ''}`);
		$$v_setAttr($$v_n13, 'r', $$attr(size.value), true);
		$$v_setAttr($$v_n13, 'fill', active.value ? 'red' : 'blue', true);
		$$v_setText($$v_n20, `html ${size.value ?? ''}`);
		$$v_setAttr($$v_n33, 'xlink:href', String(active.value ? '#clip' : null), true);
		$$v_setAttr($$v_n35, 'xlink:href', String(null), true);
		$$v_setText($$v_n56, `${size.value ?? ''}`);
		$$v_setText($$v_n80, `${observed.value ?? ''}`);
	});
	return [$$v_n1, $$v_n38, $$v_n40, $$v_n60, $$v_n62, $$v_n68, $$v_n70, $$v_n76, $$v_n78];
} });
