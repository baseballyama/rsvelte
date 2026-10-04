;

let {items,title='List'}: typeof __rsvelte_public_props0=$props()
let total=$derived(items.length*2+1)

;

const __rsvelte_public_props0 = __rsvelte_props({
  items: __rsvelte_untyped_prop(),
}, {
  title: 'List',
}, false);
{
  svelteHTML.createElement("section", {
    class: "list",
    "data-count": total,
  });
  {
    svelteHTML.createElement("h2", {});
    (title);
  }
  if (items.length>0) {
    {
      svelteHTML.createElement("p", {});
      (total);
      (items[0]);
    }
  } else {
    {
      svelteHTML.createElement("p", {});
    }
  }
}
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
