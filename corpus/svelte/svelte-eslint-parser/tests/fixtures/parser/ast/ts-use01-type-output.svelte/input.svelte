<script lang="ts">
  type MyActionParam = () => (p: { foo: number }) => void; // MyActionParam: MyActionParam, p: { foo: number; }
  function myAction(_node: HTMLElement, params: MyActionParam) { // myAction: (_node: HTMLElement, params: MyActionParam) => { destroy: () => void; }, _node: HTMLElement, params: MyActionParam
    const result = params(); // result: (p: { foo: number; }) => void, params(): (p: { foo: number; }) => void
    result({ foo: 1 }); // result({ foo: 1 }): void
    return {
      destroy: () => {}, // destroy: () => void
    };
  }
</script>

<div
  use:myAction={() => { // myAction: (_node: HTMLElement, params: MyActionParam) => { destroy: () => void; }
    return (param) => { // param: { foo: number; }
      param.foo; // param.foo: number
    };
  }}
/>
