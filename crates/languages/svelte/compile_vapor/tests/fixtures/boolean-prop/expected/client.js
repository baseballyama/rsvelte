import { computed as $$v_computed, defineVaporComponent as $$v_defineVaporComponent, insert as $$v_insert, renderEffect as $$v_renderEffect, setText as $$v_setText, template as $$v_template } from 'vue';

const $$v_n0 = $$v_template('<p>');

const $$v_n2 = $$v_template(' ');

export default $$v_defineVaporComponent({ inheritAttrs: false, props: { flag: { default: false }, shown: { default: false } }, setup(__props) {
	const $$props = __props;
	const $$v_n1 = $$v_n0();
	const $$v_n3 = $$v_n2();
	const $$v_n4 = $$v_computed(() => String($$props.shown));
	const $$v_n5 = $$v_computed(() => String($$props.flag));
	$$v_insert([$$v_n3], $$v_n1);
	$$v_renderEffect(() => {
		$$v_n5.value;
		$$v_n4.value;
		$$v_setText($$v_n3, `flag ${$$v_n5.value}, shown ${$$v_n4.value}`);
	});
	return [$$v_n1];
} });
