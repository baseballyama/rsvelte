// class Decoy { export let hidden = 1; } from "nowhere"
const inString = "class Decoy { export let hidden = 1; } from 'nowhere'";
const inTemplate = `class Decoy { $state( $derived( } from "x"`;
const inRegex = /class |export let | from |\$state\(/g;

/* class Decoy { export let hidden = 1; } */
let real = $state(1);

export function read() {
  return inString.length + inTemplate.length + inRegex.source.length + real;
}
