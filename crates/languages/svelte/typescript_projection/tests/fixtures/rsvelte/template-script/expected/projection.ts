;
function $$render() {
  let v = $state(1);
;

  async () => {
    {
      svelteHTML.createElement("svelte:head", {});
      {
        svelteHTML.createElement("script", {
          "async": true,
          "src": "https://x/y.js",
          ...(__sveltets_2_empty({
            "data-v": v,
          })),
        });
      }
      {
        svelteHTML.createElement("script", {});
      }
    }
    {
      svelteHTML.createElement("div", {});
      {
        svelteHTML.createElement("script", {
          "type": "text/javascript",
        });
      }
      {
        svelteHTML.createElement("p", {});
      }
    }
    {
      svelteHTML.createElement("span", {});
      {
        svelteHTML.createElement("script", {
          "src": "/z.js",
        });
      }
    }
    {
      svelteHTML.createElement("div", {});
      {
        svelteHTML.createElement("style", {});
      }
      {
        svelteHTML.createElement("template", {});
        {
          svelteHTML.createElement("b", {});
        }
      }
    }
    if (v) {
      {
        svelteHTML.createElement("script", {});
      }
    }
    {
      svelteHTML.createElement("span", {});
      {
        svelteHTML.createElement("script", {
          "src": v,
        });
      }
    }
    {
      svelteHTML.createElement("p", {});
      {
        svelteHTML.createElement("script", {});
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const TemplateScript__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof TemplateScript__SvelteComponent_>} TemplateScript__SvelteComponent_ */
export default TemplateScript__SvelteComponent_;
