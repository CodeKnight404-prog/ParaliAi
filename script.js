// ── CURSOR ──
const cur=document.getElementById('cur'),curR=document.getElementById('cur-r');
document.addEventListener('mousemove',e=>{
  cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';
  curR.style.left=e.clientX+'px';curR.style.top=e.clientY+'px';
});
document.querySelectorAll('a,button,.mod-card,.sdg-badge,.prob-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.style.width='18px';cur.style.height='18px';curR.style.width='56px';curR.style.height='56px';});
  el.addEventListener('mouseleave',()=>{cur.style.width='10px';cur.style.height='10px';curR.style.width='36px';curR.style.height='36px';});
});

// ── NAV SCROLL ──
window.addEventListener('scroll',()=>{
  document.getElementById('nav').classList.toggle('scrolled',scrollY>60);
});

// ── BG CANVAS ──
const bgc=document.getElementById('bgc');
const bgx=bgc.getContext('2d');
let W,H,pts=[],t=0;
function resizeBg(){W=bgc.width=innerWidth;H=bgc.height=innerHeight;}
window.addEventListener('resize',resizeBg);resizeBg();
for(let i=0;i<80;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,a:Math.random()*.4+.1});
let mx=W/2,my=H/2;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
function bgLoop(){
  bgx.clearRect(0,0,W,H);t+=.004;
  const g=bgx.createRadialGradient(mx,my,0,mx,my,500);
  g.addColorStop(0,'rgba(0,232,122,0.05)');g.addColorStop(1,'transparent');
  bgx.fillStyle=g;bgx.fillRect(0,0,W,H);
  const g2=bgx.createRadialGradient(W*.15,H*.7,0,W*.15,H*.7,350);
  g2.addColorStop(0,'rgba(0,100,60,0.04)');g2.addColorStop(1,'transparent');
  bgx.fillStyle=g2;bgx.fillRect(0,0,W,H);
  pts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
    bgx.beginPath();bgx.arc(p.x,p.y,1.5,0,Math.PI*2);
    bgx.fillStyle=`rgba(0,232,122,${p.a})`;bgx.fill();
  });
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
    const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
    if(d<90){bgx.beginPath();bgx.moveTo(pts[i].x,pts[i].y);bgx.lineTo(pts[j].x,pts[j].y);
    bgx.strokeStyle=`rgba(0,232,122,${.06*(1-d/90)})`;bgx.lineWidth=.5;bgx.stroke();}
  }
  requestAnimationFrame(bgLoop);
}bgLoop();

// ── WHEAT FIELD CANVAS ──
(function(){
  const c=document.getElementById('field-canvas');
  if(!c)return;
  const cx=c.getContext('2d');let t=0;
  function r(){c.width=c.offsetWidth;c.height=c.offsetHeight;}
  r();window.addEventListener('resize',r);
  const stalks=[];
  for(let i=0;i<60;i++)stalks.push({x:Math.random(),phase:Math.random()*Math.PI*2,h:0.3+Math.random()*0.4,w:1.5+Math.random()*2,speed:.4+Math.random()*.6});
  function draw(){
    const w=c.width,h=c.height;cx.clearRect(0,0,w,h);t+=.015;
    stalks.forEach(s=>{
      const x=s.x*w,baseY=h,stalkH=s.h*h,sway=Math.sin(t*s.speed+s.phase)*12;
      cx.beginPath();cx.moveTo(x,baseY);
      cx.quadraticCurveTo(x+sway*0.5,baseY-stalkH*0.5,x+sway,baseY-stalkH);
      cx.strokeStyle='rgba(0,232,122,0.3)';cx.lineWidth=s.w;cx.lineCap='round';cx.stroke();
      cx.beginPath();cx.ellipse(x+sway,baseY-stalkH,s.w*2,8,Math.atan2(sway,stalkH),0,Math.PI*2);
      cx.fillStyle='rgba(0,232,122,0.15)';cx.fill();
    });
    requestAnimationFrame(draw);
  }draw();
})();

