"use client";

import { useEffect, useRef } from "react";
import { useStill } from "./ui";

/**
 * Interactive dot field behind the hero, drawn with raw WebGL (no library, ~4 KB).
 *
 * How it works:
 * - A grid of points is uploaded to the GPU once. Every frame we only send a few
 *   numbers (time, pointer, ripples), and the vertex shader moves each dot itself.
 *   That's why thousands of dots stay smooth even on a phone.
 * - Dots drift on a slow wave, bend away from the pointer, and a click or tap
 *   sends a ring outwards (up to 4 rings at once).
 * - Colour comes from the --color-signal CSS variable, so it follows the theme toggle.
 * - It pauses when the hero is off screen or the tab is hidden, draws one still
 *   frame for people who prefer reduced motion, and renders nothing without WebGL.
 */

const SPACING = 24; // CSS pixels between dots
const RIPPLES = 4;

const VERT = `
attribute vec2 a_pos;
uniform vec2 u_res;
uniform float u_time;
uniform float u_dpr;
uniform vec3 u_mouse;          // x, y, strength (0 when the pointer is away)
uniform vec3 u_ripple[${RIPPLES}]; // x, y, start time (negative = unused)
varying float v_glow;

void main() {
  vec2 p = a_pos;

  // Slow ambient swell, like water.
  float wave = sin(p.x * 0.006 + u_time * 0.6) * cos(p.y * 0.008 - u_time * 0.4);
  p.y += wave * 6.0;
  float glow = (wave * 0.5 + 0.5) * 0.15;

  // Bend away from the pointer, strongest at the centre, fading over ~160px.
  vec2 d = p - u_mouse.xy;
  float dist = length(d) + 0.0001;
  float push = exp(-(dist * dist) / 26000.0) * u_mouse.z;
  p += (d / dist) * push * 38.0;
  glow += push;

  // Each ripple is a ring growing at 520px/s that fades out over ~1.8s.
  for (int i = 0; i < ${RIPPLES}; i++) {
    vec3 r = u_ripple[i];
    if (r.z < 0.0) continue;
    float age = u_time - r.z;
    if (age < 0.0 || age > 1.8) continue;
    vec2 rd = p - r.xy;
    float rdist = length(rd) + 0.0001;
    float band = exp(-pow((rdist - age * 520.0) / 34.0, 2.0)) * (1.0 - age / 1.8);
    p += (rd / rdist) * band * 22.0;
    glow += band;
  }

  v_glow = clamp(glow, 0.0, 1.0);
  gl_Position = vec4((p / u_res) * 2.0 - 1.0, 0.0, 1.0);
  gl_Position.y = -gl_Position.y; // screen y runs down, GL y runs up
  gl_PointSize = (1.6 + v_glow * 2.6) * u_dpr;
}`;

const FRAG = `
precision mediump float;
uniform vec3 u_color;
varying float v_glow;
void main() {
  // Turn the square point into a soft round dot.
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float edge = smoothstep(0.5, 0.2, r);
  gl_FragColor = vec4(u_color, edge * (0.16 + v_glow * 0.84));
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

/** "#4f6dff" -> [0.31, 0.43, 1] for the shader. */
function signalColour(): [number, number, number] {
  const hex = getComputedStyle(document.documentElement).getPropertyValue("--color-signal").trim() || "#4f6dff";
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function WaveField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const still = useStill();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return; // no WebGL: the hero simply has no dot field

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const loc = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      dpr: gl.getUniformLocation(prog, "u_dpr"),
      mouse: gl.getUniformLocation(prog, "u_mouse"),
      ripple: gl.getUniformLocation(prog, "u_ripple"),
      color: gl.getUniformLocation(prog, "u_color"),
    };
    const buf = gl.createBuffer();
    const aPos = gl.getAttribLocation(prog, "a_pos");

    let w = 0;
    let h = 0;
    let count = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Rebuild the dot grid whenever the hero changes size.
    function resize() {
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      const pts: number[] = [];
      for (let y = SPACING / 2; y < h + SPACING; y += SPACING)
        for (let x = SPACING / 2; x < w + SPACING; x += SPACING) pts.push(x, y);
      count = pts.length / 2;
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array(pts), gl!.STATIC_DRAW);
      gl!.enableVertexAttribArray(aPos);
      gl!.vertexAttribPointer(aPos, 2, gl!.FLOAT, false, 0, 0);
    }

    // Pointer, eased so the bend feels smooth rather than jumpy.
    const mouse = { x: -9999, y: -9999, s: 0, target: 0 };
    const ripples = new Float32Array(RIPPLES * 3).fill(-1);
    let nextRipple = 0;
    const start = performance.now();
    const now = () => (performance.now() - start) / 1000;

    function local(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, inside: e.clientY >= r.top && e.clientY <= r.bottom };
    }
    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return; // touch gets ripples only
      const p = local(e);
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.target = p.inside ? 1 : 0;
    }
    function onDown(e: PointerEvent) {
      const p = local(e);
      if (!p.inside) return;
      ripples.set([p.x, p.y, now()], nextRipple * 3);
      nextRipple = (nextRipple + 1) % RIPPLES;
    }
    const onLeave = () => (mouse.target = 0);

    let colour = signalColour();
    // Re-read the colour when the theme toggle flips <html data-theme>.
    const themeWatch = new MutationObserver(() => (colour = signalColour()));
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    function draw(t: number) {
      mouse.s += (mouse.target - mouse.s) * 0.08;
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform2f(loc.res, w, h);
      gl!.uniform1f(loc.time, t);
      gl!.uniform1f(loc.dpr, dpr);
      gl!.uniform3f(loc.mouse, mouse.x, mouse.y, mouse.s);
      gl!.uniform3fv(loc.ripple, ripples);
      gl!.uniform3f(loc.color, ...colour);
      gl!.drawArrays(gl!.POINTS, 0, count);
    }

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw(0);
    });
    ro.observe(canvas);

    if (still) {
      draw(0);
      return () => {
        ro.disconnect();
        themeWatch.disconnect();
      };
    }

    // Only animate while the hero is visible and the tab is open.
    let visible = true;
    let raf = 0;
    const loop = () => {
      draw(now());
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      themeWatch.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [still]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none block h-full w-full ${className}`} />;
}
