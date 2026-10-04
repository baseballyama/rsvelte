;
const values=["a","b"];function run(){for(let i=0;i<values.length;i++){if(i)continue;console.log(values[i]);}for(const value of values)console.log(value);for(const key in values)console.log(key);}
;

() => {
  {
    svelteHTML.createElement("p", {
      class: values[0],
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
