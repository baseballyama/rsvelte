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
          __rsvelte_component(Option)(__rsvelte_internals(), {});
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
          __rsvelte_component(Option)(__rsvelte_internals(), {});
        }
      }
      (html);
    }
    {
      svelteHTML.createElement("select", {
        "value": x,
      });
      {
        __rsvelte_component(Option)(__rsvelte_internals(), {});
      }
      {
        svelteHTML.createElement("option", {});
        {
          svelteHTML.createElement("b", {});
          (x);
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const RichSelect2__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof RichSelect2__SvelteComponent_>} */ (RichSelect2__SvelteComponent_);
