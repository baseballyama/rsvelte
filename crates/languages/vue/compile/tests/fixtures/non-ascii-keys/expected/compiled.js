import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
const n = 1;
const _sfc_main = {
	__name: "non-ascii-keys",
	setup(__props) {
		return (_ctx, _cache) => {
			return _openBlock(), _createElementBlock("p", {
				ä: "1",
				ö: n,
				"data-x": "2",
				_b: n
			}, _toDisplayString(n));
		};
	}
};
export default _sfc_main;
