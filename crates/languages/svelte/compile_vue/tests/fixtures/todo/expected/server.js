import { createElementVNode as _createElementVNode, renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, createCommentVNode as _createCommentVNode } from 'vue';

const _hoisted_1 = { class: 'new' };

const _hoisted_2 = ['value'];

const _hoisted_3 = ['disabled'];

const _hoisted_4 = { class: 'todos' };

const _hoisted_5 = ['CLASS'];

const _hoisted_6 = ['checked'];

const _hoisted_7 = { class: 'summary' };

const _hoisted_8 = { key: 0, class: 'clear' };

import { ref as $$ref, computed as $$computed } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'todo', setup(__props) {
	const $$each = (c) => !c ? [] : c.length === undefined ? Array.from(c) : Array.isArray(c) || typeof c === 'string' ? c : Array.prototype.slice.call(c);
	const $$attr = (v) => v == null ? null : String(v);
	const $$bool = (v) => v === '' || Boolean(v);
	const $$keys = (o, seen = [], out = []) => {
		if (o == null) return out;
		Object.getOwnPropertyNames(o).forEach((k) => {
			if (seen.indexOf(k) < 0) {
				seen.push(k);
				if (Object.prototype.propertyIsEnumerable.call(o, k)) out.push(k);
			}
		});
		return $$keys(Object.getPrototypeOf(o), seen, out);
	};
	const $$clsx = (mix) => {
		if (typeof mix === 'string' || typeof mix === 'number') return '' + mix;
		if (typeof mix !== 'object' || mix === null) return '';
		if (Array.isArray(mix)) {
			return Array.from({ length: mix.length }, (_, k) => mix[k]).filter((x) => x).map((x) => $$clsx(x)).filter((y) => y).join(' ');
		}
		return $$keys(mix).filter((k) => mix[k]).join(' ');
	};
	const $$sclsx = (v) => typeof v === 'object' ? $$clsx(v) : v ?? '';
	const $$class = (v) => {
		const c = '' + (typeof v === 'object' ? v ? $$clsx(v) : '' : v ?? '');
		return c === '' ? null : c;
	};
	const todos = $$ref([{ id: 1, text: 'write tests', done: true }]);
	const draft = $$ref('');
	let next = 2;
	const remaining = $$computed(() => todos.value.filter((t) => !t.done).length);
	function add(event) {
		event.preventDefault();
		const text = draft.value.trim();
		if (!text) return;
		todos.value.push({ id: next++, text, done: false });
		draft.value = '';
	}
	function clearDone() {
		todos.value = todos.value.filter((t) => !t.done);
	}
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('form', _hoisted_1, [_createElementVNode('input', { class: 'draft', value: $$attr(draft.value), placeholder: 'What needs doing?' }, null, 8, _hoisted_2), _createElementVNode('button', { class: 'add', disabled: !draft.value.trim() }, 'add', 8, _hoisted_3)]), _cache[1] || (_cache[1] = _createTextVNode()), _createElementVNode('ul', _hoisted_4, [(_openBlock(true), _createElementBlock(_Fragment, null, _renderList($$each(todos.value), (todo) => {
			return _openBlock(), _createElementBlock('li', { key: todo.id, CLASS: $$class({ done: todo.done }) }, [_createElementVNode('label', null, [_createElementVNode('input', { type: 'checkbox', checked: $$bool(todo.done) }, null, 8, _hoisted_6), _createTextVNode(' ' + _toDisplayString(String(todo.text ?? '')), 1)])], 8, _hoisted_5);
		}), 128))]), _cache[2] || (_cache[2] = _createTextVNode()), _createElementVNode('p', _hoisted_7, [_createElementVNode('span', null, _toDisplayString(String(remaining.value ?? '')), 1), _cache[0] || (_cache[0] = _createTextVNode()), _createElementVNode('span', null, _toDisplayString(String((remaining.value === 1 ? 'item' : 'items') ?? '')) + ' left', 1)]), _cache[3] || (_cache[3] = _createTextVNode()), todos.value.some((t) => t.done) ? (_openBlock(), _createElementBlock('button', _hoisted_8, 'clear done')) : _createCommentVNode('v-if', true)], 64);
	};
} });

export default _sfc_main;
