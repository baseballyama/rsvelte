;

const bare = (p = obj.a): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const lit = (p = 1): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const unary = (p = -1): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const cond = (p = obj.a ? 1 : 2): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const nested = (p = obj.a ? (obj.a ? 1 : 2) : 3): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const seq = (p = (obj.a, obj.a)): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const one = (p = (obj.a)): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const two = (p = ((obj.a))): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const litp = (p = (1)): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const arrowp = (p = (() => 1)): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const condp = (p = (a ? 1 : 2)): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const logic = (p = a ?? (b || c)): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const seq3 = (p = (a, b, c)): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const arr = (p = [1, (2, 3)]): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const obji = (p = { k: (1, 2) }): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const assign = (p = (a = 1)): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const memb = (p = (obj.a).b): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const memb2 = (p = (obj).a): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const arrow = (p = (x) => (y)): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};
const typeo = (p = typeof (a)): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("span", {});
      (p);
    }
  };
  return __rsvelte_snippet_return;
};

	let obj = { a: { b: 1 } };
	let a = 1, b = 2, c = 3, x = 4, y = 5;

;

async () => {
  __rsvelte_ensure_snippet(bare());
  __rsvelte_ensure_snippet(lit());
  __rsvelte_ensure_snippet(unary());
  __rsvelte_ensure_snippet(cond());
  __rsvelte_ensure_snippet(nested());
  __rsvelte_ensure_snippet(seq());
  __rsvelte_ensure_snippet(one());
  __rsvelte_ensure_snippet(two());
  __rsvelte_ensure_snippet(litp());
  __rsvelte_ensure_snippet(arrowp());
  __rsvelte_ensure_snippet(condp());
  __rsvelte_ensure_snippet(logic());
  __rsvelte_ensure_snippet(seq3());
  __rsvelte_ensure_snippet(arr());
  __rsvelte_ensure_snippet(obji());
  __rsvelte_ensure_snippet(assign());
  __rsvelte_ensure_snippet(memb());
  __rsvelte_ensure_snippet(memb2());
  __rsvelte_ensure_snippet(arrow());
  __rsvelte_ensure_snippet(typeo());
};
const SnippetDefaultParentheses__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type SnippetDefaultParentheses__SvelteComponent_ = ReturnType<typeof SnippetDefaultParentheses__SvelteComponent_>;
export default SnippetDefaultParentheses__SvelteComponent_;
