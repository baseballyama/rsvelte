<script lang="ts">
  interface B { a: string }
  interface A extends /*日本*/B { b: string }
  export let x: A;
</script>
{x}