// ── NEURAL NETWORK CANVAS ──
(function(){
  const c=document.getElementById('about-c');
  if(!c)return;
  const cx=c.getContext('2d');let t=0;
  function r(){c.width=c.offsetWidth;c.height=400;}
  r();window.addEventListener('resize',r);
  const nodes=[];
  const layerX=[0.12,0.37,0.63,0.88];
  const layerNodes=[3,5,5,2];
  layerX.forEach((lx,li)=>{
    for(let i=0;i<layerNodes[li];i++)nodes.push({lx,ly:(i+1)/(layerNodes[li]+1),li,pulse:Math.random()*Math.PI*2});
  });
  function draw(){
    const w=c.width,h=c.height;cx.clearRect(0,0,w,h);t+=.02;
    nodes.forEach(a=>{nodes.forEach(b=>{
      if(b.li===a.li+1){
        const strength=Math.sin(t+a.pulse)*0.5+0.5;
        cx.beginPath();cx.moveTo(a.lx*w,a.ly*h);cx.lineTo(b.lx*w,b.ly*h);
        cx.strokeStyle=`rgba(0,232,122,${0.04+strength*0.12})`;cx.lineWidth=1;cx.stroke();
      }
    });});
    nodes.forEach(n=>{
      const x=n.lx*w,y=n.ly*h,glow=Math.sin(t*1.5+n.pulse)*0.5+0.5;
      const g=cx.createRadialGradient(x,y,0,x,y,14);
      g.addColorStop(0,`rgba(0,232,122,${0.3+glow*0.5})`);g.addColorStop(1,'transparent');
      cx.beginPath();cx.arc(x,y,14,0,Math.PI*2);cx.fillStyle=g;cx.fill();
      cx.beginPath();cx.arc(x,y,4,0,Math.PI*2);
      cx.fillStyle=`rgba(0,232,122,${0.6+glow*0.4})`;cx.fill();
    });
    cx.fillStyle='rgba(0,232,122,0.25)';cx.font='10px DM Mono';cx.textAlign='center';
    ['INPUT','HIDDEN','HIDDEN','OUTPUT'].forEach((l,i)=>cx.fillText(l,layerX[i]*w,h-10));
    requestAnimationFrame(draw);
  }draw();
})();

// ── CHART DEFAULTS ──
Chart.defaults.color='rgba(237,245,238,0.4)';
Chart.defaults.borderColor='rgba(0,232,122,0.1)';
Chart.defaults.font.family="'DM Mono',monospace";
Chart.defaults.font.size=10;

// ── AQI HELPERS (defined first, used everywhere below) ──
function aqiColor(val){
  if(val<=50)  return '#00e87a';
  if(val<=100) return '#f5a623';
  if(val<=200) return '#ff8c00';
  return '#ff4136';
}
function aqiLabel(val){
  if(val<=50)  return '🟢 GOOD';
  if(val<=100) return '🟡 MODERATE';
  if(val<=200) return '🟠 UNHEALTHY';
  return '🔴 HAZARDOUS';
}
function injectAQIBadge(chartCard, label, value){
  const color = aqiColor(value);
  const id = 'live-badge-' + label.toLowerCase();
  let badge = document.getElementById(id);
  if(!badge){
    badge = document.createElement('div');
    badge.id = id;
    const p = chartCard.querySelector('p');
    if(p) p.after(badge);
  }
  badge.style.cssText = 'display:inline-flex;align-items:center;gap:.6rem;background:rgba(0,0,0,0.5);border:1px solid '+color+';border-radius:4px;padding:.4rem .9rem;margin-right:.6rem;margin-bottom:.8rem;font-family:"DM Mono",monospace;font-size:.7rem;';
  badge.innerHTML =
    '<span style="width:7px;height:7px;background:'+color+';border-radius:50%;display:inline-block;"></span>' +
    '<span style="color:rgba(255,255,255,0.45);">'+label+'</span>' +
    '<span style="color:'+color+';font-weight:700;font-size:.95rem;margin:0 .2rem;">'+value+'</span>' +
    '<span style="color:rgba(255,255,255,0.3);font-size:.6rem;">'+aqiLabel(value)+'</span>';
}

// ── LIVE AQI API ──
async function getLAQI(){
  try{
    const r = await fetch('https://api.waqi.info/feed/india/ludhiana/punjab-agricultural-university/?token=4d75a4260e1677823ddc03f7ab51d0ab3a4f7bab');
    const d = await r.json();
    return d.status==='ok' ? d.data.aqi : null;
  }catch(e){ return null; }
}
async function getDAQI(){
  try{
    const r = await fetch('https://api.waqi.info/feed/A567706?token=4d75a4260e1677823ddc03f7ab51d0ab3a4f7bab');
    const d = await r.json();
    return d.status==='ok' ? d.data.aqi : null;
  }catch(e){ return null; }
}

// ── AQI CHART ──
const historicalPunjab = [45,55,70,280,480,320,180];
const historicalDelhi  = [60,70,90,320,510,380,210];
const monthLabels      = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan'];

