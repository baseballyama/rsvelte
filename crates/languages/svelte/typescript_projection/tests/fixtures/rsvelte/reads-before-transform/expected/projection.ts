;

const s = ({ p = q, q }, r = q, t): ReturnType<import('svelte').Snippet> => {
  async () => {
    (p);
    (q);
    (r);
    (t);
  };
  return __rsvelte_snippet_return;
};

	let { items }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  items: __rsvelte_untyped_prop(),
}, {}, false);
() => {
  if (items) {
    const a = b;
    const f = () => b;
    const b = items.length;
    {
      svelteHTML.createElement("h1", {});
      (a);
      (f());
    }
  }
  {
    for (let [, { a, b = c, c, d = a, e = e }] of __rsvelte_each(items)) {
      (a);
      (b);
      (c);
      (d);
      (e);
    }
  }
  {
    for (let [, [x, y = z, z = x]] of __rsvelte_each(items)) {
      (x);
      (y);
      (z);
    }
  }
  __rsvelte_ensure_snippet(s(items));
};
const ReadsBeforeTransform__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type ReadsBeforeTransform__SvelteComponent_ = ReturnType<typeof ReadsBeforeTransform__SvelteComponent_>;
export default ReadsBeforeTransform__SvelteComponent_;
