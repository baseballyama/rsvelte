;
function $$render() {
  const values=["a","b"];function run(){for(let i=0;i<values.length;i++){if(i)continue;console.log(values[i]);}for(const value of values)console.log(value);for(const key in values)console.log(key);}
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": values[0],
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const Loop__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof Loop__SvelteComponent_>} Loop__SvelteComponent_ */
export default Loop__SvelteComponent_;