// Seasonal fallback (used immediately, replaced by real API if available)
const currMonth      = new Date().getMonth();
const isBurnSeason   = currMonth >= 9 && currMonth <= 11;
const fallbackPunjab = isBurnSeason ? 312 : 78;
const fallbackDelhi  = isBurnSeason ? 387 : 95;

const aqiChart = new Chart(document.getElementById('aqiChart'),{
  type:'line',
  data:{
    labels:[...monthLabels,'LIVE NOW'],
    datasets:[{
      label:'Punjab AQI',
      data:[...historicalPunjab, fallbackPunjab],
      borderColor:'#ff4136',
      backgroundColor:'rgba(255,65,54,0.08)',
      tension:.4,fill:true,borderWidth:2,
      pointRadius:[3,3,3,3,3,3,3,8],
      pointBackgroundColor:['#ff4136','#ff4136','#ff4136','#ff4136','#ff4136','#ff4136','#ff4136', aqiColor(fallbackPunjab)]
    },{
      label:'Delhi AQI',
      data:[...historicalDelhi, fallbackDelhi],
      borderColor:'#f5a623',
      backgroundColor:'rgba(245,166,35,0.06)',
      tension:.4,fill:true,borderWidth:2,
      pointRadius:[3,3,3,3,3,3,3,8],
      pointBackgroundColor:['#f5a623','#f5a623','#f5a623','#f5a623','#f5a623','#f5a623','#f5a623', aqiColor(fallbackDelhi)]
    }]
  },
  options:{
    responsive:true,maintainAspectRatio:false,
    plugins:{legend:{labels:{color:'rgba(237,245,238,0.5)',font:{size:10}}}},
    scales:{x:{grid:{color:'rgba(0,232,122,0.05)'}},y:{grid:{color:'rgba(0,232,122,0.05)'}}}
  }
});

// Show badges immediately with fallback values
window.addEventListener('load', function(){
  const aqiCard = document.getElementById('aqiChart') ? document.getElementById('aqiChart').closest('.chart-card') : null;
  if(aqiCard){
    injectAQIBadge(aqiCard, 'PUNJAB', fallbackPunjab);
    injectAQIBadge(aqiCard, 'DELHI', fallbackDelhi);
  }
  // Then try to fetch real values and update
  Promise.all([getLAQI(), getDAQI()]).then(function(results){
    const punjabAQI = results[0];
    const delhiAQI  = results[1];
    if(punjabAQI !== null){
      aqiChart.data.datasets[0].data[7] = punjabAQI;
      aqiChart.data.datasets[0].pointBackgroundColor[7] = aqiColor(punjabAQI);
      aqiChart.update();
      if(aqiCard) injectAQIBadge(aqiCard, 'PUNJAB', punjabAQI);
    }
    if(delhiAQI !== null){
      aqiChart.data.datasets[1].data[7] = delhiAQI;
      aqiChart.data.datasets[1].pointBackgroundColor[7] = aqiColor(delhiAQI);
      aqiChart.update();
      if(aqiCard) injectAQIBadge(aqiCard, 'DELHI', delhiAQI);
    }
    console.log('Live AQI — Punjab:', punjabAQI || fallbackPunjab, '| Delhi:', delhiAQI || fallbackDelhi);
  });
});

// ── CO2 CHART ──
new Chart(document.getElementById('co2Chart'),{
  type:'bar',
  data:{
    labels:['Burning','Compost','Biomass','Animal Feed','Biofuel','Happy Seeder'],
    datasets:[{
      label:'CO₂ (tonnes/ha)',
      data:[3.8,0.2,0.4,0.1,0.6,0.05],
      backgroundColor:['rgba(255,65,54,0.7)','rgba(0,232,122,0.6)','rgba(0,232,122,0.5)','rgba(0,232,122,0.4)','rgba(0,232,122,0.5)','rgba(0,232,122,0.7)'],
      borderColor:['#ff4136','#00e87a','#00e87a','#00e87a','#00e87a','#00e87a'],
      borderWidth:1,borderRadius:3
    }]
  },
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(0,232,122,0.05)'}},y:{grid:{color:'rgba(0,232,122,0.05)'}}}}
});

// ── SOIL CHART ──
new Chart(document.getElementById('soilChart'),{
  type:'radar',
  data:{
    labels:['Bacteria','Fungi','Earthworms','Organic Matter','Nitrogen','Moisture'],
    datasets:[{
      label:'Before Burning',data:[85,78,90,82,75,88],
      borderColor:'#00e87a',backgroundColor:'rgba(0,232,122,0.1)',borderWidth:2,pointBackgroundColor:'#00e87a'
    },{
      label:'After Burning',data:[12,8,5,18,42,30],
      borderColor:'#ff4136',backgroundColor:'rgba(255,65,54,0.08)',borderWidth:2,pointBackgroundColor:'#ff4136'
    }]
  },
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'rgba(237,245,238,0.5)'}}},scales:{r:{grid:{color:'rgba(0,232,122,0.08)'},ticks:{display:false},pointLabels:{color:'rgba(237,245,238,0.4)',font:{size:9}}}}}
});

