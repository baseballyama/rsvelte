export class Product {
  x = $state(1)
  y = $state(2)
  result = $derived(this.x * this.y)
}