;
import type { Component } from 'svelte';;

;

function $$render() {
  
	
	const Foo: Component<{ a: number }> = null!;

;

  async () => {
    {
      new (__rsvelte_component(Foo))(__rsvelte_internals(), {
        props: {
          children: __rsvelte_children,
          "a": 1,
        },
      });
      Foo;
    }
    {
      svelteHTML.createElement("div", {
        "this-is": "wrong",
      });
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, {}, string>()(__rsvelte_any_event({}), {});
}
const CheckGeneratedNames__SvelteComponent_ = $$render();
type CheckGeneratedNames__SvelteComponent_ = InstanceType<typeof CheckGeneratedNames__SvelteComponent_>;
export default CheckGeneratedNames__SvelteComponent_;
