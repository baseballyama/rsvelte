;
function $$render() {
  let x = $state(1);
;

  async () => {
    {
      svelteHTML.createElement("select", {});
      {
        svelteHTML.createElement("option", {});
        {
          svelteHTML.createElement("span", {});
          x;
        }
      }
      {
        svelteHTML.createElement("option", {
          "value": "b",
        });
        {
          svelteHTML.createElement("em", {});
        }
      }
    }
    {
      svelteHTML.createElement("select", {
        "bind:value": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
      {
        svelteHTML.createElement("optgroup", {
          "label": "G",
        });
        {
          svelteHTML.createElement("option", {});
          {
            svelteHTML.createElement("strong", {});
          }
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const RichSelect1__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof RichSelect1__SvelteComponent_>} RichSelect1__SvelteComponent_ */
export default RichSelect1__SvelteComponent_;
