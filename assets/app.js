(() => {
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onScroll = () => nav?.classList.toggle('scrolled', scrollY > 24);
  onScroll(); addEventListener('scroll', onScroll, {passive:true});
  toggle?.addEventListener('click', () => links?.classList.toggle('open'));
  links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal,.stagger').forEach(el => observer.observe(el));

  const light = document.querySelector('.cursor-light');
  if (light && !reduceMotion && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      light.style.left = e.clientX + 'px';
      light.style.top = e.clientY + 'px';
      light.classList.add('on');
    }, {passive:true});
    addEventListener('pointerleave', () => light.classList.remove('on'));
  }

  // Background architectural drawing: slow blueprint lines, nodes and orbital circles.
  const canvas = document.getElementById('ambient-plan');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  let w=0,h=0,dpr=1,t=0;
  const nodes = Array.from({length:18}, (_,i) => ({
    x:Math.random(), y:Math.random(), r:1+Math.random()*2,
    vx:(Math.random()-.5)*.000025, vy:(Math.random()-.5)*.00002,
    phase:Math.random()*Math.PI*2
  }));
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
    canvas.style.width = w+'px'; canvas.style.height = h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  resize(); addEventListener('resize', resize);

  const draw = () => {
    t += 1;
    ctx.clearRect(0,0,w,h);
    ctx.lineWidth = 1;
    // faint plan grid
    ctx.strokeStyle='rgba(114,128,124,.055)';
    const grid=96;
    const off=(t*.045)%grid;
    for(let x=-grid+off;x<w+grid;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=-grid+off*.42;y<h+grid;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}

    nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<-.1)n.x=1.1;if(n.x>1.1)n.x=-.1;if(n.y<-.1)n.y=1.1;if(n.y>1.1)n.y=-.1;});
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j], ax=a.x*w, ay=a.y*h, bx=b.x*w, by=b.y*h;
        const dist=Math.hypot(ax-bx,ay-by);
        if(dist<230){ctx.strokeStyle=`rgba(195,160,103,${(1-dist/230)*.045})`;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();}
      }
    }
    nodes.forEach((n,i)=>{
      const x=n.x*w,y=n.y*h,pulse=.5+.5*Math.sin(t*.012+n.phase);
      ctx.fillStyle=`rgba(224,194,140,${.07+pulse*.06})`;ctx.beginPath();ctx.arc(x,y,n.r,0,Math.PI*2);ctx.fill();
      if(i%5===0){ctx.strokeStyle='rgba(86,111,123,.07)';ctx.beginPath();ctx.arc(x,y,22+7*pulse,0,Math.PI*2);ctx.stroke();}
    });
    requestAnimationFrame(draw);
  };
  draw();
})();

function submitEnquiry(event){
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const lines = [
    'Hello Founders Architect, I would like to make an enquiry.',
    '',
    `Name: ${data.get('name') || ''}`,
    `Email: ${data.get('email') || ''}`,
    `Subject: ${data.get('subject') || 'Website enquiry'}`,
    '',
    `${data.get('message') || ''}`
  ];
  const url = 'https://wa.me/27628848362?text=' + encodeURIComponent(lines.join('\n'));
  window.open(url, '_blank', 'noopener');
}
