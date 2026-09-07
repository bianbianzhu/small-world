// UI copy in both languages. Static DOM text is keyed by data-i18n attributes; dynamic text
// (room views, toy names, activity messages) is looked up through t() / toyText().
export const LANGS=['zh','en'];
const STRINGS={
zh:{
 htmlLang:'zh-CN',
 title:'悦悦的小小世界 · Little moments, big wonders',
 description:'悦悦的小小世界，一个充满阳光、玩具与好奇心的互动 3D 小家，连通游戏房、悦悦的卧室与白色小浴室。',
 canvasLabel:'悦悦的三维小家，拖动旋转，滚轮缩放',
 brand:'悦悦的小小世界',brandSub:'YUEYUE’S LITTLE WORLD',
 weather:'一个慢慢长大的下午',weatherSub:'22°C · 阳光正好',
 soundOn:'开启环境音乐',soundOff:'关闭环境音乐',soundTitle:'环境音乐',
 langButton:'EN',langSwitch:'Switch to English',
 roomNav:'房间视角',roomPlayroom:'01 游戏房',roomBedroom:'02 悦悦卧室',roomBathroom:'03 洗手间',roomHome:'整个小家',
 eyebrow:'在这里，好奇心自由生长',
 visitBedroom:'陪悦悦去卧室',visitBathroom:'陪悦悦去洗澡',
 avatar:'悦',childName:'悦悦',childTag:'2 岁 · 小小探索家',
 activityDefault:'正在发现今天的小惊喜…',
 viewNav:'视角控制',zoomIn:'放大',zoomOut:'缩小',rotate:'自动环绕',reset:'回到初始视角',
 hint:'拖动旋转 <i>·</i> 滚轮缩放 <i>·</i> 点击玩具，邀请悦悦',
 pause:'暂停悦悦的活动',resume:'继续悦悦的活动',
 playback:'自由探索',playbackSub:'每一刻，都是新发现',
 toysToggle:'玩具小天地',toyPanel:'玩具选择',toyPanelTitle:'今天，玩什么？',closeToys:'关闭玩具列表',
 loading:'阳光和玩具，正在就位',
 webgl:'这个浏览器暂时无法打开 3D 小世界。请开启硬件加速，或使用支持 WebGL 的浏览器。',
 // Activity messages from the Director.
 msgQueue:'玩好手里的，就去{toy}…',msgBlocked:'换一条路，再去找小玩具',msgWalking:'正在走向{toy}…',msgIdle:'看看，还有什么好玩的呢？',
 // Room views.
 views:{
  playroom:{label:'阳光游戏室',english:'THE PLAYROOM',title:'小小世界，<br/>大大的<span>好奇心。</span>',text:'不用赶时间。<br/>陪悦悦，玩一会儿吧。',detail:'60 m²'},
  bedroom:{label:'悦悦的卧室',english:'YUEYUE’S BEDROOM',title:'抱一抱，<br/>做个<span>甜甜的梦。</span>',text:'把今天的小快乐，<br/>轻轻放进梦里。',detail:'绘本 · 云朵床 · 晚安小熊'},
  bathroom:{label:'云朵洗手间',english:'THE BATHROOM',title:'泡泡满满，<br/>洗一个<span>香香的澡。</span>',text:'小黄鸭在等你，<br/>水温刚刚好。',detail:'浴缸 · 泡泡 · 小黄鸭'},
  home:{label:'悦悦的小家',english:'OUR LITTLE HOME',title:'玩耍、美梦和泡泡，<br/>都在<span>一个小家。</span>',text:'阳光游戏房，柔软小卧室，白色小浴室。<br/>每个角落，都有一点喜欢。',detail:'游戏房 ＋ 卧室 ＋ 洗手间'}
 },
 toys:{
  castle:{label:'云朵城堡',status:'爬上小城堡，再滑下来！'},
  blocks:{label:'彩虹积木',status:'认真地搭一座小小高楼'},
  books:{label:'绘本时光',status:'翻开绘本，发现一个新故事'},
  music:{label:'叮咚木琴',status:'叮叮咚咚，敲出自己的旋律'},
  ball:{label:'滚滚球球',status:'推一推，小球会滚到哪里呢？'},
  bunny:{label:'兔兔朋友',status:'抱抱兔兔，最喜欢你啦'},
  'bedroom-book':{label:'睡前绘本',status:'在卧室里，读一个温柔的小故事'},
  'bedroom-bear':{label:'晚安小熊',status:'抱抱小熊，今天也要做个好梦'},
  'bath-duck':{label:'小黄鸭',status:'抱着小黄鸭，嘎嘎嘎，一起洗澡澡'},
  'bath-cups':{label:'泡泡叠叠杯',status:'一个一个，把小杯子叠成小高塔'}
 }
},
en:{
 htmlLang:'en',
 title:'Yueyue\'s Little World · Little moments, big wonders',
 description:'Yueyue\'s Little World, an interactive 3D home full of sunshine, toys and curiosity, linking the playroom, Yueyue\'s bedroom and a little white bathroom.',
 canvasLabel:'Yueyue\'s 3D home. Drag to rotate, scroll to zoom.',
 brand:'Yueyue\'s Little World',brandSub:'悦悦的小小世界',
 weather:'A slow, growing afternoon',weatherSub:'22°C · Perfect sunshine',
 soundOn:'Turn on ambient music',soundOff:'Turn off ambient music',soundTitle:'Ambient music',
 langButton:'中',langSwitch:'切换为中文',
 roomNav:'Room views',roomPlayroom:'01 Playroom',roomBedroom:'02 Bedroom',roomBathroom:'03 Bathroom',roomHome:'Whole home',
 eyebrow:'Where curiosity grows freely',
 visitBedroom:'Walk Yueyue to bed',visitBathroom:'Bath time with Yueyue',
 avatar:'Y',childName:'Yueyue',childTag:'Age 2 · Little explorer',
 activityDefault:'Discovering today\'s little surprise…',
 viewNav:'View controls',zoomIn:'Zoom in',zoomOut:'Zoom out',rotate:'Auto orbit',reset:'Reset view',
 hint:'Drag to rotate <i>·</i> Scroll to zoom <i>·</i> Click a toy to invite Yueyue',
 pause:'Pause Yueyue\'s activity',resume:'Resume Yueyue\'s activity',
 playback:'Free play',playbackSub:'Every moment, a new discovery',
 toysToggle:'Toy corner',toyPanel:'Toy picker',toyPanelTitle:'What shall we play today?',closeToys:'Close toy list',
 loading:'Sunshine and toys are getting ready',
 webgl:'This browser cannot open the 3D world right now. Please enable hardware acceleration or use a browser that supports WebGL.',
 msgQueue:'Finishing this first, then off to {toy}…',msgBlocked:'Finding another way to the toys',msgWalking:'Walking over to {toy}…',msgIdle:'Hmm, what else looks fun?',
 views:{
  playroom:{label:'Sunny Playroom',english:'THE PLAYROOM',title:'A little world,<br/>a great big <span>curiosity.</span>',text:'No need to hurry.<br/>Stay and play with Yueyue a while.',detail:'60 m²'},
  bedroom:{label:'Yueyue\'s Bedroom',english:'YUEYUE\'S BEDROOM',title:'A warm hug,<br/>and a <span>sweet dream.</span>',text:'Tuck today\'s little joys<br/>gently into tonight\'s dreams.',detail:'Picture book · Cloud bed · Goodnight bear'},
  bathroom:{label:'Cloud Bathroom',english:'THE BATHROOM',title:'Bubbles everywhere,<br/>and a <span>warm, sweet bath.</span>',text:'Little duck is waiting,<br/>and the water is just right.',detail:'Bathtub · Bubbles · Rubber duck'},
  home:{label:'Yueyue\'s Home',english:'OUR LITTLE HOME',title:'Play, dreams and bubbles,<br/>all in <span>one little home.</span>',text:'A sunny playroom, a soft bedroom, a white little bathroom.<br/>Something to love in every corner.',detail:'Playroom + Bedroom + Bathroom'}
 },
 toys:{
  castle:{label:'Cloud Castle',status:'Climbing up the castle, then sliding down!'},
  blocks:{label:'Rainbow Blocks',status:'Carefully building a tiny tall tower'},
  books:{label:'Story Time',status:'Opening a picture book to find a new story'},
  music:{label:'Ding-dong Xylophone',status:'Ding, dong, tapping out her own tune'},
  ball:{label:'Rolling Ball',status:'A little push… where will the ball roll?'},
  bunny:{label:'Bunny Friend',status:'Hugging bunny, her very favourite'},
  'bedroom-book':{label:'Bedtime Story',status:'Reading a gentle little story in the bedroom'},
  'bedroom-bear':{label:'Goodnight Bear',status:'Hugging teddy, sweet dreams tonight'},
  'bath-duck':{label:'Rubber Duck',status:'Hugging the little duck, quack quack, bath time!'},
  'bath-cups':{label:'Stacking Cups',status:'Stacking the bath cups into a little tower'}
 }
}
};
const STORAGE_KEY='yueyue-lang';
let lang=detect();
const listeners=new Set();
function detect(){
 try{const saved=localStorage.getItem(STORAGE_KEY);if(LANGS.includes(saved))return saved;}catch{}
 const nav=typeof navigator!=='undefined'?navigator.language||'':'';
 return nav.toLowerCase().startsWith('zh')?'zh':'en';
}
export function getLang(){return lang;}
export function setLang(next){
 if(!LANGS.includes(next)||next===lang)return;
 lang=next;try{localStorage.setItem(STORAGE_KEY,next);}catch{}
 for(const fn of listeners)fn(lang);
}
export function toggleLang(){setLang(lang==='zh'?'en':'zh');}
export function onLangChange(fn){listeners.add(fn);return()=>listeners.delete(fn);}
export function t(key,vars){
 let s=STRINGS[lang][key]??STRINGS.zh[key]??key;
 if(vars)for(const [k,v] of Object.entries(vars))s=s.replaceAll(`{${k}}`,v);
 return s;
}
export function viewText(id){return STRINGS[lang].views[id]??STRINGS.zh.views[id];}
export function toyText(toy){return STRINGS[lang].toys[toy.id]??STRINGS.zh.toys[toy.id]??{label:toy.label,status:toy.status};}
// Format an activity message emitted by the Director.
export function activityText(key,toy){
 if(key==='playing')return toyText(toy).status;
 const map={queue:'msgQueue',blocked:'msgBlocked',walking:'msgWalking',idle:'msgIdle'};
 return t(map[key]??'activityDefault',{toy:toy?toyText(toy).label:''});
}
// Refresh every element tagged with data-i18n / data-i18n-attr in the document.
export function applyStatic(root=document){
 root.documentElement?.setAttribute('lang',t('htmlLang'));
 if(root===document){document.title=t('title');document.querySelector('meta[name=description]')?.setAttribute('content',t('description'));}
 for(const el of root.querySelectorAll('[data-i18n]')){const html=el.dataset.i18nHtml!==undefined;html?el.innerHTML=t(el.dataset.i18n):el.textContent=t(el.dataset.i18n);}
 for(const el of root.querySelectorAll('[data-i18n-attr]')){for(const pair of el.dataset.i18nAttr.split(';')){const [attr,key]=pair.split(':');if(attr&&key)el.setAttribute(attr.trim(),t(key.trim()));}}
}
