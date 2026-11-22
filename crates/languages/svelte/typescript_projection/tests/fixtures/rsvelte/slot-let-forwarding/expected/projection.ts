;
import C from './C.svelte';;

;

function $$render() {
  
	

;

  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "runes": true,
      });
    }
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      __rsvelte_component_0(__rsvelte_internals(), {});
      {
        const {
          foo,
        } = __rsvelte_instance(__rsvelte_component_0).$$slot_def.default;
        __rsvelte_slots()("default", {
          foo,
        });
        foo;
      }
      {
        svelteHTML.createElement("div", {});
        {
          __rsvelte_slots()("b", {
            "let:bar": { baz },
            baz,
          });
        }
      }
      C;
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic_slots<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_isomorphic_slots))()(__rsvelte_any_event({}), {
    "default": {
      foo: __rsvelte_untyped_prop(),
    },
    "b": {
      baz: __rsvelte_untyped_prop(),
    },
  });
}
export const SlotLetForwarding__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof SlotLetForwarding__SvelteComponent_>} SlotLetForwarding__SvelteComponent_ */
export default SlotLetForwarding__SvelteComponent_;
