;
let v = $state(1);
;

async () => {
  {
    svelteHTML.createElement("svelte:head", {});
    {
      svelteHTML.createElement("script", {
        "async": true,
        "src": "https://x/y.js",
        "data-v": v,
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
const TemplateScript__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof TemplateScript__SvelteComponent_>} */ (TemplateScript__SvelteComponent_);
