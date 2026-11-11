;
import Option from './Option.svelte'; let x = $state(1); let html = '';
;

() => {
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
const RichSelect2__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type RichSelect2__SvelteComponent_ = ReturnType<typeof RichSelect2__SvelteComponent_>;
export default RichSelect2__SvelteComponent_;
