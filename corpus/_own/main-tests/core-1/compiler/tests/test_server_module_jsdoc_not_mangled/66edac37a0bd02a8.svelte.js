export class Foo {
  #fieldNode = $state(null);

  /**
   * Sets the field node.
   * Keep #fieldNode private.
   */
  setFieldNode(node) {
    this.#fieldNode = node;
  }
}