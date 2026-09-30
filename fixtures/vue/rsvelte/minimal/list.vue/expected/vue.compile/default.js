import { renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, toDisplayString as _toDisplayString } from "vue"


const _sfc_main = {
  __name: 'list',
  props: { items: Array },
  setup(__props) {



return (_ctx, _cache) => {
  return (_openBlock(), _createElementBlock("ul", null, [
    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(__props.items, (item, i) => {
      return (_openBlock(), _createElementBlock("li", { key: i }, _toDisplayString(i) + ": " + _toDisplayString(item), 1 /* TEXT */))
    }), 128 /* KEYED_FRAGMENT */))
  ]))
}
}

}
export default _sfc_main
