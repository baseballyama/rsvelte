import { createFor as $$v_createFor, createIf as $$v_createIf, defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, on as $$v_on, renderEffect as $$v_renderEffect, setText as $$v_setText, template as $$v_template } from 'vue';

import { shallowRef as $$shallowRef, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect } from 'vue';

const $$await_block = (getter, hasCatch) => {
	const state = $$shallowRef({ status: -1 });
	$$watchEffect((register) => {
		const value = getter();
		let active = true;
		register(() => {
			active = false;
		});
		if (value != null && typeof value.then === 'function') {
			let resolved = false;
			value.then((value) => {
				resolved = true;
				if (active) state.value = { status: 1, value };
			}, (error) => {
				resolved = true;
				if (!active) return;
				state.value = { status: 2, error };
				if (!hasCatch) throw error;
			});
			queueMicrotask(() => {
				if (active && !resolved) state.value = { status: 0 };
			});
		} else {
			state.value = { status: 1, value };
		}
	});
	return state;
};

const $$v_n0 = $$v_template('<button>');

const $$v_n2 = $$v_template('<span>resolve</span>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<button>');

const $$v_n10 = $$v_template('<span>reject</span>');

const $$v_n13 = $$v_template('<span> </span>');

const $$v_n16 = $$v_template('<button>');

const $$v_n18 = $$v_template('<span>plain</span>');

const $$v_n21 = $$v_template('<span> </span>');

const $$v_n24 = $$v_template('<p>');

const $$v_n26 = $$v_template('<span>pending</span>');

const $$v_n29 = $$v_template('<p>');

const $$v_n31 = $$v_template(' ');

const $$v_n34 = $$v_template('<p>');

const $$v_n36 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const value = $$shallowRef(Promise.resolve('first'));
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_n3.firstChild;
	$$v_insert([$$v_n4], $$v_n1);
	$$v_on($$v_n1, 'click', () => value.value = Promise.resolve('second'));
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n9 = $$v_n8();
	const $$v_n11 = $$v_n10();
	const $$v_n12 = $$v_n11.firstChild;
	$$v_insert([$$v_n12], $$v_n9);
	$$v_on($$v_n9, 'click', () => value.value = Promise.reject('failure'));
	const $$v_n14 = $$v_n13();
	const $$v_n15 = $$v_n14.firstChild;
	const $$v_n17 = $$v_n16();
	const $$v_n19 = $$v_n18();
	const $$v_n20 = $$v_n19.firstChild;
	$$v_insert([$$v_n20], $$v_n17);
	$$v_on($$v_n17, 'click', () => value.value = 'plain');
	const $$v_n22 = $$v_n21();
	const $$v_n23 = $$v_n22.firstChild;
	const $$await_275 = $$await_block(() => value.value, true);
	const $$v_n39 = $$v_createIf(() => $$await_275.value.status === 0, () => {
		const $$v_n25 = $$v_n24();
		const $$v_n27 = $$v_n26();
		const $$v_n28 = $$v_n27.firstChild;
		$$v_insert([$$v_n28], $$v_n25);
		return $$v_n25;
	}, () => $$v_createIf(() => $$await_275.value.status === 1, () => {
		const $$v_n33 = $$v_createFor(() => [$$await_275.value.value], (result) => {
			const $$v_n30 = $$v_n29();
			const $$v_n32 = $$v_n31();
			$$v_insert([$$v_n32], $$v_n30);
			$$v_renderEffect(() => {
				$$v_setText($$v_n32, `then:${result.value ?? ''}`);
			});
			return $$v_n30;
		});
		return $$v_n33;
	}, () => $$v_createIf(() => $$await_275.value.status === 2, () => {
		const $$v_n38 = $$v_createFor(() => [$$await_275.value.error], (error) => {
			const $$v_n35 = $$v_n34();
			const $$v_n37 = $$v_n36();
			$$v_insert([$$v_n37], $$v_n35);
			$$v_renderEffect(() => {
				$$v_setText($$v_n37, `catch:${error.value ?? ''}`);
			});
			return $$v_n35;
		});
		return $$v_n38;
	})));
	return [$$v_n1, $$v_n7, $$v_n9, $$v_n15, $$v_n17, $$v_n23, [$$v_n39]];
} });
