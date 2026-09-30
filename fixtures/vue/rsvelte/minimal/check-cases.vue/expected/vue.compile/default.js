import { defineComponent as _defineComponent } from 'vue';
import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, createCommentVNode as _createCommentVNode, Fragment as _Fragment } from "vue";
const _hoisted_1 = { key: 0 };
const _hoisted_2 = { key: 1 };
const _hoisted_3 = ["title"];
import { ref } from 'vue';
const n = 'x';
const _sfc_main = /*@__PURE__*/ _defineComponent({
    __name: 'check-cases',
    setup(__props) {
        const count = ref(0);
        const maybe = ref();
        return (_ctx, _cache) => {
            return (_openBlock(), _createElementBlock(_Fragment, null, [
                _createElementVNode("button", {
                    type: "button",
                    onClick: _cache[0] || (_cache[0] = ($event) => (count.value.toUpperCase()))
                }, _toDisplayString(n.foo), 1 /* TEXT */),
                (maybe.value)
                    ? (_openBlock(), _createElementBlock("p", _hoisted_1, _toDisplayString(maybe.value.length), 1 /* TEXT */))
                    : (_openBlock(), _createElementBlock("p", _hoisted_2, _toDisplayString(maybe.value.length), 1 /* TEXT */)),
                _createElementVNode("p", {
                    title: count.value.bar
                }, "😀 " + _toDisplayString(count.value.baz), 9 /* TEXT, PROPS */, _hoisted_3)
            ], 64 /* STABLE_FRAGMENT */));
        };
    }
});
export default _sfc_main;
