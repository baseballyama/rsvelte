;
const values=["a","b"];function run(){for(let i=0;i<values.length;i++){if(i)continue;console.log(values[i]);}for(const value of values)console.log(value);for(const key in values)console.log(key);}
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": values[0],
    });
  }
};
const Loop__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Loop__SvelteComponent_>} */ (Loop__SvelteComponent_);
