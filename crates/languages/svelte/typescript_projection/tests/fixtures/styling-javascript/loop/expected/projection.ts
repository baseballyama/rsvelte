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
const Loop__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Loop__SvelteComponent_ = ReturnType<typeof Loop__SvelteComponent_>;
export default Loop__SvelteComponent_;
