<script lang="ts">
  interface MyProps { // MyProps: MyProps
    a: number; // a: number
    b: string; // b: string
    c: boolean; // c: boolean
    d: number; // d: number
  }
  let { a, b, c, ...everythingElse }: MyProps = $props(); // a: number, a: number, b: string, b: string, c: boolean, c: boolean, everythingElse: { d: number; }, MyProps: MyProps, $props(): MyProps
</script>

{a} <!-- a: number -->
{b} <!-- b: string -->
{c} <!-- c: boolean -->
{everythingElse} <!-- everythingElse: { d: number; } -->
