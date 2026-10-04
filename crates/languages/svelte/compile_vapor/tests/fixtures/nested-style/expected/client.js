import { createTextNode as $$v_createTextNode, defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, template as $$v_template } from 'vue';

const $$v_n0 = $$v_template('<div>');

const $$v_n2 = $$v_template('<style>');

const $$v_n5 = $$v_template('<span> </span>');

const $$v_n8 = $$v_template('<p class="inside">');

const $$v_n10 = $$v_template('<span>');

const $$v_n12 = $$v_template('<span>nested</span>');

export default $$v_defineVaporComponent({ inheritAttrs: false, setup(__props) {
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_createTextNode('.inside > span { color: red; }');
	$$v_insert([$$v_n4], $$v_n3);
	const $$v_n6 = $$v_n5();
	const $$v_n7 = $$v_n6.firstChild;
	const $$v_n9 = $$v_n8();
	const $$v_n11 = $$v_n10();
	const $$v_n13 = $$v_n12();
	const $$v_n14 = $$v_n13.firstChild;
	$$v_insert([$$v_n14], $$v_n11);
	$$v_insert([$$v_n11], $$v_n9);
	$$v_insert([$$v_n3, $$v_n7, $$v_n9], $$v_n1);
	return [$$v_n1];
} });
