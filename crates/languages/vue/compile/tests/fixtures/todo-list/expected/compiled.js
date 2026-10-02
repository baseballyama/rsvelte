import { vModelText as _vModelText, createElementVNode as _createElementVNode, withDirectives as _withDirectives, renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, vModelCheckbox as _vModelCheckbox, toDisplayString as _toDisplayString, createCommentVNode as _createCommentVNode } from 'vue';

const _hoisted_1 = { key: 0 };

const _hoisted_2 = ['onUpdate:modelValue'];

const _hoisted_3 = ['onClick'];

const _hoisted_4 = { key: 1 };

import { ref, computed } from 'vue';

const _sfc_main = { __name: 'todo-list', setup(__props) {
	const todos = ref([]);
	const draft = ref('');
	let next = 0;
	const remaining = computed(() => todos.value.filter((t) => !t.done).length);
	function add() {
		const text = draft.value.trim();
		if (!text) return;
		todos.value.push({ id: next++, text, done: false });
		draft.value = '';
	}
	function remove(id) {
		todos.value = todos.value.filter((t) => t.id !== id);
	}
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock('section', null, [_withDirectives(_createElementVNode('input', { 'onUpdate:modelValue': _cache[0] || (_cache[0] = ($event) => draft.value = $event), placeholder: 'What needs doing?' }, null, 512), [[_vModelText, draft.value, void 0, { trim: true }]]), _createElementVNode('button', { onClick: add }, 'Add'), todos.value.length ? (_openBlock(), _createElementBlock('ul', _hoisted_1, [(_openBlock(true), _createElementBlock(_Fragment, null, _renderList(todos.value, (todo) => {
			return _openBlock(), _createElementBlock('li', { key: todo.id }, [_withDirectives(_createElementVNode('input', { type: 'checkbox', 'onUpdate:modelValue': ($event) => todo.done = $event }, null, 8, _hoisted_2), [[_vModelCheckbox, todo.done]]), _createElementVNode('span', null, _toDisplayString(todo.text), 1), _createElementVNode('button', { onClick: ($event) => remove(todo.id) }, 'x', 8, _hoisted_3)]);
		}), 128))])) : (_openBlock(), _createElementBlock('p', _hoisted_4, 'Nothing to do.')), _createElementVNode('p', null, _toDisplayString(remaining.value) + ' left', 1)]);
	};
} };

export default _sfc_main;
