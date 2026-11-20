import { renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, toDisplayString as _toDisplayString, createElementVNode as _createElementVNode } from "vue";
const _sfc_main = {
	__name: "destructured-aliases",
	setup(__props) {
		const items = [];
		return (_ctx, _cache) => {
			return _openBlock(), _createElementBlock("ul", null, [
				(_openBlock(), _createElementBlock(_Fragment, null, _renderList(items, ({ a, b }, i) => {
					return _createElementVNode("li", { key: i }, _toDisplayString(b), 1);
				}), 64)),
				(_openBlock(), _createElementBlock(_Fragment, null, _renderList(items, ([c, d], j) => {
					return _createElementVNode("li", { key: j }, _toDisplayString(c), 1);
				}), 64)),
				(_openBlock(), _createElementBlock(_Fragment, null, _renderList(items, (item, k) => {
					return _createElementVNode("li", { key: k }, "x");
				}), 64))
			]);
		};
	}
};
export default _sfc_main;
