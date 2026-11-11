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
const TemplateScript__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type TemplateScript__SvelteComponent_ = ReturnType<typeof TemplateScript__SvelteComponent_>;
export default TemplateScript__SvelteComponent_;
