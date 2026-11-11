;

	import Foo from './Foo.svelte';
	let { p = $bindable(), C }: typeof __rsvelte_public_props0 = $props();
	let el;
	let a = $state();
	let refs = $state([]);
	let items = $state([{ el: null }]);
	const obj = { x: null };

;

const __rsvelte_public_props0 = __rsvelte_props({
  C: __rsvelte_untyped_prop(),
}, {
  p: __rsvelte_untyped_prop(),
}, false);
() => {
  {
    el = svelteHTML.createElement("div", {});
  }
  {
    a = svelteHTML.createElement("span", {});
  }
  {
    p = svelteHTML.createElement("p", {});
  }
  {
    obj.x = svelteHTML.createElement("b", {});
  }
  {
    for (let [i, item] of __rsvelte_each(items)) {
      {
        refs[i] = svelteHTML.createElement("i", {});
      }
      {
        item.el = svelteHTML.createElement("u", {});
      }
    }
  }
  {
    const __rsvelte_element0 = svelteHTML.createElement("canvas", {});
    ((v) => (el = v))(__rsvelte_element0);
  }
  {
    a = __rsvelte_component(Foo)(__rsvelte_internals(), {
      "x": 1,
    });
  }
  {
    a = __rsvelte_component(C)(__rsvelte_internals(), {});
  }
  {
    for (let [i, n] of __rsvelte_each([1, 2])) {
      (n);
      {
        refs[i] = __rsvelte_component(Foo)(__rsvelte_internals(), {});
      }
    }
  }
};
const BindThis__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "p">();
type BindThis__SvelteComponent_ = ReturnType<typeof BindThis__SvelteComponent_>;
export default BindThis__SvelteComponent_;
