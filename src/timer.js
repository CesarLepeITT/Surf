export class CountdownTimer {
  constructor(onTick=()=>{},onFinish=()=>{}) { this.onTick=onTick; this.onFinish=onFinish; this.remaining=0; this.interval=null; this.running=false; }
  start(seconds) { this.stop(); this.remaining=seconds; this.running=true; this.onTick(this.remaining); this.interval=setInterval(()=>{this.remaining--;this.onTick(this.remaining);if(this.remaining<=0){this.stop();this.onFinish();}},1000); }
  pause() { if(this.running){clearInterval(this.interval);this.interval=null;this.running=false;} }
  resume() { if(!this.running&&this.remaining>0){this.running=true;this.interval=setInterval(()=>{this.remaining--;this.onTick(this.remaining);if(this.remaining<=0){this.stop();this.onFinish();}},1000);} }
  stop() { if(this.interval) clearInterval(this.interval);this.interval=null;this.running=false; }
}
export const formatSeconds = seconds => `${String(Math.max(0,Math.floor(seconds/60))).padStart(2,'0')}:${String(Math.max(0,seconds%60)).padStart(2,'0')}`;
