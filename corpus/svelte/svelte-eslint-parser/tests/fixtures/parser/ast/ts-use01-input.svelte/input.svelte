<script lang="ts">
  type MyActionParam = () => (p: { foo: number }) => void;
  function myAction(_node: HTMLElement, params: MyActionParam) {
    const result = params();
    result({ foo: 1 });
    return {
      destroy: () => {},
    };
  }
</script>

<div
  use:myAction={() => {
    return (param) => {
      param.foo;
    };
  }}
/>
