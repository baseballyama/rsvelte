import { computed as $$v_computed, defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, renderEffect as $$v_renderEffect, setText as $$v_setText, template as $$v_template } from 'vue';

const $$v_n0 = $$v_template('<pre>');

const $$v_n2 = $$v_template(' ');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<p>');

const $$v_n10 = $$v_template(' ');

const $$v_n13 = $$v_template('<span> </span>');

const $$v_n16 = $$v_template('<p>');

const $$v_n18 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const object = { a: 1, b: [true, null] };
	const list = ['x', 'y'];
	const nothing = undefined;
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_computed(() => JSON.stringify(object, null, 2));
	$$v_insert([$$v_n3], $$v_n1);
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n9 = $$v_n8();
	const $$v_n11 = $$v_n10();
	const $$v_n12 = $$v_computed(() => JSON.stringify(list, null, 2));
	$$v_insert([$$v_n11], $$v_n9);
	const $$v_n14 = $$v_n13();
	const $$v_n15 = $$v_n14.firstChild;
	const $$v_n17 = $$v_n16();
	const $$v_n19 = $$v_n18();
	$$v_insert([$$v_n19], $$v_n17);
	$$v_renderEffect(() => {
		$$v_n4.value;
		$$v_n12.value;
		$$v_setText($$v_n3, `${$$v_n4.value ?? ''}`);
		$$v_setText($$v_n11, `${$$v_n12.value ?? ''}`);
		$$v_setText($$v_n19, `[${''}] [${''}]`);
	});
	return [$$v_n1, $$v_n7, $$v_n9, $$v_n15, $$v_n17];
} });
