;

	import C from './C.svelte';
	let selected = $state([]);
	let one = $state('a');
	let v = $state('x');
	let items = $state([{ picks: [] }]);
	let binding_group = 1;

;

() => {
  {
    svelteHTML.createElement("input", {
      "type": "checkbox",
      "value": "a",
    });
    selected = __rsvelte_untyped_prop();
  }
  {
    svelteHTML.createElement("input", {
      "type": "checkbox",
      "value": v,
    });
    selected = __rsvelte_untyped_prop();
  }
  {
    svelteHTML.createElement("input", {
      "type": "radio",
      "value": "b",
    });
    one = __rsvelte_untyped_prop();
  }
  {
    svelteHTML.createElement("input", {
      "type": "radio",
    });
    one = __rsvelte_untyped_prop();
  }
  {
    for (let [i, item] of __rsvelte_each(items)) {
      {
        svelteHTML.createElement("input", {
          "type": "checkbox",
          "value": "p",
        });
        item.picks = __rsvelte_untyped_prop();
      }
      {
        for (let [, n] of __rsvelte_each([1, 2])) {
          (n);
          {
            svelteHTML.createElement("input", {
              "type": "checkbox",
              "value": n,
            });
            items[i].picks = __rsvelte_untyped_prop();
          }
        }
      }
    }
  }
  {
    for (let [j, item] of __rsvelte_each(items)) {
      (item);
      {
        svelteHTML.createElement("input", {
          "type": "radio",
          "value": j,
        });
        item.picks = __rsvelte_untyped_prop();
      }
    }
  }
  {
    __rsvelte_component(C)(__rsvelte_internals(), {
      "group": one,
    });
    () => {
      // @ts-ignore
      one = __rsvelte_untyped_prop();
    };
  }
};
const BindGroup__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BindGroup__SvelteComponent_ = ReturnType<typeof BindGroup__SvelteComponent_>;
export default BindGroup__SvelteComponent_;
