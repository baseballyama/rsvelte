<script lang="ts">
  interface B { a: string }
  interface A extends /*hi*/B { b: string }
  export let x: A;
</script>
{x}