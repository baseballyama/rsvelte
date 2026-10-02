import * as $ from 'svelte/internal/server';
import Foo from '.';
import { A, B, C } from '.';

export default function Input($$renderer) {
	const a = true;

	$$renderer.push(`<template lang="pug">+if('typeof a === "number"')
  A(a='${$.escape(a.toFixed(2))}')</template>`);
}