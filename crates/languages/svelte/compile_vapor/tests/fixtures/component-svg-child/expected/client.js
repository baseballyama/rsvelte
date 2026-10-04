import { defineVaporComponent as $$v_defineVaporComponent, renderEffect as $$v_renderEffect, setAttr as $$v_setAttr, template as $$v_template } from 'vue';

const $$attr = (v) => v == null ? null : `${v}`;

const $$v_n0 = $$v_template('<circle fill="var(--fill)">', 0, 1);

export default $$v_defineVaporComponent({ inheritAttrs: false, props: { radius: { default: 10 } }, setup(__props) {
	const $$props = __props;
	const $$v_n1 = $$v_n0();
	$$v_renderEffect(() => $$v_setAttr($$v_n1, 'r', $$attr($$props.radius), true));
	return [$$v_n1];
} });
