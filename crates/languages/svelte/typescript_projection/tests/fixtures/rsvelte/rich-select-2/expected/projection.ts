;
import Option from './Option.svelte';;

;

function $$render() {
   let x = $state(1); let html = '';
;

  async () => {
    {
      svelteHTML.createElement("div", {});
      {
        svelteHTML.createElement("select", {});
        {
          new (__rsvelte_component(Option))(__rsvelte_internals(), {
            props: {},
          });
        }
      }
    }
    {
      svelteHTML.createElement("select", {});
      {
        svelteHTML.createElement("optgroup", {
          "label": "G",
        });
        {
          new (__rsvelte_component(Option))(__rsvelte_internals(), {
            props: {},
          });
        }
      }
      html;
    }
    {
      svelteHTML.createElement("select", {
        "value": x,
      });
      {
        new (__rsvelte_component(Option))(__rsvelte_internals(), {
          props: {},
        });
      }
      {
        svelteHTML.createElement("option", {});
        {
          svelteHTML.createElement("b", {});
          x;
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const RichSelect2__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof RichSelect2__SvelteComponent_>} RichSelect2__SvelteComponent_ */
export default RichSelect2__SvelteComponent_;