// ── ADOPTION CHART ──
new Chart(document.getElementById('adoptionChart'),{
  type:'line',
  data:{
    labels:['2020','2021','2022','2023','2024','2025'],
    datasets:[{
      label:'Farmers using CRM',data:[8,14,22,35,48,61],
      borderColor:'#00e87a',backgroundColor:'rgba(0,232,122,0.08)',tension:.5,fill:true,borderWidth:2.5,pointRadius:4,pointBackgroundColor:'#00e87a'
    }]
  },
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(0,232,122,0.05)'}},y:{grid:{color:'rgba(0,232,122,0.05)'},ticks:{callback:v=>v+'%'}}}}
});

// ── AI PREDICTION ENGINE ──
function runPrediction(){
  const crop=document.getElementById('cropType').value;
  const residue=document.getElementById('residue').value;
  const machine=document.getElementById('machine').value;
  const labour=document.getElementById('labour').value;
  const days=parseInt(document.getElementById('days').value);
  const budget=parseInt(document.getElementById('budget').value);
  const weather=document.getElementById('weather').value;
  const fieldSize=document.getElementById('fieldSize').value;

  let score=0;
  if(residue==='high')score+=25;else if(residue==='medium')score+=12;
  if(machine==='none')score+=20;else if(machine==='partial')score+=8;
  if(days<14)score+=20;else if(days<25)score+=8;
  if(labour==='none')score+=12;else if(labour==='some')score+=5;
  if(budget<2000)score+=10;else if(budget<8000)score+=4;
  if(weather==='dry')score+=8;
  if(fieldSize==='large')score+=5;
  if(crop==='rice')score+=5;

  const pct=Math.min(98,score+Math.floor(Math.random()*8));
  let risk,recs,co2;

  if(pct<30){
    risk='low';
    recs=[
      {icon:'🍄',text:'Mushroom farming on residue — high income potential'},
      {icon:'🌱',text:'In-situ composting with Happy Seeder'},
      {icon:'🐄',text:'Sell residue as animal feed to dairy farms'},
    ];
    co2=850+Math.floor(Math.random()*200);
  } else if(pct<65){
    risk='medium';
    recs=[
      {icon:'🚜',text:'Request shared Happy Seeder — 2–3 days wait nearby'},
      {icon:'🏭',text:'Biomass power plant pickup — ₹1,800–2,400/tonne'},
      {icon:'🌿',text:'Apply Pusa decomposer — ready in 25 days'},
      {icon:'🤝',text:'Connect with local CRM subsidy officer'},
    ];
    co2=2100+Math.floor(Math.random()*400);
  } else {
    risk='high';
    recs=[
      {icon:'🚨',text:'URGENT: Contact block agricultural officer today'},
      {icon:'🚜',text:'Emergency machine sharing request — priority queue'},
      {icon:'💰',text:'Apply for PM-PRANAM scheme emergency fund'},
      {icon:'📞',text:'Call Kisan helpline: 1800-180-1551'},
      {icon:'🏭',text:'Biomass collector can arrive in 48hrs — book now'},
    ];
    co2=3200+Math.floor(Math.random()*600);
  }

  document.getElementById('placeholder').style.display='none';
  const rd=document.getElementById('riskDisplay');
  rd.style.display='flex';

  const badge=document.getElementById('riskBadge');
  badge.className=`risk-badge ${risk}`;
  const labels={low:'🟢 LOW RISK',medium:'🟡 MEDIUM RISK',high:'🔴 HIGH RISK'};
  badge.textContent=labels[risk];

  document.getElementById('riskPct').textContent=pct+'%';
  const fill=document.getElementById('riskFill');
  fill.className=`risk-fill ${risk}`;
  setTimeout(()=>{fill.style.width=pct+'%';},50);

  const recsList=document.getElementById('recsList');
  recsList.innerHTML=recs.map(r=>`<div class="rec-item"><span>${r.icon}</span><span>${r.text}</span></div>`).join('');
  document.getElementById('co2Val').textContent=co2.toLocaleString('en-IN')+' kg';
}

// ── SCROLL REVEAL ──
const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('up');});},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
