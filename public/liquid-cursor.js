/*
 * liquid-cursor.js
 * Imleci takip eden sıvı/damla efekti (WebGL). Sadece hareket ederken görünür, durunca kaybolur.
 *
 * KULLANIM: sayfanın </body> öncesine ekle:
 *   <script src="/liquid-cursor.js" defer></script>   (görsel varsayılan: /assets/smoke.jpg)
 *
 * Seçenekler (script etiketine data- olarak):
 *   data-image="/assets/smoke.jpg"   lekenin içinde görünecek görsel
 *   data-z="-1"                      -1: içeriğin arkasında (varsayılan), 0 ve üstü: öne al
 */
(function(){
  var SCRIPT = document.currentScript;
  var IMAGE_URL = (SCRIPT && SCRIPT.getAttribute('data-image')) || '/assets/smoke.jpg';
  var Z_INDEX = (SCRIPT && SCRIPT.getAttribute('data-z')) || '-1';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function boot(){



var CFG = {
  LIFE: 560,        // ms, iz ne kadar sürede kaybolur
  MIN_R: 9,         // yavaş harekette damla yarıçapı (px)
  MAX_R: 50,        // hızlı harekette en kalın yarıçap (px)
  SPACING: 0.6,     // noktalar arası mesafe (yarıçap çarpanı)
  FOLLOW: 22,       // imleç takip hızı (büyük = daha sıkı)
  DROP_CHANCE: 0.3, // kopan damlacık olasılığı
  MAX_POINTS: 66, MAX_DROPS: 14
};

(function(){
  var canvas = document.createElement('canvas');
  canvas.id = 'liquid-cursor-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:' + Z_INDEX;
  document.body.appendChild(canvas);
  var gl = canvas.getContext('webgl', {alpha:true, premultipliedAlpha:true, antialias:false});
  if(!gl) return;

  var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS = [
  '#ifdef GL_FRAGMENT_PRECISION_HIGH','precision highp float;','#else','precision mediump float;','#endif',
  'uniform vec2 uRes;uniform vec2 uImg;uniform float uT;uniform int uN;uniform vec3 uP[80];uniform sampler2D uTex;',
  'void main(){',
  ' vec2 fc=gl_FragCoord.xy;float f=0.0;',
  ' for(int i=0;i<80;i++){',
  '  if(i>=uN)break;',
  '  vec3 p=uP[i];vec2 d=fc-p.xy;float R=p.z*1.8;',
  '  float q=dot(d,d)/(R*R);',
  '  if(q<1.0){float k=1.0-q;f+=k*k*k;}',
  ' }',
  ' float T=0.25;',
  ' float m=smoothstep(T-0.035,T+0.035,f);',
  ' float g=smoothstep(0.0,T,f);float glowA=g*g*0.22;',
  ' float scale=max(uRes.x/uImg.x,uRes.y/uImg.y)*1.14;',
  ' vec2 drift=vec2(sin(uT*0.15),cos(uT*0.12))*0.02;',
  ' vec2 uv=(fc-uRes*0.5)/(uImg*scale)+0.5+drift;',
  ' vec3 col=texture2D(uTex,uv).rgb;',
  ' col*=0.92+0.22*smoothstep(T,T+0.6,f);',
  ' float x=(f-T)/0.06;float rim=exp(-x*x);',
  ' col+=vec3(0.5,0.6,1.0)*rim*0.16*m;',
  ' vec3 glowCol=vec3(0.35,0.5,1.0);',
  ' float a=m+glowA*(1.0-m);',
  ' vec3 rgb=col*m+glowCol*glowA*(1.0-m);',
  ' gl_FragColor=vec4(rgb,a);',
  '}'].join('\n');

  function sh(type, src){
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if(!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){ console.error(gl.getProgramInfoLog(prog)); return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog,'uRes'), uImg = gl.getUniformLocation(prog,'uImg'),
      uT = gl.getUniformLocation(prog,'uT'), uN = gl.getUniformLocation(prog,'uN'),
      uP = gl.getUniformLocation(prog,'uP'), uTex = gl.getUniformLocation(prog,'uTex');

  var dpr = 1, W = 0, H = 0;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(innerWidth * dpr); H = Math.round(innerHeight * dpr);
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
    gl.uniform2f(uRes, W, H);
  }
  resize(); addEventListener('resize', resize);

  var pts = [], drops = [];
  var tx = 0, ty = 0, cx = 0, cy = 0, active = false;
  var spS = 0, rS = CFG.MIN_R, drawn = false, last = performance.now();
  var arr = new Float32Array(80 * 3);

  addEventListener('pointermove', function(e){
    tx = e.clientX; ty = e.clientY;
    if(!active){ cx = tx; cy = ty; active = true; }
  }, {passive:true});
  document.documentElement.addEventListener('mouseleave', function(){ active = false; });
  addEventListener('blur', function(){ active = false; });

  function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }

  function frame(now){
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if(dt <= 0) return;

    if(active){
      var k = 1 - Math.exp(-dt * CFG.FOLLOW);
      var nx = cx + (tx - cx) * k, ny = cy + (ty - cy) * k;
      var dx = nx - cx, dy = ny - cy, dist = Math.sqrt(dx*dx + dy*dy);
      if(dist > 0.6){
        spS += (dist / dt - spS) * 0.18;
        var rT = clamp(CFG.MIN_R + spS * 0.02, CFG.MIN_R, CFG.MAX_R);
        rS += (rT - rS) * 0.25;
        var spacing = Math.max(5, rS * CFG.SPACING), n = Math.ceil(dist / spacing);
        for(var i = 1; i <= n; i++){
          var f = i / n;
          pts.push({x: cx + dx * f, y: cy + dy * f, r: rS, t: now, life: CFG.LIFE});
        }
        if(pts.length > CFG.MAX_POINTS) pts.splice(0, pts.length - CFG.MAX_POINTS);
        if(spS > 350 && Math.random() < CFG.DROP_CHANCE && drops.length < CFG.MAX_DROPS){
          var ux = dx / dist, uy = dy / dist, side = Math.random() < .5 ? -1 : 1, v = 90 + Math.random() * 200;
          drops.push({x: nx, y: ny, vx: -uy * side * v + ux * spS * 0.12, vy: ux * side * v + uy * spS * 0.12,
                      r: 3 + Math.random() * 6, t: now, life: 450 + Math.random() * 350});
        }
      } else { spS *= 0.9; }
      cx = nx; cy = ny;
    } else { spS *= 0.9; }

    pts = pts.filter(function(p){ return now - p.t < p.life; });
    drops = drops.filter(function(d){ return now - d.t < d.life; });

    var c = 0, p, s, r, age;
    for(var j = 0; j < drops.length; j++){
      p = drops[j]; p.x += p.vx * dt; p.y += p.vy * dt;
      var damp = Math.exp(-dt * 3); p.vx *= damp; p.vy *= damp;
      age = (now - p.t) / p.life; s = Math.pow(1 - age, 1.3); r = p.r * s * dpr;
      if(r < 0.8) continue;
      arr[c*3] = p.x * dpr; arr[c*3+1] = H - p.y * dpr; arr[c*3+2] = r; c++;
    }
    for(var q = 0; q < pts.length && c < 80; q++){
      p = pts[q]; age = (now - p.t) / p.life; s = Math.pow(1 - age, 1.3); r = p.r * s * dpr;
      if(r < 0.8) continue;
      arr[c*3] = p.x * dpr; arr[c*3+1] = H - p.y * dpr; arr[c*3+2] = r; c++;
    }

    if(c === 0){
      if(drawn){ gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT); drawn = false; }
      return;
    }
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1i(uN, c);
    gl.uniform3fv(uP, arr);
    gl.uniform1f(uT, now / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    drawn = true;
  }

  var img = new Image();
  img.onload = function(){
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(uTex, 0);
    gl.uniform2f(uImg, img.naturalWidth, img.naturalHeight);
    last = performance.now();
    requestAnimationFrame(frame);
  };
  img.src = IMAGE_URL;
})();


  }
  // React/SSR hydration bittikten sonra başlat
  if (document.readyState === 'complete') setTimeout(boot, 150);
  else addEventListener('load', function(){ setTimeout(boot, 150); });
})();
