import * as $ from 'svelte/internal/server';
import * as THREE from 'three';

const vertexShader = `
varying vec2 v_texcoord;
void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);v_texcoord=uv;}`;

const fragmentShader = `
varying vec2 v_texcoord;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_shapeSize;
uniform float u_roundness;
uniform float u_borderSize;
uniform float u_circleSize;
uniform float u_circleEdge;
#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif
#ifndef TWO_PI
#define TWO_PI 6.2831853071795864769252867665590
#endif
#ifndef VAR
#define VAR 0
#endif
vec2 coord(in vec2 p){
  p=p/u_resolution.xy;
  if(u_resolution.x>u_resolution.y){p.x*=u_resolution.x/u_resolution.y;p.x+=(u_resolution.y-u_resolution.x)/u_resolution.y/2.;}
  else{p.y*=u_resolution.y/u_resolution.x;p.y+=(u_resolution.x-u_resolution.y)/u_resolution.x/2.;}
  p-=.5;p*=vec2(-1.,1.);return p;
}
#define st0 coord(gl_FragCoord.xy)
#define mx coord(u_mouse*u_pixelRatio)
float sdRoundRect(vec2 p,vec2 b,float r){vec2 d=abs(p-.5)*4.2-b+vec2(r);return min(max(d.x,d.y),0.)+length(max(d,0.))-r;}
float sdCircle(in vec2 st,in vec2 c){return length(st-c)*2.;}
float sdPoly(in vec2 p,in float w,in int sides){float a=atan(p.x,p.y)+PI;float r=TWO_PI/float(sides);float d=cos(floor(.5+a/r)*r-a)*length(max(abs(p)*1.,0.));return d*2.-w;}
float aastep(float threshold,float value){float afwidth=length(vec2(dFdx(value),dFdy(value)))*.70710678;return smoothstep(threshold-afwidth,threshold+afwidth,value);}
float fill(in float x){return 1.-aastep(0.,x);}
float fill(float x,float size,float edge){return 1.-smoothstep(size-edge,size+edge,x);}
float strokeAA(float x,float size,float w,float edge){float afwidth=length(vec2(dFdx(x),dFdy(x)))*.70710678;float d=smoothstep(size-edge-afwidth,size+edge+afwidth,x+w*.5)-smoothstep(size-edge-afwidth,size+edge+afwidth,x-w*.5);return clamp(d,0.,1.);}
void main(){
  vec2 st=st0+.5;
  vec2 posMouse=mx*vec2(1.,-1.)+.5;
  float sdfCircle=fill(sdCircle(st,posMouse),u_circleSize,u_circleEdge);
  float sdf;
  if(VAR==0){sdf=sdRoundRect(st,vec2(u_shapeSize),u_roundness);sdf=strokeAA(sdf,0.,u_borderSize,sdfCircle)*4.;}
  else if(VAR==1){sdf=sdCircle(st,vec2(.5));sdf=fill(sdf,.6,sdfCircle)*1.2;}
  else if(VAR==2){sdf=sdCircle(st,vec2(.5));sdf=strokeAA(sdf,.58,.02,sdfCircle)*4.;}
  else if(VAR==3){sdf=sdPoly(st-vec2(.5,.45),.3,3);sdf=fill(sdf,.05,sdfCircle)*1.4;}
  gl_FragColor=vec4(vec3(1.),sdf);
}`;

export default function ShapeBlur($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className = '',
			variation = 0,
			pixelRatioProp = 2,
			shapeSize = 1.2,
			roundness = 0.4,
			borderSize = 0.05,
			circleSize = 0.3,
			circleEdge = 0.5
		} = $$props;

		let mount;

		$$renderer.push(`<div${$.attr_class(`absolute inset-0 ${$.stringify(className)}`)}></div>`);
	});
}