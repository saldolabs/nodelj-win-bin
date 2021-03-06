/*
 * Copyright (C) 2016 by Marijn Haverbeke <marijnh@gmail.com> and others
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */




(function(global,factory){typeof exports==='object'&&typeof module!=='undefined'?module.exports=factory():typeof define==='function'&&define.amd?define(factory):(global.CodeMirror=factory());}(this,(function(){'use strict';
var userAgent=navigator.userAgent
var platform=navigator.platform
var gecko=/gecko\/\d/i.test(userAgent)
var ie_upto10=/MSIE \d/.test(userAgent)
var ie_11up=/Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent)
var ie=ie_upto10||ie_11up
var ie_version=ie&&(ie_upto10?document.documentMode||6:ie_11up[1])
var webkit=/WebKit\//.test(userAgent)
var qtwebkit=webkit&&/Qt\/\d+\.\d+/.test(userAgent)
var chrome=/Chrome\//.test(userAgent)
var presto=/Opera\//.test(userAgent)
var safari=/Apple Computer/.test(navigator.vendor)
var mac_geMountainLion=/Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent)
var phantom=/PhantomJS/.test(userAgent)
var ios=/AppleWebKit/.test(userAgent)&&/Mobile\/\w+/.test(userAgent)
var mobile=ios||/Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent)
var mac=ios||/Mac/.test(platform)
var chromeOS=/\bCrOS\b/.test(userAgent)
var windows=/win/i.test(platform)
var presto_version=presto&&userAgent.match(/Version\/(\d*\.\d*)/)
if(presto_version){presto_version=Number(presto_version[1])}
if(presto_version&&presto_version>=15){presto=false;webkit=true}
var flipCtrlCmd=mac&&(qtwebkit||presto&&(presto_version==null||presto_version<12.11))
var captureRightClick=gecko||(ie&&ie_version>=9)
function classTest(cls){return new RegExp("(^|\\s)"+cls+"(?:$|\\s)\\s*")}
var rmClass=function(node,cls){var current=node.className
var match=classTest(cls).exec(current)
if(match){var after=current.slice(match.index+match[0].length)
node.className=current.slice(0,match.index)+(after?match[1]+after:"")}}
function removeChildren(e){for(var count=e.childNodes.length;count>0;--count)
{e.removeChild(e.firstChild)}
return e}
function removeChildrenAndAdd(parent,e){return removeChildren(parent).appendChild(e)}
function elt(tag,content,className,style){var e=document.createElement(tag)
if(className){e.className=className}
if(style){e.style.cssText=style}
if(typeof content=="string"){e.appendChild(document.createTextNode(content))}
else if(content){for(var i=0;i<content.length;++i){e.appendChild(content[i])}}
return e}
var range
if(document.createRange){range=function(node,start,end,endNode){var r=document.createRange()
r.setEnd(endNode||node,end)
r.setStart(node,start)
return r}}
else{range=function(node,start,end){var r=document.body.createTextRange()
try{r.moveToElementText(node.parentNode)}
catch(e){return r}
r.collapse(true)
r.moveEnd("character",end)
r.moveStart("character",start)
return r}}
function contains(parent,child){if(child.nodeType==3)
{child=child.parentNode}
if(parent.contains)
{return parent.contains(child)}
do{if(child.nodeType==11){child=child.host}
if(child==parent){return true}}while(child=child.parentNode)}
function activeElt(){var activeElement
try{activeElement=document.activeElement}catch(e){activeElement=document.body||null}
while(activeElement&&activeElement.root&&activeElement.root.activeElement)
{activeElement=activeElement.root.activeElement}
return activeElement}
function addClass(node,cls){var current=node.className
if(!classTest(cls).test(current)){node.className+=(current?" ":"")+cls}}
function joinClasses(a,b){var as=a.split(" ")
for(var i=0;i<as.length;i++)
{if(as[i]&&!classTest(as[i]).test(b)){b+=" "+as[i]}}
return b}
var selectInput=function(node){node.select()}
if(ios)
{selectInput=function(node){node.selectionStart=0;node.selectionEnd=node.value.length}}
else if(ie)
{selectInput=function(node){try{node.select()}catch(_e){}}}
function bind(f){var args=Array.prototype.slice.call(arguments,1)
return function(){return f.apply(null,args)}}
function copyObj(obj,target,overwrite){if(!target){target={}}
for(var prop in obj)
{if(obj.hasOwnProperty(prop)&&(overwrite!==false||!target.hasOwnProperty(prop)))
{target[prop]=obj[prop]}}
return target}
function countColumn(string,end,tabSize,startIndex,startValue){if(end==null){end=string.search(/[^\s\u00a0]/)
if(end==-1){end=string.length}}
for(var i=startIndex||0,n=startValue||0;;){var nextTab=string.indexOf("\t",i)
if(nextTab<0||nextTab>=end)
{return n+(end-i)}
n+=nextTab-i
n+=tabSize-(n%tabSize)
i=nextTab+1}}
function Delayed(){this.id=null}
Delayed.prototype.set=function(ms,f){clearTimeout(this.id)
this.id=setTimeout(f,ms)}
function indexOf(array,elt){for(var i=0;i<array.length;++i)
{if(array[i]==elt){return i}}
return-1}
var scrollerGap=30


var Pass={toString:function(){return"CodeMirror.Pass"}}
var sel_dontScroll={scroll:false};var sel_mouse={origin:"*mouse"};var sel_move={origin:"+move"};
function findColumn(string,goal,tabSize){for(var pos=0,col=0;;){var nextTab=string.indexOf("\t",pos)
if(nextTab==-1){nextTab=string.length}
var skipped=nextTab-pos
if(nextTab==string.length||col+skipped>=goal)
{return pos+Math.min(skipped,goal-col)}
col+=nextTab-pos
col+=tabSize-(col%tabSize)
pos=nextTab+1
if(col>=goal){return pos}}}
var spaceStrs=[""]
function spaceStr(n){while(spaceStrs.length<=n)
{spaceStrs.push(lst(spaceStrs)+" ")}
return spaceStrs[n]}
function lst(arr){return arr[arr.length-1]}
function map(array,f){var out=[]
for(var i=0;i<array.length;i++){out[i]=f(array[i],i)}
return out}
function insertSorted(array,value,score){var pos=0,priority=score(value)
while(pos<array.length&&score(array[pos])<=priority){pos++}
array.splice(pos,0,value)}
function nothing(){}
function createObj(base,props){var inst
if(Object.create){inst=Object.create(base)}else{nothing.prototype=base
inst=new nothing()}
if(props){copyObj(props,inst)}
return inst}
var nonASCIISingleCaseWordChar=/[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;function isWordCharBasic(ch){return/\w/.test(ch)||ch>"\x80"&&(ch.toUpperCase()!=ch.toLowerCase()||nonASCIISingleCaseWordChar.test(ch))}
function isWordChar(ch,helper){if(!helper){return isWordCharBasic(ch)}
if(helper.source.indexOf("\\w")>-1&&isWordCharBasic(ch)){return true}
return helper.test(ch)}
function isEmpty(obj){for(var n in obj){if(obj.hasOwnProperty(n)&&obj[n]){return false}}
return true}


var extendingChars=/[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;function isExtendingChar(ch){return ch.charCodeAt(0)>=768&&extendingChars.test(ch)}


function Display(place,doc,input){var d=this
this.input=input

d.scrollbarFiller=elt("div",null,"CodeMirror-scrollbar-filler")
d.scrollbarFiller.setAttribute("cm-not-content","true")

d.gutterFiller=elt("div",null,"CodeMirror-gutter-filler")
d.gutterFiller.setAttribute("cm-not-content","true")
d.lineDiv=elt("div",null,"CodeMirror-code")
d.selectionDiv=elt("div",null,null,"position: relative; z-index: 1")
d.cursorDiv=elt("div",null,"CodeMirror-cursors")
d.measure=elt("div",null,"CodeMirror-measure")
d.lineMeasure=elt("div",null,"CodeMirror-measure") 
d.lineSpace=elt("div",[d.measure,d.lineMeasure,d.selectionDiv,d.cursorDiv,d.lineDiv],null,"position: relative; outline: none")
d.mover=elt("div",[elt("div",[d.lineSpace],"CodeMirror-lines")],null,"position: relative")
d.sizer=elt("div",[d.mover],"CodeMirror-sizer")
d.sizerWidth=null



d.heightForcer=elt("div",null,null,"position: absolute; height: "+scrollerGap+"px; width: 1px;")
d.gutters=elt("div",null,"CodeMirror-gutters")
d.lineGutter=null

d.scroller=elt("div",[d.sizer,d.heightForcer,d.gutters],"CodeMirror-scroll")
d.scroller.setAttribute("tabIndex","-1")
d.wrapper=elt("div",[d.scrollbarFiller,d.gutterFiller,d.scroller],"CodeMirror")
if(ie&&ie_version<8){d.gutters.style.zIndex=-1;d.scroller.style.paddingRight=0}
if(!webkit&&!(gecko&&mobile)){d.scroller.draggable=true}
if(place){if(place.appendChild){place.appendChild(d.wrapper)}
else{place(d.wrapper)}}
d.viewFrom=d.viewTo=doc.first
d.reportedViewFrom=d.reportedViewTo=doc.first

d.view=[]
d.renderedView=null


d.externalMeasured=null
 
d.viewOffset=0
d.lastWrapHeight=d.lastWrapWidth=0
d.updateLineNumbers=null
d.nativeBarWidth=d.barHeight=d.barWidth=0
d.scrollbarsClipped=false


d.lineNumWidth=d.lineNumInnerWidth=d.lineNumChars=null



d.alignWidgets=false
d.cachedCharWidth=d.cachedTextHeight=d.cachedPaddingH=null


d.maxLine=null
d.maxLineLength=0
d.maxLineChanged=false
 
d.wheelDX=d.wheelDY=d.wheelStartX=d.wheelStartY=null

d.shift=false


d.selForContextMenu=null
d.activeTouch=null
input.init(d)}
function getLine(doc,n){n-=doc.first
if(n<0||n>=doc.size){throw new Error("There is no line "+(n+doc.first)+" in the document.")}
var chunk=doc
while(!chunk.lines){for(var i=0;;++i){var child=chunk.children[i],sz=child.chunkSize()
if(n<sz){chunk=child;break}
n-=sz}}
return chunk.lines[n]}

function getBetween(doc,start,end){var out=[],n=start.line
doc.iter(start.line,end.line+1,function(line){var text=line.text
if(n==end.line){text=text.slice(0,end.ch)}
if(n==start.line){text=text.slice(start.ch)}
out.push(text)
++n})
return out}
function getLines(doc,from,to){var out=[]
doc.iter(from,to,function(line){out.push(line.text)}) 
return out}

function updateLineHeight(line,height){var diff=height-line.height
if(diff){for(var n=line;n;n=n.parent){n.height+=diff}}}

function lineNo(line){if(line.parent==null){return null}
var cur=line.parent,no=indexOf(cur.lines,line)
for(var chunk=cur.parent;chunk;cur=chunk,chunk=chunk.parent){for(var i=0;;++i){if(chunk.children[i]==cur){break}
no+=chunk.children[i].chunkSize()}}
return no+cur.first}

function lineAtHeight(chunk,h){var n=chunk.first
outer:do{for(var i$1=0;i$1<chunk.children.length;++i$1){var child=chunk.children[i$1],ch=child.height
if(h<ch){chunk=child;continue outer}
h-=ch
n+=child.chunkSize()}
return n}while(!chunk.lines)
var i=0
for(;i<chunk.lines.length;++i){var line=chunk.lines[i],lh=line.height
if(h<lh){break}
h-=lh}
return n+i}
function isLine(doc,l){return l>=doc.first&&l<doc.first+doc.size}
function lineNumberFor(options,i){return String(options.lineNumberFormatter(i+options.firstLineNumber))}
function Pos(line,ch){if(!(this instanceof Pos)){return new Pos(line,ch)}
this.line=line;this.ch=ch}

function cmp(a,b){return a.line-b.line||a.ch-b.ch}
function copyPos(x){return Pos(x.line,x.ch)}
function maxPos(a,b){return cmp(a,b)<0?b:a}
function minPos(a,b){return cmp(a,b)<0?a:b}

function clipLine(doc,n){return Math.max(doc.first,Math.min(n,doc.first+doc.size-1))}
function clipPos(doc,pos){if(pos.line<doc.first){return Pos(doc.first,0)}
var last=doc.first+doc.size-1
if(pos.line>last){return Pos(last,getLine(doc,last).text.length)}
return clipToLen(pos,getLine(doc,pos.line).text.length)}
function clipToLen(pos,linelen){var ch=pos.ch
if(ch==null||ch>linelen){return Pos(pos.line,linelen)}
else if(ch<0){return Pos(pos.line,0)}
else{return pos}}
function clipPosArray(doc,array){var out=[]
for(var i=0;i<array.length;i++){out[i]=clipPos(doc,array[i])}
return out}
var sawReadOnlySpans=false;var sawCollapsedSpans=false;function seeReadOnlySpans(){sawReadOnlySpans=true}
function seeCollapsedSpans(){sawCollapsedSpans=true}
function MarkedSpan(marker,from,to){this.marker=marker
this.from=from;this.to=to}
function getMarkedSpanFor(spans,marker){if(spans){for(var i=0;i<spans.length;++i){var span=spans[i]
if(span.marker==marker){return span}}}}

function removeMarkedSpan(spans,span){var r
for(var i=0;i<spans.length;++i)
{if(spans[i]!=span){(r||(r=[])).push(spans[i])}}
return r}
function addMarkedSpan(line,span){line.markedSpans=line.markedSpans?line.markedSpans.concat([span]):[span]
span.marker.attachLine(line)}



function markedSpansBefore(old,startCh,isInsert){var nw
if(old){for(var i=0;i<old.length;++i){var span=old[i],marker=span.marker
var startsBefore=span.from==null||(marker.inclusiveLeft?span.from<=startCh:span.from<startCh)
if(startsBefore||span.from==startCh&&marker.type=="bookmark"&&(!isInsert||!span.marker.insertLeft)){var endsAfter=span.to==null||(marker.inclusiveRight?span.to>=startCh:span.to>startCh);(nw||(nw=[])).push(new MarkedSpan(marker,span.from,endsAfter?null:span.to))}}}
return nw}
function markedSpansAfter(old,endCh,isInsert){var nw
if(old){for(var i=0;i<old.length;++i){var span=old[i],marker=span.marker
var endsAfter=span.to==null||(marker.inclusiveRight?span.to>=endCh:span.to>endCh)
if(endsAfter||span.from==endCh&&marker.type=="bookmark"&&(!isInsert||span.marker.insertLeft)){var startsBefore=span.from==null||(marker.inclusiveLeft?span.from<=endCh:span.from<endCh);(nw||(nw=[])).push(new MarkedSpan(marker,startsBefore?null:span.from-endCh,span.to==null?null:span.to-endCh))}}}
return nw}





function stretchSpansOverChange(doc,change){if(change.full){return null}
var oldFirst=isLine(doc,change.from.line)&&getLine(doc,change.from.line).markedSpans
var oldLast=isLine(doc,change.to.line)&&getLine(doc,change.to.line).markedSpans
if(!oldFirst&&!oldLast){return null}
var startCh=change.from.ch,endCh=change.to.ch,isInsert=cmp(change.from,change.to)==0
 
var first=markedSpansBefore(oldFirst,startCh,isInsert)
var last=markedSpansAfter(oldLast,endCh,isInsert) 
var sameLine=change.text.length==1,offset=lst(change.text).length+(sameLine?startCh:0)
if(first){ for(var i=0;i<first.length;++i){var span=first[i]
if(span.to==null){var found=getMarkedSpanFor(last,span.marker)
if(!found){span.to=startCh}
else if(sameLine){span.to=found.to==null?null:found.to+offset}}}}
if(last){for(var i$1=0;i$1<last.length;++i$1){var span$1=last[i$1]
if(span$1.to!=null){span$1.to+=offset}
if(span$1.from==null){var found$1=getMarkedSpanFor(first,span$1.marker)
if(!found$1){span$1.from=offset
if(sameLine){(first||(first=[])).push(span$1)}}}else{span$1.from+=offset
if(sameLine){(first||(first=[])).push(span$1)}}}} 
if(first){first=clearEmptySpans(first)}
if(last&&last!=first){last=clearEmptySpans(last)}
var newMarkers=[first]
if(!sameLine){ var gap=change.text.length-2,gapMarkers
if(gap>0&&first)
{for(var i$2=0;i$2<first.length;++i$2)
{if(first[i$2].to==null)
{(gapMarkers||(gapMarkers=[])).push(new MarkedSpan(first[i$2].marker,null,null))}}}
for(var i$3=0;i$3<gap;++i$3)
{newMarkers.push(gapMarkers)}
newMarkers.push(last)}
return newMarkers}

function clearEmptySpans(spans){for(var i=0;i<spans.length;++i){var span=spans[i]
if(span.from!=null&&span.from==span.to&&span.marker.clearWhenEmpty!==false)
{spans.splice(i--,1)}}
if(!spans.length){return null}
return spans}
function removeReadOnlyRanges(doc,from,to){var markers=null
doc.iter(from.line,to.line+1,function(line){if(line.markedSpans){for(var i=0;i<line.markedSpans.length;++i){var mark=line.markedSpans[i].marker
if(mark.readOnly&&(!markers||indexOf(markers,mark)==-1))
{(markers||(markers=[])).push(mark)}}}})
if(!markers){return null}
var parts=[{from:from,to:to}]
for(var i=0;i<markers.length;++i){var mk=markers[i],m=mk.find(0)
for(var j=0;j<parts.length;++j){var p=parts[j]
if(cmp(p.to,m.from)<0||cmp(p.from,m.to)>0){continue}
var newParts=[j,1],dfrom=cmp(p.from,m.from),dto=cmp(p.to,m.to)
if(dfrom<0||!mk.inclusiveLeft&&!dfrom)
{newParts.push({from:p.from,to:m.from})}
if(dto>0||!mk.inclusiveRight&&!dto)
{newParts.push({from:m.to,to:p.to})}
parts.splice.apply(parts,newParts)
j+=newParts.length-1}}
return parts}
function detachMarkedSpans(line){var spans=line.markedSpans
if(!spans){return}
for(var i=0;i<spans.length;++i)
{spans[i].marker.detachLine(line)}
line.markedSpans=null}
function attachMarkedSpans(line,spans){if(!spans){return}
for(var i=0;i<spans.length;++i)
{spans[i].marker.attachLine(line)}
line.markedSpans=spans}

function extraLeft(marker){return marker.inclusiveLeft?-1:0}
function extraRight(marker){return marker.inclusiveRight?1:0}


function compareCollapsedMarkers(a,b){var lenDiff=a.lines.length-b.lines.length
if(lenDiff!=0){return lenDiff}
var aPos=a.find(),bPos=b.find()
var fromCmp=cmp(aPos.from,bPos.from)||extraLeft(a)-extraLeft(b)
if(fromCmp){return-fromCmp}
var toCmp=cmp(aPos.to,bPos.to)||extraRight(a)-extraRight(b)
if(toCmp){return toCmp}
return b.id-a.id}

function collapsedSpanAtSide(line,start){var sps=sawCollapsedSpans&&line.markedSpans,found
if(sps){for(var sp=(void 0),i=0;i<sps.length;++i){sp=sps[i]
if(sp.marker.collapsed&&(start?sp.from:sp.to)==null&&(!found||compareCollapsedMarkers(found,sp.marker)<0))
{found=sp.marker}}}
return found}
function collapsedSpanAtStart(line){return collapsedSpanAtSide(line,true)}
function collapsedSpanAtEnd(line){return collapsedSpanAtSide(line,false)}

function conflictingCollapsedRange(doc,lineNo,from,to,marker){var line=getLine(doc,lineNo)
var sps=sawCollapsedSpans&&line.markedSpans
if(sps){for(var i=0;i<sps.length;++i){var sp=sps[i]
if(!sp.marker.collapsed){continue}
var found=sp.marker.find(0)
var fromCmp=cmp(found.from,from)||extraLeft(sp.marker)-extraLeft(marker)
var toCmp=cmp(found.to,to)||extraRight(sp.marker)-extraRight(marker)
if(fromCmp>=0&&toCmp<=0||fromCmp<=0&&toCmp>=0){continue}
if(fromCmp<=0&&(sp.marker.inclusiveRight&&marker.inclusiveLeft?cmp(found.to,from)>=0:cmp(found.to,from)>0)||fromCmp>=0&&(sp.marker.inclusiveRight&&marker.inclusiveLeft?cmp(found.from,to)<=0:cmp(found.from,to)<0))
{return true}}}}



function visualLine(line){var merged
while(merged=collapsedSpanAtStart(line))
{line=merged.find(-1,true).line}
return line}

function visualLineContinued(line){var merged,lines
while(merged=collapsedSpanAtEnd(line)){line=merged.find(1,true).line;(lines||(lines=[])).push(line)}
return lines}

function visualLineNo(doc,lineN){var line=getLine(doc,lineN),vis=visualLine(line)
if(line==vis){return lineN}
return lineNo(vis)}

function visualLineEndNo(doc,lineN){if(lineN>doc.lastLine()){return lineN}
var line=getLine(doc,lineN),merged
if(!lineIsHidden(doc,line)){return lineN}
while(merged=collapsedSpanAtEnd(line))
{line=merged.find(1,true).line}
return lineNo(line)+1}


function lineIsHidden(doc,line){var sps=sawCollapsedSpans&&line.markedSpans
if(sps){for(var sp=(void 0),i=0;i<sps.length;++i){sp=sps[i]
if(!sp.marker.collapsed){continue}
if(sp.from==null){return true}
if(sp.marker.widgetNode){continue}
if(sp.from==0&&sp.marker.inclusiveLeft&&lineIsHiddenInner(doc,line,sp))
{return true}}}}
function lineIsHiddenInner(doc,line,span){if(span.to==null){var end=span.marker.find(1,true)
return lineIsHiddenInner(doc,end.line,getMarkedSpanFor(end.line.markedSpans,span.marker))}
if(span.marker.inclusiveRight&&span.to==line.text.length)
{return true}
for(var sp=(void 0),i=0;i<line.markedSpans.length;++i){sp=line.markedSpans[i]
if(sp.marker.collapsed&&!sp.marker.widgetNode&&sp.from==span.to&&(sp.to==null||sp.to!=span.from)&&(sp.marker.inclusiveLeft||span.marker.inclusiveRight)&&lineIsHiddenInner(doc,line,sp)){return true}}}
function heightAtLine(lineObj){lineObj=visualLine(lineObj)
var h=0,chunk=lineObj.parent
for(var i=0;i<chunk.lines.length;++i){var line=chunk.lines[i]
if(line==lineObj){break}
else{h+=line.height}}
for(var p=chunk.parent;p;chunk=p,p=chunk.parent){for(var i$1=0;i$1<p.children.length;++i$1){var cur=p.children[i$1]
if(cur==chunk){break}
else{h+=cur.height}}}
return h}


function lineLength(line){if(line.height==0){return 0}
var len=line.text.length,merged,cur=line
while(merged=collapsedSpanAtStart(cur)){var found=merged.find(0,true)
cur=found.from.line
len+=found.from.ch-found.to.ch}
cur=line
while(merged=collapsedSpanAtEnd(cur)){var found$1=merged.find(0,true)
len-=cur.text.length-found$1.from.ch
cur=found$1.to.line
len+=cur.text.length-found$1.to.ch}
return len}
function findMaxLine(cm){var d=cm.display,doc=cm.doc
d.maxLine=getLine(doc,doc.first)
d.maxLineLength=lineLength(d.maxLine)
d.maxLineChanged=true
doc.iter(function(line){var len=lineLength(line)
if(len>d.maxLineLength){d.maxLineLength=len
d.maxLine=line}})}
function iterateBidiSections(order,from,to,f){if(!order){return f(from,to,"ltr")}
var found=false
for(var i=0;i<order.length;++i){var part=order[i]
if(part.from<to&&part.to>from||from==to&&part.to==from){f(Math.max(part.from,from),Math.min(part.to,to),part.level==1?"rtl":"ltr")
found=true}}
if(!found){f(from,to,"ltr")}}
function bidiLeft(part){return part.level%2?part.to:part.from}
function bidiRight(part){return part.level%2?part.from:part.to}
function lineLeft(line){var order=getOrder(line);return order?bidiLeft(order[0]):0}
function lineRight(line){var order=getOrder(line)
if(!order){return line.text.length}
return bidiRight(lst(order))}
function compareBidiLevel(order,a,b){var linedir=order[0].level
if(a==linedir){return true}
if(b==linedir){return false}
return a<b}
var bidiOther=null
function getBidiPartAt(order,pos){var found
bidiOther=null
for(var i=0;i<order.length;++i){var cur=order[i]
if(cur.from<pos&&cur.to>pos){return i}
if((cur.from==pos||cur.to==pos)){if(found==null){found=i}else if(compareBidiLevel(order,cur.level,order[found].level)){if(cur.from!=cur.to){bidiOther=found}
return i}else{if(cur.from!=cur.to){bidiOther=i}
return found}}}
return found}
function moveInLine(line,pos,dir,byUnit){if(!byUnit){return pos+dir}
do{pos+=dir}
while(pos>0&&isExtendingChar(line.text.charAt(pos)))
return pos}




function moveVisually(line,start,dir,byUnit){var bidi=getOrder(line)
if(!bidi){return moveLogically(line,start,dir,byUnit)}
var pos=getBidiPartAt(bidi,start),part=bidi[pos]
var target=moveInLine(line,start,part.level%2?-dir:dir,byUnit)
for(;;){if(target>part.from&&target<part.to){return target}
if(target==part.from||target==part.to){if(getBidiPartAt(bidi,target)==pos){return target}
part=bidi[pos+=dir]
return(dir>0)==part.level%2?part.to:part.from}else{part=bidi[pos+=dir]
if(!part){return null}
if((dir>0)==part.level%2)
{target=moveInLine(line,part.to,-1,byUnit)}
else
{target=moveInLine(line,part.from,1,byUnit)}}}}
function moveLogically(line,start,dir,byUnit){var target=start+dir
if(byUnit){while(target>0&&isExtendingChar(line.text.charAt(target))){target+=dir}}
return target<0||target>line.text.length?null:target}

















var bidiOrdering=(function(){ var lowTypes="bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN" 
var arabicTypes="nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111"
function charType(code){if(code<=0xf7){return lowTypes.charAt(code)}
else if(0x590<=code&&code<=0x5f4){return"R"}
else if(0x600<=code&&code<=0x6f9){return arabicTypes.charAt(code-0x600)}
else if(0x6ee<=code&&code<=0x8ac){return"r"}
else if(0x2000<=code&&code<=0x200b){return"w"}
else if(code==0x200c){return"b"}
else{return"L"}}
var bidiRE=/[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;var isNeutral=/[stwN]/,isStrong=/[LRr]/,countsAsLeft=/[Lb1n]/,countsAsNum=/[1n]/;var outerType="L"
function BidiSpan(level,from,to){this.level=level
this.from=from;this.to=to}
return function(str){if(!bidiRE.test(str)){return false}
var len=str.length,types=[]
for(var i=0;i<len;++i)
{types.push(charType(str.charCodeAt(i)))}



for(var i$1=0,prev=outerType;i$1<len;++i$1){var type=types[i$1]
if(type=="m"){types[i$1]=prev}
else{prev=type}}



for(var i$2=0,cur=outerType;i$2<len;++i$2){var type$1=types[i$2]
if(type$1=="1"&&cur=="r"){types[i$2]="n"}
else if(isStrong.test(type$1)){cur=type$1;if(type$1=="r"){types[i$2]="R"}}}


for(var i$3=1,prev$1=types[0];i$3<len-1;++i$3){var type$2=types[i$3]
if(type$2=="+"&&prev$1=="1"&&types[i$3+1]=="1"){types[i$3]="1"}
else if(type$2==","&&prev$1==types[i$3+1]&&(prev$1=="1"||prev$1=="n")){types[i$3]=prev$1}
prev$1=type$2}


for(var i$4=0;i$4<len;++i$4){var type$3=types[i$4]
if(type$3==","){types[i$4]="N"}
else if(type$3=="%"){var end=(void 0)
for(end=i$4+1;end<len&&types[end]=="%";++end){}
var replace=(i$4&&types[i$4-1]=="!")||(end<len&&types[end]=="1")?"1":"N"
for(var j=i$4;j<end;++j){types[j]=replace}
i$4=end-1}}


for(var i$5=0,cur$1=outerType;i$5<len;++i$5){var type$4=types[i$5]
if(cur$1=="L"&&type$4=="1"){types[i$5]="L"}
else if(isStrong.test(type$4)){cur$1=type$4}}



for(var i$6=0;i$6<len;++i$6){if(isNeutral.test(types[i$6])){var end$1=(void 0)
for(end$1=i$6+1;end$1<len&&isNeutral.test(types[end$1]);++end$1){}
var before=(i$6?types[i$6-1]:outerType)=="L"
var after=(end$1<len?types[end$1]:outerType)=="L"
var replace$1=before||after?"L":"R"
for(var j$1=i$6;j$1<end$1;++j$1){types[j$1]=replace$1}
i$6=end$1-1}}




var order=[],m
for(var i$7=0;i$7<len;){if(countsAsLeft.test(types[i$7])){var start=i$7
for(++i$7;i$7<len&&countsAsLeft.test(types[i$7]);++i$7){}
order.push(new BidiSpan(0,start,i$7))}else{var pos=i$7,at=order.length
for(++i$7;i$7<len&&types[i$7]!="L";++i$7){}
for(var j$2=pos;j$2<i$7;){if(countsAsNum.test(types[j$2])){if(pos<j$2){order.splice(at,0,new BidiSpan(1,pos,j$2))}
var nstart=j$2
for(++j$2;j$2<i$7&&countsAsNum.test(types[j$2]);++j$2){}
order.splice(at,0,new BidiSpan(2,nstart,j$2))
pos=j$2}else{++j$2}}
if(pos<i$7){order.splice(at,0,new BidiSpan(1,pos,i$7))}}}
if(order[0].level==1&&(m=str.match(/^\s+/))){order[0].from=m[0].length
order.unshift(new BidiSpan(0,0,m[0].length))}
if(lst(order).level==1&&(m=str.match(/\s+$/))){lst(order).to-=m[0].length
order.push(new BidiSpan(0,len-m[0].length,len))}
if(order[0].level==2)
{order.unshift(new BidiSpan(1,order[0].to,order[0].to))}
if(order[0].level!=lst(order).level)
{order.push(new BidiSpan(order[0].level,len,len))}
return order}})()


function getOrder(line){var order=line.order
if(order==null){order=line.order=bidiOrdering(line.text)}
return order}

var noHandlers=[]
var on=function(emitter,type,f){if(emitter.addEventListener){emitter.addEventListener(type,f,false)}else if(emitter.attachEvent){emitter.attachEvent("on"+type,f)}else{var map=emitter._handlers||(emitter._handlers={})
map[type]=(map[type]||noHandlers).concat(f)}}
function getHandlers(emitter,type){return emitter._handlers&&emitter._handlers[type]||noHandlers}
function off(emitter,type,f){if(emitter.removeEventListener){emitter.removeEventListener(type,f,false)}else if(emitter.detachEvent){emitter.detachEvent("on"+type,f)}else{var map=emitter._handlers,arr=map&&map[type]
if(arr){var index=indexOf(arr,f)
if(index>-1)
{map[type]=arr.slice(0,index).concat(arr.slice(index+1))}}}}
function signal(emitter,type){var handlers=getHandlers(emitter,type)
if(!handlers.length){return}
var args=Array.prototype.slice.call(arguments,2)
for(var i=0;i<handlers.length;++i){handlers[i].apply(null,args)}}

function signalDOMEvent(cm,e,override){if(typeof e=="string")
{e={type:e,preventDefault:function(){this.defaultPrevented=true}}}
signal(cm,override||e.type,cm,e)
return e_defaultPrevented(e)||e.codemirrorIgnore}
function signalCursorActivity(cm){var arr=cm._handlers&&cm._handlers.cursorActivity
if(!arr){return}
var set=cm.curOp.cursorActivityHandlers||(cm.curOp.cursorActivityHandlers=[])
for(var i=0;i<arr.length;++i){if(indexOf(set,arr[i])==-1)
{set.push(arr[i])}}}
function hasHandler(emitter,type){return getHandlers(emitter,type).length>0}

function eventMixin(ctor){ctor.prototype.on=function(type,f){on(this,type,f)}
ctor.prototype.off=function(type,f){off(this,type,f)}}

function e_preventDefault(e){if(e.preventDefault){e.preventDefault()}
else{e.returnValue=false}}
function e_stopPropagation(e){if(e.stopPropagation){e.stopPropagation()}
else{e.cancelBubble=true}}
function e_defaultPrevented(e){return e.defaultPrevented!=null?e.defaultPrevented:e.returnValue==false}
function e_stop(e){e_preventDefault(e);e_stopPropagation(e)}
function e_target(e){return e.target||e.srcElement}
function e_button(e){var b=e.which
if(b==null){if(e.button&1){b=1}
else if(e.button&2){b=3}
else if(e.button&4){b=2}}
if(mac&&e.ctrlKey&&b==1){b=3}
return b}
var dragAndDrop=function(){
if(ie&&ie_version<9){return false}
var div=elt('div')
return"draggable"in div||"dragDrop"in div}()
var zwspSupported
function zeroWidthElement(measure){if(zwspSupported==null){var test=elt("span","\u200b")
removeChildrenAndAdd(measure,elt("span",[test,document.createTextNode("x")]))
if(measure.firstChild.offsetHeight!=0)
{zwspSupported=test.offsetWidth<=1&&test.offsetHeight>2&&!(ie&&ie_version<8)}}
var node=zwspSupported?elt("span","\u200b"):elt("span","\u00a0",null,"display: inline-block; width: 1px; margin-right: -1px")
node.setAttribute("cm-text","")
return node}
var badBidiRects
function hasBadBidiRects(measure){if(badBidiRects!=null){return badBidiRects}
var txt=removeChildrenAndAdd(measure,document.createTextNode("A\u062eA"))
var r0=range(txt,0,1).getBoundingClientRect()
var r1=range(txt,1,2).getBoundingClientRect()
removeChildren(measure)
if(!r0||r0.left==r0.right){return false}
return badBidiRects=(r1.right-r0.right<3)}

var splitLinesAuto="\n\nb".split(/\n/).length!=3?function(string){var pos=0,result=[],l=string.length
while(pos<=l){var nl=string.indexOf("\n",pos)
if(nl==-1){nl=string.length}
var line=string.slice(pos,string.charAt(nl-1)=="\r"?nl-1:nl)
var rt=line.indexOf("\r")
if(rt!=-1){result.push(line.slice(0,rt))
pos+=rt+1}else{result.push(line)
pos=nl+1}}
return result}:function(string){return string.split(/\r\n?|\n/);}
var hasSelection=window.getSelection?function(te){try{return te.selectionStart!=te.selectionEnd}
catch(e){return false}}:function(te){var range
try{range=te.ownerDocument.selection.createRange()}
catch(e){}
if(!range||range.parentElement()!=te){return false}
return range.compareEndPoints("StartToEnd",range)!=0}
var hasCopyEvent=(function(){var e=elt("div")
if("oncopy"in e){return true}
e.setAttribute("oncopy","return;")
return typeof e.oncopy=="function"})()
var badZoomedRects=null
function hasBadZoomedRects(measure){if(badZoomedRects!=null){return badZoomedRects}
var node=removeChildrenAndAdd(measure,elt("span","x"))
var normal=node.getBoundingClientRect()
var fromRange=range(node,0,1).getBoundingClientRect()
return badZoomedRects=Math.abs(normal.left-fromRange.left)>1}
var modes={};var mimeModes={};

function defineMode(name,mode){if(arguments.length>2)
{mode.dependencies=Array.prototype.slice.call(arguments,2)}
modes[name]=mode}
function defineMIME(mime,spec){mimeModes[mime]=spec}

function resolveMode(spec){if(typeof spec=="string"&&mimeModes.hasOwnProperty(spec)){spec=mimeModes[spec]}else if(spec&&typeof spec.name=="string"&&mimeModes.hasOwnProperty(spec.name)){var found=mimeModes[spec.name]
if(typeof found=="string"){found={name:found}}
spec=createObj(found,spec)
spec.name=found.name}else if(typeof spec=="string"&&/^[\w\-]+\/[\w\-]+\+xml$/.test(spec)){return resolveMode("application/xml")}else if(typeof spec=="string"&&/^[\w\-]+\/[\w\-]+\+json$/.test(spec)){return resolveMode("application/json")}
if(typeof spec=="string"){return{name:spec}}
else{return spec||{name:"null"}}}

function getMode(options,spec){spec=resolveMode(spec)
var mfactory=modes[spec.name]
if(!mfactory){return getMode(options,"text/plain")}
var modeObj=mfactory(options,spec)
if(modeExtensions.hasOwnProperty(spec.name)){var exts=modeExtensions[spec.name]
for(var prop in exts){if(!exts.hasOwnProperty(prop)){continue}
if(modeObj.hasOwnProperty(prop)){modeObj["_"+prop]=modeObj[prop]}
modeObj[prop]=exts[prop]}}
modeObj.name=spec.name
if(spec.helperType){modeObj.helperType=spec.helperType}
if(spec.modeProps){for(var prop$1 in spec.modeProps)
{modeObj[prop$1]=spec.modeProps[prop$1]}}
return modeObj}

var modeExtensions={}
function extendMode(mode,properties){var exts=modeExtensions.hasOwnProperty(mode)?modeExtensions[mode]:(modeExtensions[mode]={})
copyObj(properties,exts)}
function copyState(mode,state){if(state===true){return state}
if(mode.copyState){return mode.copyState(state)}
var nstate={}
for(var n in state){var val=state[n]
if(val instanceof Array){val=val.concat([])}
nstate[n]=val}
return nstate}

function innerMode(mode,state){var info
while(mode.innerMode){info=mode.innerMode(state)
if(!info||info.mode==mode){break}
state=info.state
mode=info.mode}
return info||{mode:mode,state:state}}
function startState(mode,a1,a2){return mode.startState?mode.startState(a1,a2):true}


var StringStream=function(string,tabSize){this.pos=this.start=0
this.string=string
this.tabSize=tabSize||8
this.lastColumnPos=this.lastColumnValue=0
this.lineStart=0}
StringStream.prototype={eol:function(){return this.pos>=this.string.length},sol:function(){return this.pos==this.lineStart},peek:function(){return this.string.charAt(this.pos)||undefined},next:function(){if(this.pos<this.string.length)
{return this.string.charAt(this.pos++)}},eat:function(match){var ch=this.string.charAt(this.pos)
var ok
if(typeof match=="string"){ok=ch==match}
else{ok=ch&&(match.test?match.test(ch):match(ch))}
if(ok){++this.pos;return ch}},eatWhile:function(match){var start=this.pos
while(this.eat(match)){}
return this.pos>start},eatSpace:function(){var this$1=this;var start=this.pos
while(/[\s\u00a0]/.test(this.string.charAt(this.pos))){++this$1.pos}
return this.pos>start},skipToEnd:function(){this.pos=this.string.length},skipTo:function(ch){var found=this.string.indexOf(ch,this.pos)
if(found>-1){this.pos=found;return true}},backUp:function(n){this.pos-=n},column:function(){if(this.lastColumnPos<this.start){this.lastColumnValue=countColumn(this.string,this.start,this.tabSize,this.lastColumnPos,this.lastColumnValue)
this.lastColumnPos=this.start}
return this.lastColumnValue-(this.lineStart?countColumn(this.string,this.lineStart,this.tabSize):0)},indentation:function(){return countColumn(this.string,null,this.tabSize)-
(this.lineStart?countColumn(this.string,this.lineStart,this.tabSize):0)},match:function(pattern,consume,caseInsensitive){if(typeof pattern=="string"){var cased=function(str){return caseInsensitive?str.toLowerCase():str;}
var substr=this.string.substr(this.pos,pattern.length)
if(cased(substr)==cased(pattern)){if(consume!==false){this.pos+=pattern.length}
return true}}else{var match=this.string.slice(this.pos).match(pattern)
if(match&&match.index>0){return null}
if(match&&consume!==false){this.pos+=match[0].length}
return match}},current:function(){return this.string.slice(this.start,this.pos)},hideFirstChars:function(n,inner){this.lineStart+=n
try{return inner()}
finally{this.lineStart-=n}}}



function highlightLine(cm,line,state,forceToEnd){
var st=[cm.state.modeGen],lineClasses={} 
runMode(cm,line.text,cm.doc.mode,state,function(end,style){return st.push(end,style);},lineClasses,forceToEnd)
var loop=function(o){var overlay=cm.state.overlays[o],i=1,at=0
runMode(cm,line.text,overlay.mode,true,function(end,style){var start=i
 
while(at<end){var i_end=st[i]
if(i_end>end)
{st.splice(i,1,end,st[i+1],i_end)}
i+=2
at=Math.min(end,i_end)}
if(!style){return}
if(overlay.opaque){st.splice(start,i-start,end,"overlay "+style)
i=start+2}else{for(;start<i;start+=2){var cur=st[start+1]
st[start+1]=(cur?cur+" ":"")+"overlay "+style}}},lineClasses)};for(var o=0;o<cm.state.overlays.length;++o)loop(o);return{styles:st,classes:lineClasses.bgClass||lineClasses.textClass?lineClasses:null}}
function getLineStyles(cm,line,updateFrontier){if(!line.styles||line.styles[0]!=cm.state.modeGen){var state=getStateBefore(cm,lineNo(line))
var result=highlightLine(cm,line,line.text.length>cm.options.maxHighlightLength?copyState(cm.doc.mode,state):state)
line.stateAfter=state
line.styles=result.styles
if(result.classes){line.styleClasses=result.classes}
else if(line.styleClasses){line.styleClasses=null}
if(updateFrontier===cm.doc.frontier){cm.doc.frontier++}}
return line.styles}
function getStateBefore(cm,n,precise){var doc=cm.doc,display=cm.display
if(!doc.mode.startState){return true}
var pos=findStartLine(cm,n,precise),state=pos>doc.first&&getLine(doc,pos-1).stateAfter
if(!state){state=startState(doc.mode)}
else{state=copyState(doc.mode,state)}
doc.iter(pos,n,function(line){processLine(cm,line.text,state)
var save=pos==n-1||pos%5==0||pos>=display.viewFrom&&pos<display.viewTo
line.stateAfter=save?copyState(doc.mode,state):null
++pos})
if(precise){doc.frontier=pos}
return state}


function processLine(cm,text,state,startAt){var mode=cm.doc.mode
var stream=new StringStream(text,cm.options.tabSize)
stream.start=stream.pos=startAt||0
if(text==""){callBlankLine(mode,state)}
while(!stream.eol()){readToken(mode,stream,state)
stream.start=stream.pos}}
function callBlankLine(mode,state){if(mode.blankLine){return mode.blankLine(state)}
if(!mode.innerMode){return}
var inner=innerMode(mode,state)
if(inner.mode.blankLine){return inner.mode.blankLine(inner.state)}}
function readToken(mode,stream,state,inner){for(var i=0;i<10;i++){if(inner){inner[0]=innerMode(mode,state).mode}
var style=mode.token(stream,state)
if(stream.pos>stream.start){return style}}
throw new Error("Mode "+mode.name+" failed to advance stream.")}
function takeToken(cm,pos,precise,asArray){var getObj=function(copy){return({start:stream.start,end:stream.pos,string:stream.current(),type:style||null,state:copy?copyState(doc.mode,state):state});}
var doc=cm.doc,mode=doc.mode,style
pos=clipPos(doc,pos)
var line=getLine(doc,pos.line),state=getStateBefore(cm,pos.line,precise)
var stream=new StringStream(line.text,cm.options.tabSize),tokens
if(asArray){tokens=[]}
while((asArray||stream.pos<pos.ch)&&!stream.eol()){stream.start=stream.pos
style=readToken(mode,stream,state)
if(asArray){tokens.push(getObj(true))}}
return asArray?tokens:getObj()}
function extractLineClasses(type,output){if(type){for(;;){var lineClass=type.match(/(?:^|\s+)line-(background-)?(\S+)/)
if(!lineClass){break}
type=type.slice(0,lineClass.index)+type.slice(lineClass.index+lineClass[0].length)
var prop=lineClass[1]?"bgClass":"textClass"
if(output[prop]==null)
{output[prop]=lineClass[2]}
else if(!(new RegExp("(?:^|\s)"+lineClass[2]+"(?:$|\s)")).test(output[prop]))
{output[prop]+=" "+lineClass[2]}}}
return type}
function runMode(cm,text,mode,state,f,lineClasses,forceToEnd){var flattenSpans=mode.flattenSpans
if(flattenSpans==null){flattenSpans=cm.options.flattenSpans}
var curStart=0,curStyle=null
var stream=new StringStream(text,cm.options.tabSize),style
var inner=cm.options.addModeClass&&[null]
if(text==""){extractLineClasses(callBlankLine(mode,state),lineClasses)}
while(!stream.eol()){if(stream.pos>cm.options.maxHighlightLength){flattenSpans=false
if(forceToEnd){processLine(cm,text,state,stream.pos)}
stream.pos=text.length
style=null}else{style=extractLineClasses(readToken(mode,stream,state,inner),lineClasses)}
if(inner){var mName=inner[0].name
if(mName){style="m-"+(style?mName+" "+style:mName)}}
if(!flattenSpans||curStyle!=style){while(curStart<stream.start){curStart=Math.min(stream.start,curStart+5000)
f(curStart,curStyle)}
curStyle=style}
stream.start=stream.pos}
while(curStart<stream.pos){

var pos=Math.min(stream.pos,curStart+5000)
f(pos,curStyle)
curStart=pos}}




function findStartLine(cm,n,precise){var minindent,minline,doc=cm.doc
var lim=precise?-1:n-(cm.doc.mode.innerMode?1000:100)
for(var search=n;search>lim;--search){if(search<=doc.first){return doc.first}
var line=getLine(doc,search-1)
if(line.stateAfter&&(!precise||search<=doc.frontier)){return search}
var indented=countColumn(line.text,null,cm.options.tabSize)
if(minline==null||minindent>indented){minline=search-1
minindent=indented}}
return minline}


function Line(text,markedSpans,estimateHeight){this.text=text
attachMarkedSpans(this,markedSpans)
this.height=estimateHeight?estimateHeight(this):1}
eventMixin(Line)
Line.prototype.lineNo=function(){return lineNo(this)}


function updateLine(line,text,markedSpans,estimateHeight){line.text=text
if(line.stateAfter){line.stateAfter=null}
if(line.styles){line.styles=null}
if(line.order!=null){line.order=null}
detachMarkedSpans(line)
attachMarkedSpans(line,markedSpans)
var estHeight=estimateHeight?estimateHeight(line):1
if(estHeight!=line.height){updateLineHeight(line,estHeight)}}
function cleanUpLine(line){line.parent=null
detachMarkedSpans(line)}

var styleToClassCache={};var styleToClassCacheWithMode={};function interpretTokenStyle(style,options){if(!style||/^\s*$/.test(style)){return null}
var cache=options.addModeClass?styleToClassCacheWithMode:styleToClassCache
return cache[style]||(cache[style]=style.replace(/\S+/g,"cm-$&"))}



function buildLineContent(cm,lineView){

var content=elt("span",null,null,webkit?"padding-right: .1px":null)
var builder={pre:elt("pre",[content],"CodeMirror-line"),content:content,col:0,pos:0,cm:cm,trailingSpace:false,splitSpaces:(ie||webkit)&&cm.getOption("lineWrapping")}
lineView.measure={}
for(var i=0;i<=(lineView.rest?lineView.rest.length:0);i++){var line=i?lineView.rest[i-1]:lineView.line,order=(void 0)
builder.pos=0
builder.addToken=buildToken


if(hasBadBidiRects(cm.display.measure)&&(order=getOrder(line)))
{builder.addToken=buildTokenBadBidi(builder.addToken,order)}
builder.map=[]
var allowFrontierUpdate=lineView!=cm.display.externalMeasured&&lineNo(line)
insertLineContent(line,builder,getLineStyles(cm,line,allowFrontierUpdate))
if(line.styleClasses){if(line.styleClasses.bgClass)
{builder.bgClass=joinClasses(line.styleClasses.bgClass,builder.bgClass||"")}
if(line.styleClasses.textClass)
{builder.textClass=joinClasses(line.styleClasses.textClass,builder.textClass||"")}}
if(builder.map.length==0)
{builder.map.push(0,0,builder.content.appendChild(zeroWidthElement(cm.display.measure)))} 
if(i==0){lineView.measure.map=builder.map
lineView.measure.cache={}}else{;(lineView.measure.maps||(lineView.measure.maps=[])).push(builder.map);(lineView.measure.caches||(lineView.measure.caches=[])).push({})}} 
if(webkit){var last=builder.content.lastChild
if(/\bcm-tab\b/.test(last.className)||(last.querySelector&&last.querySelector(".cm-tab")))
{builder.content.className="cm-tab-wrap-hack"}}
signal(cm,"renderLine",cm,lineView.line,builder.pre)
if(builder.pre.className)
{builder.textClass=joinClasses(builder.pre.className,builder.textClass||"")}
return builder}
function defaultSpecialCharPlaceholder(ch){var token=elt("span","\u2022","cm-invalidchar")
token.title="\\u"+ch.charCodeAt(0).toString(16)
token.setAttribute("aria-label",token.title)
return token}

function buildToken(builder,text,style,startStyle,endStyle,title,css){if(!text){return}
var displayText=builder.splitSpaces?splitSpaces(text,builder.trailingSpace):text
var special=builder.cm.state.specialChars,mustWrap=false
var content
if(!special.test(text)){builder.col+=text.length
content=document.createTextNode(displayText)
builder.map.push(builder.pos,builder.pos+text.length,content)
if(ie&&ie_version<9){mustWrap=true}
builder.pos+=text.length}else{content=document.createDocumentFragment()
var pos=0
while(true){special.lastIndex=pos
var m=special.exec(text)
var skipped=m?m.index-pos:text.length-pos
if(skipped){var txt=document.createTextNode(displayText.slice(pos,pos+skipped))
if(ie&&ie_version<9){content.appendChild(elt("span",[txt]))}
else{content.appendChild(txt)}
builder.map.push(builder.pos,builder.pos+skipped,txt)
builder.col+=skipped
builder.pos+=skipped}
if(!m){break}
pos+=skipped+1
var txt$1=(void 0)
if(m[0]=="\t"){var tabSize=builder.cm.options.tabSize,tabWidth=tabSize-builder.col%tabSize
txt$1=content.appendChild(elt("span",spaceStr(tabWidth),"cm-tab"))
txt$1.setAttribute("role","presentation")
txt$1.setAttribute("cm-text","\t")
builder.col+=tabWidth}else if(m[0]=="\r"||m[0]=="\n"){txt$1=content.appendChild(elt("span",m[0]=="\r"?"\u240d":"\u2424","cm-invalidchar"))
txt$1.setAttribute("cm-text",m[0])
builder.col+=1}else{txt$1=builder.cm.options.specialCharPlaceholder(m[0])
txt$1.setAttribute("cm-text",m[0])
if(ie&&ie_version<9){content.appendChild(elt("span",[txt$1]))}
else{content.appendChild(txt$1)}
builder.col+=1}
builder.map.push(builder.pos,builder.pos+1,txt$1)
builder.pos++}}
builder.trailingSpace=displayText.charCodeAt(text.length-1)==32
if(style||startStyle||endStyle||mustWrap||css){var fullStyle=style||""
if(startStyle){fullStyle+=startStyle}
if(endStyle){fullStyle+=endStyle}
var token=elt("span",[content],fullStyle,css)
if(title){token.title=title}
return builder.content.appendChild(token)}
builder.content.appendChild(content)}
function splitSpaces(text,trailingBefore){if(text.length>1&&!/  /.test(text)){return text}
var spaceBefore=trailingBefore,result=""
for(var i=0;i<text.length;i++){var ch=text.charAt(i)
if(ch==" "&&spaceBefore&&(i==text.length-1||text.charCodeAt(i+1)==32))
{ch="\u00a0"}
result+=ch
spaceBefore=ch==" "}
return result}

function buildTokenBadBidi(inner,order){return function(builder,text,style,startStyle,endStyle,title,css){style=style?style+" cm-force-border":"cm-force-border"
var start=builder.pos,end=start+text.length
for(;;){ var part=(void 0)
for(var i=0;i<order.length;i++){part=order[i]
if(part.to>start&&part.from<=start){break}}
if(part.to>=end){return inner(builder,text,style,startStyle,endStyle,title,css)}
inner(builder,text.slice(0,part.to-start),style,startStyle,null,title,css)
startStyle=null
text=text.slice(part.to-start)
start=part.to}}}
function buildCollapsedSpan(builder,size,marker,ignoreWidget){var widget=!ignoreWidget&&marker.widgetNode
if(widget){builder.map.push(builder.pos,builder.pos+size,widget)}
if(!ignoreWidget&&builder.cm.display.input.needsContentAttribute){if(!widget)
{widget=builder.content.appendChild(document.createElement("span"))}
widget.setAttribute("cm-marker",marker.id)}
if(widget){builder.cm.display.input.setUneditable(widget)
builder.content.appendChild(widget)}
builder.pos+=size
builder.trailingSpace=false}

function insertLineContent(line,builder,styles){var spans=line.markedSpans,allText=line.text,at=0
if(!spans){for(var i$1=1;i$1<styles.length;i$1+=2)
{builder.addToken(builder,allText.slice(at,at=styles[i$1]),interpretTokenStyle(styles[i$1+1],builder.cm.options))}
return}
var len=allText.length,pos=0,i=1,text="",style,css
var nextChange=0,spanStyle,spanEndStyle,spanStartStyle,title,collapsed
for(;;){if(nextChange==pos){ spanStyle=spanEndStyle=spanStartStyle=title=css=""
collapsed=null;nextChange=Infinity
var foundBookmarks=[],endStyles=(void 0)
for(var j=0;j<spans.length;++j){var sp=spans[j],m=sp.marker
if(m.type=="bookmark"&&sp.from==pos&&m.widgetNode){foundBookmarks.push(m)}else if(sp.from<=pos&&(sp.to==null||sp.to>pos||m.collapsed&&sp.to==pos&&sp.from==pos)){if(sp.to!=null&&sp.to!=pos&&nextChange>sp.to){nextChange=sp.to
spanEndStyle=""}
if(m.className){spanStyle+=" "+m.className}
if(m.css){css=(css?css+";":"")+m.css}
if(m.startStyle&&sp.from==pos){spanStartStyle+=" "+m.startStyle}
if(m.endStyle&&sp.to==nextChange){(endStyles||(endStyles=[])).push(m.endStyle,sp.to)}
if(m.title&&!title){title=m.title}
if(m.collapsed&&(!collapsed||compareCollapsedMarkers(collapsed.marker,m)<0))
{collapsed=sp}}else if(sp.from>pos&&nextChange>sp.from){nextChange=sp.from}}
if(endStyles){for(var j$1=0;j$1<endStyles.length;j$1+=2)
{if(endStyles[j$1+1]==nextChange){spanEndStyle+=" "+endStyles[j$1]}}}
if(!collapsed||collapsed.from==pos){for(var j$2=0;j$2<foundBookmarks.length;++j$2)
{buildCollapsedSpan(builder,0,foundBookmarks[j$2])}}
if(collapsed&&(collapsed.from||0)==pos){buildCollapsedSpan(builder,(collapsed.to==null?len+1:collapsed.to)-pos,collapsed.marker,collapsed.from==null)
if(collapsed.to==null){return}
if(collapsed.to==pos){collapsed=false}}}
if(pos>=len){break}
var upto=Math.min(len,nextChange)
while(true){if(text){var end=pos+text.length
if(!collapsed){var tokenText=end>upto?text.slice(0,upto-pos):text
builder.addToken(builder,tokenText,style?style+spanStyle:spanStyle,spanStartStyle,pos+tokenText.length==nextChange?spanEndStyle:"",title,css)}
if(end>=upto){text=text.slice(upto-pos);pos=upto;break}
pos=end
spanStartStyle=""}
text=allText.slice(at,at=styles[i++])
style=interpretTokenStyle(styles[i++],builder.cm.options)}}}

function LineView(doc,line,lineN){ this.line=line
 
this.rest=visualLineContinued(line) 
this.size=this.rest?lineNo(lst(this.rest))-lineN+1:1
this.node=this.text=null
this.hidden=lineIsHidden(doc,line)}
function buildViewArray(cm,from,to){var array=[],nextPos
for(var pos=from;pos<to;pos=nextPos){var view=new LineView(cm.doc,getLine(cm.doc,pos),pos)
nextPos=pos+view.size
array.push(view)}
return array}
var operationGroup=null
function pushOperation(op){if(operationGroup){operationGroup.ops.push(op)}else{op.ownsGroup=operationGroup={ops:[op],delayedCallbacks:[]}}}
function fireCallbacksForOps(group){
 var callbacks=group.delayedCallbacks,i=0
do{for(;i<callbacks.length;i++)
{callbacks[i].call(null)}
for(var j=0;j<group.ops.length;j++){var op=group.ops[j]
if(op.cursorActivityHandlers)
{while(op.cursorActivityCalled<op.cursorActivityHandlers.length)
{op.cursorActivityHandlers[op.cursorActivityCalled++].call(null,op.cm)}}}}while(i<callbacks.length)}
function finishOperation(op,endCb){var group=op.ownsGroup
if(!group){return}
try{fireCallbacksForOps(group)}
finally{operationGroup=null
endCb(group)}}
var orphanDelayedCallbacks=null






function signalLater(emitter,type){var arr=getHandlers(emitter,type)
if(!arr.length){return}
var args=Array.prototype.slice.call(arguments,2),list
if(operationGroup){list=operationGroup.delayedCallbacks}else if(orphanDelayedCallbacks){list=orphanDelayedCallbacks}else{list=orphanDelayedCallbacks=[]
setTimeout(fireOrphanDelayed,0)}
var loop=function(i){list.push(function(){return arr[i].apply(null,args);})};for(var i=0;i<arr.length;++i)
loop(i);}
function fireOrphanDelayed(){var delayed=orphanDelayedCallbacks
orphanDelayedCallbacks=null
for(var i=0;i<delayed.length;++i){delayed[i]()}}


function updateLineForChanges(cm,lineView,lineN,dims){for(var j=0;j<lineView.changes.length;j++){var type=lineView.changes[j]
if(type=="text"){updateLineText(cm,lineView)}
else if(type=="gutter"){updateLineGutter(cm,lineView,lineN,dims)}
else if(type=="class"){updateLineClasses(lineView)}
else if(type=="widget"){updateLineWidgets(cm,lineView,dims)}}
lineView.changes=null}

function ensureLineWrapped(lineView){if(lineView.node==lineView.text){lineView.node=elt("div",null,null,"position: relative")
if(lineView.text.parentNode)
{lineView.text.parentNode.replaceChild(lineView.node,lineView.text)}
lineView.node.appendChild(lineView.text)
if(ie&&ie_version<8){lineView.node.style.zIndex=2}}
return lineView.node}
function updateLineBackground(lineView){var cls=lineView.bgClass?lineView.bgClass+" "+(lineView.line.bgClass||""):lineView.line.bgClass
if(cls){cls+=" CodeMirror-linebackground"}
if(lineView.background){if(cls){lineView.background.className=cls}
else{lineView.background.parentNode.removeChild(lineView.background);lineView.background=null}}else if(cls){var wrap=ensureLineWrapped(lineView)
lineView.background=wrap.insertBefore(elt("div",null,cls),wrap.firstChild)}}

function getLineContent(cm,lineView){var ext=cm.display.externalMeasured
if(ext&&ext.line==lineView.line){cm.display.externalMeasured=null
lineView.measure=ext.measure
return ext.built}
return buildLineContent(cm,lineView)}


function updateLineText(cm,lineView){var cls=lineView.text.className
var built=getLineContent(cm,lineView)
if(lineView.text==lineView.node){lineView.node=built.pre}
lineView.text.parentNode.replaceChild(built.pre,lineView.text)
lineView.text=built.pre
if(built.bgClass!=lineView.bgClass||built.textClass!=lineView.textClass){lineView.bgClass=built.bgClass
lineView.textClass=built.textClass
updateLineClasses(lineView)}else if(cls){lineView.text.className=cls}}
function updateLineClasses(lineView){updateLineBackground(lineView)
if(lineView.line.wrapClass)
{ensureLineWrapped(lineView).className=lineView.line.wrapClass}
else if(lineView.node!=lineView.text)
{lineView.node.className=""}
var textClass=lineView.textClass?lineView.textClass+" "+(lineView.line.textClass||""):lineView.line.textClass
lineView.text.className=textClass||""}
function updateLineGutter(cm,lineView,lineN,dims){if(lineView.gutter){lineView.node.removeChild(lineView.gutter)
lineView.gutter=null}
if(lineView.gutterBackground){lineView.node.removeChild(lineView.gutterBackground)
lineView.gutterBackground=null}
if(lineView.line.gutterClass){var wrap=ensureLineWrapped(lineView)
lineView.gutterBackground=elt("div",null,"CodeMirror-gutter-background "+lineView.line.gutterClass,("left: "+(cm.options.fixedGutter?dims.fixedPos:-dims.gutterTotalWidth)+"px; width: "+(dims.gutterTotalWidth)+"px"))
wrap.insertBefore(lineView.gutterBackground,lineView.text)}
var markers=lineView.line.gutterMarkers
if(cm.options.lineNumbers||markers){var wrap$1=ensureLineWrapped(lineView)
var gutterWrap=lineView.gutter=elt("div",null,"CodeMirror-gutter-wrapper",("left: "+(cm.options.fixedGutter?dims.fixedPos:-dims.gutterTotalWidth)+"px"))
cm.display.input.setUneditable(gutterWrap)
wrap$1.insertBefore(gutterWrap,lineView.text)
if(lineView.line.gutterClass)
{gutterWrap.className+=" "+lineView.line.gutterClass}
if(cm.options.lineNumbers&&(!markers||!markers["CodeMirror-linenumbers"]))
{lineView.lineNumber=gutterWrap.appendChild(elt("div",lineNumberFor(cm.options,lineN),"CodeMirror-linenumber CodeMirror-gutter-elt",("left: "+(dims.gutterLeft["CodeMirror-linenumbers"])+"px; width: "+(cm.display.lineNumInnerWidth)+"px")))}
if(markers){for(var k=0;k<cm.options.gutters.length;++k){var id=cm.options.gutters[k],found=markers.hasOwnProperty(id)&&markers[id]
if(found)
{gutterWrap.appendChild(elt("div",[found],"CodeMirror-gutter-elt",("left: "+(dims.gutterLeft[id])+"px; width: "+(dims.gutterWidth[id])+"px")))}}}}}
function updateLineWidgets(cm,lineView,dims){if(lineView.alignable){lineView.alignable=null}
for(var node=lineView.node.firstChild,next=(void 0);node;node=next){next=node.nextSibling
if(node.className=="CodeMirror-linewidget")
{lineView.node.removeChild(node)}}
insertLineWidgets(cm,lineView,dims)}
function buildLineElement(cm,lineView,lineN,dims){var built=getLineContent(cm,lineView)
lineView.text=lineView.node=built.pre
if(built.bgClass){lineView.bgClass=built.bgClass}
if(built.textClass){lineView.textClass=built.textClass}
updateLineClasses(lineView)
updateLineGutter(cm,lineView,lineN,dims)
insertLineWidgets(cm,lineView,dims)
return lineView.node}

function insertLineWidgets(cm,lineView,dims){insertLineWidgetsFor(cm,lineView.line,lineView,dims,true)
if(lineView.rest){for(var i=0;i<lineView.rest.length;i++)
{insertLineWidgetsFor(cm,lineView.rest[i],lineView,dims,false)}}}
function insertLineWidgetsFor(cm,line,lineView,dims,allowAbove){if(!line.widgets){return}
var wrap=ensureLineWrapped(lineView)
for(var i=0,ws=line.widgets;i<ws.length;++i){var widget=ws[i],node=elt("div",[widget.node],"CodeMirror-linewidget")
if(!widget.handleMouseEvents){node.setAttribute("cm-ignore-events","true")}
positionLineWidget(widget,node,lineView,dims)
cm.display.input.setUneditable(node)
if(allowAbove&&widget.above)
{wrap.insertBefore(node,lineView.gutter||lineView.text)}
else
{wrap.appendChild(node)}
signalLater(widget,"redraw")}}
function positionLineWidget(widget,node,lineView,dims){if(widget.noHScroll){;(lineView.alignable||(lineView.alignable=[])).push(node)
var width=dims.wrapperWidth
node.style.left=dims.fixedPos+"px"
if(!widget.coverGutter){width-=dims.gutterTotalWidth
node.style.paddingLeft=dims.gutterTotalWidth+"px"}
node.style.width=width+"px"}
if(widget.coverGutter){node.style.zIndex=5
node.style.position="relative"
if(!widget.noHScroll){node.style.marginLeft=-dims.gutterTotalWidth+"px"}}}
function widgetHeight(widget){if(widget.height!=null){return widget.height}
var cm=widget.doc.cm
if(!cm){return 0}
if(!contains(document.body,widget.node)){var parentStyle="position: relative;"
if(widget.coverGutter)
{parentStyle+="margin-left: -"+cm.display.gutters.offsetWidth+"px;"}
if(widget.noHScroll)
{parentStyle+="width: "+cm.display.wrapper.clientWidth+"px;"}
removeChildrenAndAdd(cm.display.measure,elt("div",[widget.node],null,parentStyle))}
return widget.height=widget.node.parentNode.offsetHeight}
function eventInWidget(display,e){for(var n=e_target(e);n!=display.wrapper;n=n.parentNode){if(!n||(n.nodeType==1&&n.getAttribute("cm-ignore-events")=="true")||(n.parentNode==display.sizer&&n!=display.mover))
{return true}}}
function paddingTop(display){return display.lineSpace.offsetTop}
function paddingVert(display){return display.mover.offsetHeight-display.lineSpace.offsetHeight}
function paddingH(display){if(display.cachedPaddingH){return display.cachedPaddingH}
var e=removeChildrenAndAdd(display.measure,elt("pre","x"))
var style=window.getComputedStyle?window.getComputedStyle(e):e.currentStyle
var data={left:parseInt(style.paddingLeft),right:parseInt(style.paddingRight)}
if(!isNaN(data.left)&&!isNaN(data.right)){display.cachedPaddingH=data}
return data}
function scrollGap(cm){return scrollerGap-cm.display.nativeBarWidth}
function displayWidth(cm){return cm.display.scroller.clientWidth-scrollGap(cm)-cm.display.barWidth}
function displayHeight(cm){return cm.display.scroller.clientHeight-scrollGap(cm)-cm.display.barHeight}



function ensureLineHeights(cm,lineView,rect){var wrapping=cm.options.lineWrapping
var curWidth=wrapping&&displayWidth(cm)
if(!lineView.measure.heights||wrapping&&lineView.measure.width!=curWidth){var heights=lineView.measure.heights=[]
if(wrapping){lineView.measure.width=curWidth
var rects=lineView.text.firstChild.getClientRects()
for(var i=0;i<rects.length-1;i++){var cur=rects[i],next=rects[i+1]
if(Math.abs(cur.bottom-next.bottom)>2)
{heights.push((cur.bottom+next.top)/2-rect.top)}}}
heights.push(rect.bottom-rect.top)}}


function mapFromLineView(lineView,line,lineN){if(lineView.line==line)
{return{map:lineView.measure.map,cache:lineView.measure.cache}}
for(var i=0;i<lineView.rest.length;i++)
{if(lineView.rest[i]==line)
{return{map:lineView.measure.maps[i],cache:lineView.measure.caches[i]}}}
for(var i$1=0;i$1<lineView.rest.length;i$1++)
{if(lineNo(lineView.rest[i$1])>lineN)
{return{map:lineView.measure.maps[i$1],cache:lineView.measure.caches[i$1],before:true}}}}

function updateExternalMeasurement(cm,line){line=visualLine(line)
var lineN=lineNo(line)
var view=cm.display.externalMeasured=new LineView(cm.doc,line,lineN)
view.lineN=lineN
var built=view.built=buildLineContent(cm,view)
view.text=built.pre
removeChildrenAndAdd(cm.display.lineMeasure,built.pre)
return view}
function measureChar(cm,line,ch,bias){return measureCharPrepared(cm,prepareMeasureForLine(cm,line),ch,bias)}
function findViewForLine(cm,lineN){if(lineN>=cm.display.viewFrom&&lineN<cm.display.viewTo)
{return cm.display.view[findViewIndex(cm,lineN)]}
var ext=cm.display.externalMeasured
if(ext&&lineN>=ext.lineN&&lineN<ext.lineN+ext.size)
{return ext}}




function prepareMeasureForLine(cm,line){var lineN=lineNo(line)
var view=findViewForLine(cm,lineN)
if(view&&!view.text){view=null}else if(view&&view.changes){updateLineForChanges(cm,view,lineN,getDimensions(cm))
cm.curOp.forceUpdate=true}
if(!view)
{view=updateExternalMeasurement(cm,line)}
var info=mapFromLineView(view,line,lineN)
return{line:line,view:view,rect:null,map:info.map,cache:info.cache,before:info.before,hasHeights:false}}

function measureCharPrepared(cm,prepared,ch,bias,varHeight){if(prepared.before){ch=-1}
var key=ch+(bias||""),found
if(prepared.cache.hasOwnProperty(key)){found=prepared.cache[key]}else{if(!prepared.rect)
{prepared.rect=prepared.view.text.getBoundingClientRect()}
if(!prepared.hasHeights){ensureLineHeights(cm,prepared.view,prepared.rect)
prepared.hasHeights=true}
found=measureCharInner(cm,prepared,ch,bias)
if(!found.bogus){prepared.cache[key]=found}}
return{left:found.left,right:found.right,top:varHeight?found.rtop:found.top,bottom:varHeight?found.rbottom:found.bottom}}
var nullRect={left:0,right:0,top:0,bottom:0}
function nodeAndOffsetInLineMap(map,ch,bias){var node,start,end,collapse,mStart,mEnd

for(var i=0;i<map.length;i+=3){mStart=map[i]
mEnd=map[i+1]
if(ch<mStart){start=0;end=1
collapse="left"}else if(ch<mEnd){start=ch-mStart
end=start+1}else if(i==map.length-3||ch==mEnd&&map[i+3]>ch){end=mEnd-mStart
start=end-1
if(ch>=mEnd){collapse="right"}}
if(start!=null){node=map[i+2]
if(mStart==mEnd&&bias==(node.insertLeft?"left":"right"))
{collapse=bias}
if(bias=="left"&&start==0)
{while(i&&map[i-2]==map[i-3]&&map[i-1].insertLeft){node=map[(i-=3)+2]
collapse="left"}}
if(bias=="right"&&start==mEnd-mStart)
{while(i<map.length-3&&map[i+3]==map[i+4]&&!map[i+5].insertLeft){node=map[(i+=3)+2]
collapse="right"}}
break}}
return{node:node,start:start,end:end,collapse:collapse,coverStart:mStart,coverEnd:mEnd}}
function getUsefulRect(rects,bias){var rect=nullRect
if(bias=="left"){for(var i=0;i<rects.length;i++){if((rect=rects[i]).left!=rect.right){break}}}else{for(var i$1=rects.length-1;i$1>=0;i$1--){if((rect=rects[i$1]).left!=rect.right){break}}}
return rect}
function measureCharInner(cm,prepared,ch,bias){var place=nodeAndOffsetInLineMap(prepared.map,ch,bias)
var node=place.node,start=place.start,end=place.end,collapse=place.collapse
var rect
if(node.nodeType==3){for(var i$1=0;i$1<4;i$1++){ while(start&&isExtendingChar(prepared.line.text.charAt(place.coverStart+start))){--start}
while(place.coverStart+end<place.coverEnd&&isExtendingChar(prepared.line.text.charAt(place.coverStart+end))){++end}
if(ie&&ie_version<9&&start==0&&end==place.coverEnd-place.coverStart)
{rect=node.parentNode.getBoundingClientRect()}
else
{rect=getUsefulRect(range(node,start,end).getClientRects(),bias)}
if(rect.left||rect.right||start==0){break}
end=start
start=start-1
collapse="right"}
if(ie&&ie_version<11){rect=maybeUpdateRectForZooming(cm.display.measure,rect)}}else{if(start>0){collapse=bias="right"}
var rects
if(cm.options.lineWrapping&&(rects=node.getClientRects()).length>1)
{rect=rects[bias=="right"?rects.length-1:0]}
else
{rect=node.getBoundingClientRect()}}
if(ie&&ie_version<9&&!start&&(!rect||!rect.left&&!rect.right)){var rSpan=node.parentNode.getClientRects()[0]
if(rSpan)
{rect={left:rSpan.left,right:rSpan.left+charWidth(cm.display),top:rSpan.top,bottom:rSpan.bottom}}
else
{rect=nullRect}}
var rtop=rect.top-prepared.rect.top,rbot=rect.bottom-prepared.rect.top
var mid=(rtop+rbot)/2
var heights=prepared.view.measure.heights
var i=0
for(;i<heights.length-1;i++)
{if(mid<heights[i]){break}}
var top=i?heights[i-1]:0,bot=heights[i]
var result={left:(collapse=="right"?rect.right:rect.left)-prepared.rect.left,right:(collapse=="left"?rect.left:rect.right)-prepared.rect.left,top:top,bottom:bot}
if(!rect.left&&!rect.right){result.bogus=true}
if(!cm.options.singleCursorHeightPerLine){result.rtop=rtop;result.rbottom=rbot}
return result}

function maybeUpdateRectForZooming(measure,rect){if(!window.screen||screen.logicalXDPI==null||screen.logicalXDPI==screen.deviceXDPI||!hasBadZoomedRects(measure))
{return rect}
var scaleX=screen.logicalXDPI/screen.deviceXDPI
var scaleY=screen.logicalYDPI/screen.deviceYDPI
return{left:rect.left*scaleX,right:rect.right*scaleX,top:rect.top*scaleY,bottom:rect.bottom*scaleY}}
function clearLineMeasurementCacheFor(lineView){if(lineView.measure){lineView.measure.cache={}
lineView.measure.heights=null
if(lineView.rest){for(var i=0;i<lineView.rest.length;i++)
{lineView.measure.caches[i]={}}}}}
function clearLineMeasurementCache(cm){cm.display.externalMeasure=null
removeChildren(cm.display.lineMeasure)
for(var i=0;i<cm.display.view.length;i++)
{clearLineMeasurementCacheFor(cm.display.view[i])}}
function clearCaches(cm){clearLineMeasurementCache(cm)
cm.display.cachedCharWidth=cm.display.cachedTextHeight=cm.display.cachedPaddingH=null
if(!cm.options.lineWrapping){cm.display.maxLineChanged=true}
cm.display.lineNumChars=null}
function pageScrollX(){return window.pageXOffset||(document.documentElement||document.body).scrollLeft}
function pageScrollY(){return window.pageYOffset||(document.documentElement||document.body).scrollTop}


function intoCoordSystem(cm,lineObj,rect,context,includeWidgets){if(!includeWidgets&&lineObj.widgets){for(var i=0;i<lineObj.widgets.length;++i){if(lineObj.widgets[i].above){var size=widgetHeight(lineObj.widgets[i])
rect.top+=size;rect.bottom+=size}}}
if(context=="line"){return rect}
if(!context){context="local"}
var yOff=heightAtLine(lineObj)
if(context=="local"){yOff+=paddingTop(cm.display)}
else{yOff-=cm.display.viewOffset}
if(context=="page"||context=="window"){var lOff=cm.display.lineSpace.getBoundingClientRect()
yOff+=lOff.top+(context=="window"?0:pageScrollY())
var xOff=lOff.left+(context=="window"?0:pageScrollX())
rect.left+=xOff;rect.right+=xOff}
rect.top+=yOff;rect.bottom+=yOff
return rect}
function fromCoordSystem(cm,coords,context){if(context=="div"){return coords}
var left=coords.left,top=coords.top
 
if(context=="page"){left-=pageScrollX()
top-=pageScrollY()}else if(context=="local"||!context){var localBox=cm.display.sizer.getBoundingClientRect()
left+=localBox.left
top+=localBox.top}
var lineSpaceBox=cm.display.lineSpace.getBoundingClientRect()
return{left:left-lineSpaceBox.left,top:top-lineSpaceBox.top}}
function charCoords(cm,pos,context,lineObj,bias){if(!lineObj){lineObj=getLine(cm.doc,pos.line)}
return intoCoordSystem(cm,lineObj,measureChar(cm,lineObj,pos.ch,bias),context)}


function cursorCoords(cm,pos,context,lineObj,preparedMeasure,varHeight){lineObj=lineObj||getLine(cm.doc,pos.line)
if(!preparedMeasure){preparedMeasure=prepareMeasureForLine(cm,lineObj)}
function get(ch,right){var m=measureCharPrepared(cm,preparedMeasure,ch,right?"right":"left",varHeight)
if(right){m.left=m.right;}else{m.right=m.left}
return intoCoordSystem(cm,lineObj,m,context)}
function getBidi(ch,partPos){var part=order[partPos],right=part.level%2
if(ch==bidiLeft(part)&&partPos&&part.level<order[partPos-1].level){part=order[--partPos]
ch=bidiRight(part)-(part.level%2?0:1)
right=true}else if(ch==bidiRight(part)&&partPos<order.length-1&&part.level<order[partPos+1].level){part=order[++partPos]
ch=bidiLeft(part)-part.level%2
right=false}
if(right&&ch==part.to&&ch>part.from){return get(ch-1)}
return get(ch,right)}
var order=getOrder(lineObj),ch=pos.ch
if(!order){return get(ch)}
var partPos=getBidiPartAt(order,ch)
var val=getBidi(ch,partPos)
if(bidiOther!=null){val.other=getBidi(ch,bidiOther)}
return val}

function estimateCoords(cm,pos){var left=0
pos=clipPos(cm.doc,pos)
if(!cm.options.lineWrapping){left=charWidth(cm.display)*pos.ch}
var lineObj=getLine(cm.doc,pos.line)
var top=heightAtLine(lineObj)+paddingTop(cm.display)
return{left:left,right:left,top:top,bottom:top+lineObj.height}}




function PosWithInfo(line,ch,outside,xRel){var pos=Pos(line,ch)
pos.xRel=xRel
if(outside){pos.outside=true}
return pos}
function coordsChar(cm,x,y){var doc=cm.doc
y+=cm.display.viewOffset
if(y<0){return PosWithInfo(doc.first,0,true,-1)}
var lineN=lineAtHeight(doc,y),last=doc.first+doc.size-1
if(lineN>last)
{return PosWithInfo(doc.first+doc.size-1,getLine(doc,last).text.length,true,1)}
if(x<0){x=0}
var lineObj=getLine(doc,lineN)
for(;;){var found=coordsCharInner(cm,lineObj,lineN,x,y)
var merged=collapsedSpanAtEnd(lineObj)
var mergedPos=merged&&merged.find(0,true)
if(merged&&(found.ch>mergedPos.from.ch||found.ch==mergedPos.from.ch&&found.xRel>0))
{lineN=lineNo(lineObj=mergedPos.to.line)}
else
{return found}}}
function coordsCharInner(cm,lineObj,lineNo,x,y){var innerOff=y-heightAtLine(lineObj)
var wrongLine=false,adjust=2*cm.display.wrapper.clientWidth
var preparedMeasure=prepareMeasureForLine(cm,lineObj)
function getX(ch){var sp=cursorCoords(cm,Pos(lineNo,ch),"line",lineObj,preparedMeasure)
wrongLine=true
if(innerOff>sp.bottom){return sp.left-adjust}
else if(innerOff<sp.top){return sp.left+adjust}
else{wrongLine=false}
return sp.left}
var bidi=getOrder(lineObj),dist=lineObj.text.length
var from=lineLeft(lineObj),to=lineRight(lineObj)
var fromX=getX(from),fromOutside=wrongLine,toX=getX(to),toOutside=wrongLine
if(x>toX){return PosWithInfo(lineNo,to,toOutside,1)}
for(;;){if(bidi?to==from||to==moveVisually(lineObj,from,1):to-from<=1){var ch=x<fromX||x-fromX<=toX-x?from:to
var outside=ch==from?fromOutside:toOutside
var xDiff=x-(ch==from?fromX:toX)



if(toOutside&&!bidi&&!/\s/.test(lineObj.text.charAt(ch))&&xDiff>0&&ch<lineObj.text.length&&preparedMeasure.view.measure.heights.length>1){var charSize=measureCharPrepared(cm,preparedMeasure,ch,"right")
if(innerOff<=charSize.bottom&&innerOff>=charSize.top&&Math.abs(x-charSize.right)<xDiff){outside=false
ch++
xDiff=x-charSize.right}}
while(isExtendingChar(lineObj.text.charAt(ch))){++ch}
var pos=PosWithInfo(lineNo,ch,outside,xDiff<-1?-1:xDiff>1?1:0)
return pos}
var step=Math.ceil(dist/2),middle=from+step
if(bidi){middle=from
for(var i=0;i<step;++i){middle=moveVisually(lineObj,middle,1)}}
var middleX=getX(middle)
if(middleX>x){to=middle;toX=middleX;if(toOutside=wrongLine){toX+=1000;}dist=step}
else{from=middle;fromX=middleX;fromOutside=wrongLine;dist-=step}}}
var measureText

function textHeight(display){if(display.cachedTextHeight!=null){return display.cachedTextHeight}
if(measureText==null){measureText=elt("pre")

for(var i=0;i<49;++i){measureText.appendChild(document.createTextNode("x"))
measureText.appendChild(elt("br"))}
measureText.appendChild(document.createTextNode("x"))}
removeChildrenAndAdd(display.measure,measureText)
var height=measureText.offsetHeight/50
if(height>3){display.cachedTextHeight=height}
removeChildren(display.measure)
return height||1}
function charWidth(display){if(display.cachedCharWidth!=null){return display.cachedCharWidth}
var anchor=elt("span","xxxxxxxxxx")
var pre=elt("pre",[anchor])
removeChildrenAndAdd(display.measure,pre)
var rect=anchor.getBoundingClientRect(),width=(rect.right-rect.left)/10
if(width>2){display.cachedCharWidth=width}
return width||10}

function getDimensions(cm){var d=cm.display,left={},width={}
var gutterLeft=d.gutters.clientLeft
for(var n=d.gutters.firstChild,i=0;n;n=n.nextSibling,++i){left[cm.options.gutters[i]]=n.offsetLeft+n.clientLeft+gutterLeft
width[cm.options.gutters[i]]=n.clientWidth}
return{fixedPos:compensateForHScroll(d),gutterTotalWidth:d.gutters.offsetWidth,gutterLeft:left,gutterWidth:width,wrapperWidth:d.wrapper.clientWidth}}

function compensateForHScroll(display){return display.scroller.getBoundingClientRect().left-display.sizer.getBoundingClientRect().left}


function estimateHeight(cm){var th=textHeight(cm.display),wrapping=cm.options.lineWrapping
var perLine=wrapping&&Math.max(5,cm.display.scroller.clientWidth/charWidth(cm.display)-3)
return function(line){if(lineIsHidden(cm.doc,line)){return 0}
var widgetsHeight=0
if(line.widgets){for(var i=0;i<line.widgets.length;i++){if(line.widgets[i].height){widgetsHeight+=line.widgets[i].height}}}
if(wrapping)
{return widgetsHeight+(Math.ceil(line.text.length/perLine)||1)*th}
else
{return widgetsHeight+th}}}
function estimateLineHeights(cm){var doc=cm.doc,est=estimateHeight(cm)
doc.iter(function(line){var estHeight=est(line)
if(estHeight!=line.height){updateLineHeight(line,estHeight)}})}



function posFromMouse(cm,e,liberal,forRect){var display=cm.display
if(!liberal&&e_target(e).getAttribute("cm-not-content")=="true"){return null}
var x,y,space=display.lineSpace.getBoundingClientRect()
try{x=e.clientX-space.left;y=e.clientY-space.top}
catch(e){return null}
var coords=coordsChar(cm,x,y),line
if(forRect&&coords.xRel==1&&(line=getLine(cm.doc,coords.line).text).length==coords.ch){var colDiff=countColumn(line,line.length,cm.options.tabSize)-line.length
coords=Pos(coords.line,Math.max(0,Math.round((x-paddingH(cm.display).left)/charWidth(cm.display))-colDiff))}
return coords}

function findViewIndex(cm,n){if(n>=cm.display.viewTo){return null}
n-=cm.display.viewFrom
if(n<0){return null}
var view=cm.display.view
for(var i=0;i<view.length;i++){n-=view[i].size
if(n<0){return i}}}
function updateSelection(cm){cm.display.input.showSelection(cm.display.input.prepareSelection())}
function prepareSelection(cm,primary){var doc=cm.doc,result={}
var curFragment=result.cursors=document.createDocumentFragment()
var selFragment=result.selection=document.createDocumentFragment()
for(var i=0;i<doc.sel.ranges.length;i++){if(primary===false&&i==doc.sel.primIndex){continue}
var range=doc.sel.ranges[i]
if(range.from().line>=cm.display.viewTo||range.to().line<cm.display.viewFrom){continue}
var collapsed=range.empty()
if(collapsed||cm.options.showCursorWhenSelecting)
{drawSelectionCursor(cm,range.head,curFragment)}
if(!collapsed)
{drawSelectionRange(cm,range,selFragment)}}
return result}
function drawSelectionCursor(cm,head,output){var pos=cursorCoords(cm,head,"div",null,null,!cm.options.singleCursorHeightPerLine)
var cursor=output.appendChild(elt("div","\u00a0","CodeMirror-cursor"))
cursor.style.left=pos.left+"px"
cursor.style.top=pos.top+"px"
cursor.style.height=Math.max(0,pos.bottom-pos.top)*cm.options.cursorHeight+"px"
if(pos.other){ var otherCursor=output.appendChild(elt("div","\u00a0","CodeMirror-cursor CodeMirror-secondarycursor"))
otherCursor.style.display=""
otherCursor.style.left=pos.other.left+"px"
otherCursor.style.top=pos.other.top+"px"
otherCursor.style.height=(pos.other.bottom-pos.other.top)*.85+"px"}}
function drawSelectionRange(cm,range,output){var display=cm.display,doc=cm.doc
var fragment=document.createDocumentFragment()
var padding=paddingH(cm.display),leftSide=padding.left
var rightSide=Math.max(display.sizerWidth,displayWidth(cm)-display.sizer.offsetLeft)-padding.right
function add(left,top,width,bottom){if(top<0){top=0}
top=Math.round(top)
bottom=Math.round(bottom)
fragment.appendChild(elt("div",null,"CodeMirror-selected",("position: absolute; left: "+left+"px;\n                             top: "+top+"px; width: "+(width==null?rightSide-left:width)+"px;\n                             height: "+(bottom-top)+"px")))}
function drawForLine(line,fromArg,toArg){var lineObj=getLine(doc,line)
var lineLen=lineObj.text.length
var start,end
function coords(ch,bias){return charCoords(cm,Pos(line,ch),"div",lineObj,bias)}
iterateBidiSections(getOrder(lineObj),fromArg||0,toArg==null?lineLen:toArg,function(from,to,dir){var leftPos=coords(from,"left"),rightPos,left,right
if(from==to){rightPos=leftPos
left=right=leftPos.left}else{rightPos=coords(to-1,"right")
if(dir=="rtl"){var tmp=leftPos;leftPos=rightPos;rightPos=tmp}
left=leftPos.left
right=rightPos.right}
if(fromArg==null&&from==0){left=leftSide}
if(rightPos.top-leftPos.top>3){ add(left,leftPos.top,null,leftPos.bottom)
left=leftSide
if(leftPos.bottom<rightPos.top){add(left,leftPos.bottom,null,rightPos.top)}}
if(toArg==null&&to==lineLen){right=rightSide}
if(!start||leftPos.top<start.top||leftPos.top==start.top&&leftPos.left<start.left)
{start=leftPos}
if(!end||rightPos.bottom>end.bottom||rightPos.bottom==end.bottom&&rightPos.right>end.right)
{end=rightPos}
if(left<leftSide+1){left=leftSide}
add(left,rightPos.top,right-left,rightPos.bottom)})
return{start:start,end:end}}
var sFrom=range.from(),sTo=range.to()
if(sFrom.line==sTo.line){drawForLine(sFrom.line,sFrom.ch,sTo.ch)}else{var fromLine=getLine(doc,sFrom.line),toLine=getLine(doc,sTo.line)
var singleVLine=visualLine(fromLine)==visualLine(toLine)
var leftEnd=drawForLine(sFrom.line,sFrom.ch,singleVLine?fromLine.text.length+1:null).end
var rightStart=drawForLine(sTo.line,singleVLine?0:null,sTo.ch).start
if(singleVLine){if(leftEnd.top<rightStart.top-2){add(leftEnd.right,leftEnd.top,null,leftEnd.bottom)
add(leftSide,rightStart.top,rightStart.left,rightStart.bottom)}else{add(leftEnd.right,leftEnd.top,rightStart.left-leftEnd.right,leftEnd.bottom)}}
if(leftEnd.bottom<rightStart.top)
{add(leftSide,leftEnd.bottom,null,rightStart.top)}}
output.appendChild(fragment)}
function restartBlink(cm){if(!cm.state.focused){return}
var display=cm.display
clearInterval(display.blinker)
var on=true
display.cursorDiv.style.visibility=""
if(cm.options.cursorBlinkRate>0)
{display.blinker=setInterval(function(){return display.cursorDiv.style.visibility=(on=!on)?"":"hidden";},cm.options.cursorBlinkRate)}
else if(cm.options.cursorBlinkRate<0)
{display.cursorDiv.style.visibility="hidden"}}
function ensureFocus(cm){if(!cm.state.focused){cm.display.input.focus();onFocus(cm)}}
function delayBlurEvent(cm){cm.state.delayingBlurEvent=true
setTimeout(function(){if(cm.state.delayingBlurEvent){cm.state.delayingBlurEvent=false
onBlur(cm)}},100)}
function onFocus(cm,e){if(cm.state.delayingBlurEvent){cm.state.delayingBlurEvent=false}
if(cm.options.readOnly=="nocursor"){return}
if(!cm.state.focused){signal(cm,"focus",cm,e)
cm.state.focused=true
addClass(cm.display.wrapper,"CodeMirror-focused")


if(!cm.curOp&&cm.display.selForContextMenu!=cm.doc.sel){cm.display.input.reset()
if(webkit){setTimeout(function(){return cm.display.input.reset(true);},20)}
}
cm.display.input.receivedFocus()}
restartBlink(cm)}
function onBlur(cm,e){if(cm.state.delayingBlurEvent){return}
if(cm.state.focused){signal(cm,"blur",cm,e)
cm.state.focused=false
rmClass(cm.display.wrapper,"CodeMirror-focused")}
clearInterval(cm.display.blinker)
setTimeout(function(){if(!cm.state.focused){cm.display.shift=false}},150)}

function alignHorizontally(cm){var display=cm.display,view=display.view
if(!display.alignWidgets&&(!display.gutters.firstChild||!cm.options.fixedGutter)){return}
var comp=compensateForHScroll(display)-display.scroller.scrollLeft+cm.doc.scrollLeft
var gutterW=display.gutters.offsetWidth,left=comp+"px"
for(var i=0;i<view.length;i++){if(!view[i].hidden){if(cm.options.fixedGutter){if(view[i].gutter)
{view[i].gutter.style.left=left}
if(view[i].gutterBackground)
{view[i].gutterBackground.style.left=left}}
var align=view[i].alignable
if(align){for(var j=0;j<align.length;j++)
{align[j].style.left=left}}}}
if(cm.options.fixedGutter)
{display.gutters.style.left=(comp+gutterW)+"px"}}


function maybeUpdateLineNumberWidth(cm){if(!cm.options.lineNumbers){return false}
var doc=cm.doc,last=lineNumberFor(cm.options,doc.first+doc.size-1),display=cm.display
if(last.length!=display.lineNumChars){var test=display.measure.appendChild(elt("div",[elt("div",last)],"CodeMirror-linenumber CodeMirror-gutter-elt"))
var innerW=test.firstChild.offsetWidth,padding=test.offsetWidth-innerW
display.lineGutter.style.width=""
display.lineNumInnerWidth=Math.max(innerW,display.lineGutter.offsetWidth-padding)+1
display.lineNumWidth=display.lineNumInnerWidth+padding
display.lineNumChars=display.lineNumInnerWidth?last.length:-1
display.lineGutter.style.width=display.lineNumWidth+"px"
updateGutterSpace(cm)
return true}
return false}

function updateHeightsInViewport(cm){var display=cm.display
var prevBottom=display.lineDiv.offsetTop
for(var i=0;i<display.view.length;i++){var cur=display.view[i],height=(void 0)
if(cur.hidden){continue}
if(ie&&ie_version<8){var bot=cur.node.offsetTop+cur.node.offsetHeight
height=bot-prevBottom
prevBottom=bot}else{var box=cur.node.getBoundingClientRect()
height=box.bottom-box.top}
var diff=cur.line.height-height
if(height<2){height=textHeight(display)}
if(diff>.001||diff<-.001){updateLineHeight(cur.line,height)
updateWidgetHeight(cur.line)
if(cur.rest){for(var j=0;j<cur.rest.length;j++)
{updateWidgetHeight(cur.rest[j])}}}}}

function updateWidgetHeight(line){if(line.widgets){for(var i=0;i<line.widgets.length;++i)
{line.widgets[i].height=line.widgets[i].node.parentNode.offsetHeight}}}

function visibleLines(display,doc,viewport){var top=viewport&&viewport.top!=null?Math.max(0,viewport.top):display.scroller.scrollTop
top=Math.floor(top-paddingTop(display))
var bottom=viewport&&viewport.bottom!=null?viewport.bottom:top+display.wrapper.clientHeight
var from=lineAtHeight(doc,top),to=lineAtHeight(doc,bottom)

if(viewport&&viewport.ensure){var ensureFrom=viewport.ensure.from.line,ensureTo=viewport.ensure.to.line
if(ensureFrom<from){from=ensureFrom
to=lineAtHeight(doc,heightAtLine(getLine(doc,ensureFrom))+display.wrapper.clientHeight)}else if(Math.min(ensureTo,doc.lastLine())>=to){from=lineAtHeight(doc,heightAtLine(getLine(doc,ensureTo))-display.wrapper.clientHeight)
to=ensureTo}}
return{from:from,to:Math.max(to,from+1)}}

function setScrollTop(cm,val){if(Math.abs(cm.doc.scrollTop-val)<2){return}
cm.doc.scrollTop=val
if(!gecko){updateDisplaySimple(cm,{top:val})}
if(cm.display.scroller.scrollTop!=val){cm.display.scroller.scrollTop=val}
cm.display.scrollbars.setScrollTop(val)
if(gecko){updateDisplaySimple(cm)}
startWorker(cm,100)}

function setScrollLeft(cm,val,isScroller){if(isScroller?val==cm.doc.scrollLeft:Math.abs(cm.doc.scrollLeft-val)<2){return}
val=Math.min(val,cm.display.scroller.scrollWidth-cm.display.scroller.clientWidth)
cm.doc.scrollLeft=val
alignHorizontally(cm)
if(cm.display.scroller.scrollLeft!=val){cm.display.scroller.scrollLeft=val}
cm.display.scrollbars.setScrollLeft(val)}






var wheelSamples=0;var wheelPixelsPerUnit=null;


if(ie){wheelPixelsPerUnit=-.53}
else if(gecko){wheelPixelsPerUnit=15}
else if(chrome){wheelPixelsPerUnit=-.7}
else if(safari){wheelPixelsPerUnit=-1/3}
function wheelEventDelta(e){var dx=e.wheelDeltaX,dy=e.wheelDeltaY
if(dx==null&&e.detail&&e.axis==e.HORIZONTAL_AXIS){dx=e.detail}
if(dy==null&&e.detail&&e.axis==e.VERTICAL_AXIS){dy=e.detail}
else if(dy==null){dy=e.wheelDelta}
return{x:dx,y:dy}}
function wheelEventPixels(e){var delta=wheelEventDelta(e)
delta.x*=wheelPixelsPerUnit
delta.y*=wheelPixelsPerUnit
return delta}
function onScrollWheel(cm,e){var delta=wheelEventDelta(e),dx=delta.x,dy=delta.y
var display=cm.display,scroll=display.scroller
 
var canScrollX=scroll.scrollWidth>scroll.clientWidth
var canScrollY=scroll.scrollHeight>scroll.clientHeight
if(!(dx&&canScrollX||dy&&canScrollY)){return}


if(dy&&mac&&webkit){outer:for(var cur=e.target,view=display.view;cur!=scroll;cur=cur.parentNode){for(var i=0;i<view.length;i++){if(view[i].node==cur){cm.display.currentWheelTarget=cur
break outer}}}}





if(dx&&!gecko&&!presto&&wheelPixelsPerUnit!=null){if(dy&&canScrollY)
{setScrollTop(cm,Math.max(0,Math.min(scroll.scrollTop+dy*wheelPixelsPerUnit,scroll.scrollHeight-scroll.clientHeight)))}
setScrollLeft(cm,Math.max(0,Math.min(scroll.scrollLeft+dx*wheelPixelsPerUnit,scroll.scrollWidth-scroll.clientWidth)))



if(!dy||(dy&&canScrollY))
{e_preventDefault(e)}
display.wheelStartX=null
 return}

if(dy&&wheelPixelsPerUnit!=null){var pixels=dy*wheelPixelsPerUnit
var top=cm.doc.scrollTop,bot=top+display.wrapper.clientHeight
if(pixels<0){top=Math.max(0,top+pixels-50)}
else{bot=Math.min(cm.doc.height,bot+pixels+50)}
updateDisplaySimple(cm,{top:top,bottom:bot})}
if(wheelSamples<20){if(display.wheelStartX==null){display.wheelStartX=scroll.scrollLeft;display.wheelStartY=scroll.scrollTop
display.wheelDX=dx;display.wheelDY=dy
setTimeout(function(){if(display.wheelStartX==null){return}
var movedX=scroll.scrollLeft-display.wheelStartX
var movedY=scroll.scrollTop-display.wheelStartY
var sample=(movedY&&display.wheelDY&&movedY/display.wheelDY)||(movedX&&display.wheelDX&&movedX/display.wheelDX)
display.wheelStartX=display.wheelStartY=null
if(!sample){return}
wheelPixelsPerUnit=(wheelPixelsPerUnit*wheelSamples+sample)/(wheelSamples+1)
++wheelSamples},200)}else{display.wheelDX+=dx;display.wheelDY+=dy}}}


function measureForScrollbars(cm){var d=cm.display,gutterW=d.gutters.offsetWidth
var docH=Math.round(cm.doc.height+paddingVert(cm.display))
return{clientHeight:d.scroller.clientHeight,viewHeight:d.wrapper.clientHeight,scrollWidth:d.scroller.scrollWidth,clientWidth:d.scroller.clientWidth,viewWidth:d.wrapper.clientWidth,barLeft:cm.options.fixedGutter?gutterW:0,docHeight:docH,scrollHeight:docH+scrollGap(cm)+d.barHeight,nativeBarWidth:d.nativeBarWidth,gutterWidth:gutterW}}
var NativeScrollbars=function(place,scroll,cm){this.cm=cm
var vert=this.vert=elt("div",[elt("div",null,null,"min-width: 1px")],"CodeMirror-vscrollbar")
var horiz=this.horiz=elt("div",[elt("div",null,null,"height: 100%; min-height: 1px")],"CodeMirror-hscrollbar")
place(vert);place(horiz)
on(vert,"scroll",function(){if(vert.clientHeight){scroll(vert.scrollTop,"vertical")}})
on(horiz,"scroll",function(){if(horiz.clientWidth){scroll(horiz.scrollLeft,"horizontal")}})
this.checkedZeroWidth=false

if(ie&&ie_version<8){this.horiz.style.minHeight=this.vert.style.minWidth="18px"}};NativeScrollbars.prototype.update=function(measure){var needsH=measure.scrollWidth>measure.clientWidth+1
var needsV=measure.scrollHeight>measure.clientHeight+1
var sWidth=measure.nativeBarWidth
if(needsV){this.vert.style.display="block"
this.vert.style.bottom=needsH?sWidth+"px":"0"
var totalHeight=measure.viewHeight-(needsH?sWidth:0)
this.vert.firstChild.style.height=Math.max(0,measure.scrollHeight-measure.clientHeight+totalHeight)+"px"}else{this.vert.style.display=""
this.vert.firstChild.style.height="0"}
if(needsH){this.horiz.style.display="block"
this.horiz.style.right=needsV?sWidth+"px":"0"
this.horiz.style.left=measure.barLeft+"px"
var totalWidth=measure.viewWidth-measure.barLeft-(needsV?sWidth:0)
this.horiz.firstChild.style.width=(measure.scrollWidth-measure.clientWidth+totalWidth)+"px"}else{this.horiz.style.display=""
this.horiz.firstChild.style.width="0"}
if(!this.checkedZeroWidth&&measure.clientHeight>0){if(sWidth==0){this.zeroWidthHack()}
this.checkedZeroWidth=true}
return{right:needsV?sWidth:0,bottom:needsH?sWidth:0}};NativeScrollbars.prototype.setScrollLeft=function(pos){if(this.horiz.scrollLeft!=pos){this.horiz.scrollLeft=pos}
if(this.disableHoriz){this.enableZeroWidthBar(this.horiz,this.disableHoriz)}};NativeScrollbars.prototype.setScrollTop=function(pos){if(this.vert.scrollTop!=pos){this.vert.scrollTop=pos}
if(this.disableVert){this.enableZeroWidthBar(this.vert,this.disableVert)}};NativeScrollbars.prototype.zeroWidthHack=function(){var w=mac&&!mac_geMountainLion?"12px":"18px"
this.horiz.style.height=this.vert.style.width=w
this.horiz.style.pointerEvents=this.vert.style.pointerEvents="none"
this.disableHoriz=new Delayed
this.disableVert=new Delayed};NativeScrollbars.prototype.enableZeroWidthBar=function(bar,delay){bar.style.pointerEvents="auto"
function maybeDisable(){




var box=bar.getBoundingClientRect()
var elt=document.elementFromPoint(box.left+1,box.bottom-1)
if(elt!=bar){bar.style.pointerEvents="none"}
else{delay.set(1000,maybeDisable)}}
delay.set(1000,maybeDisable)};NativeScrollbars.prototype.clear=function(){var parent=this.horiz.parentNode
parent.removeChild(this.horiz)
parent.removeChild(this.vert)};var NullScrollbars=function(){};NullScrollbars.prototype.update=function(){return{bottom:0,right:0}};NullScrollbars.prototype.setScrollLeft=function(){};NullScrollbars.prototype.setScrollTop=function(){};NullScrollbars.prototype.clear=function(){};function updateScrollbars(cm,measure){if(!measure){measure=measureForScrollbars(cm)}
var startWidth=cm.display.barWidth,startHeight=cm.display.barHeight
updateScrollbarsInner(cm,measure)
for(var i=0;i<4&&startWidth!=cm.display.barWidth||startHeight!=cm.display.barHeight;i++){if(startWidth!=cm.display.barWidth&&cm.options.lineWrapping)
{updateHeightsInViewport(cm)}
updateScrollbarsInner(cm,measureForScrollbars(cm))
startWidth=cm.display.barWidth;startHeight=cm.display.barHeight}}

function updateScrollbarsInner(cm,measure){var d=cm.display
var sizes=d.scrollbars.update(measure)
d.sizer.style.paddingRight=(d.barWidth=sizes.right)+"px"
d.sizer.style.paddingBottom=(d.barHeight=sizes.bottom)+"px"
d.heightForcer.style.borderBottom=sizes.bottom+"px solid transparent"
if(sizes.right&&sizes.bottom){d.scrollbarFiller.style.display="block"
d.scrollbarFiller.style.height=sizes.bottom+"px"
d.scrollbarFiller.style.width=sizes.right+"px"}else{d.scrollbarFiller.style.display=""}
if(sizes.bottom&&cm.options.coverGutterNextToScrollbar&&cm.options.fixedGutter){d.gutterFiller.style.display="block"
d.gutterFiller.style.height=sizes.bottom+"px"
d.gutterFiller.style.width=measure.gutterWidth+"px"}else{d.gutterFiller.style.display=""}}
var scrollbarModel={"native":NativeScrollbars,"null":NullScrollbars}
function initScrollbars(cm){if(cm.display.scrollbars){cm.display.scrollbars.clear()
if(cm.display.scrollbars.addClass)
{rmClass(cm.display.wrapper,cm.display.scrollbars.addClass)}}
cm.display.scrollbars=new scrollbarModel[cm.options.scrollbarStyle](function(node){cm.display.wrapper.insertBefore(node,cm.display.scrollbarFiller) 
on(node,"mousedown",function(){if(cm.state.focused){setTimeout(function(){return cm.display.input.focus();},0)}})
node.setAttribute("cm-not-content","true")},function(pos,axis){if(axis=="horizontal"){setScrollLeft(cm,pos)}
else{setScrollTop(cm,pos)}},cm)
if(cm.display.scrollbars.addClass)
{addClass(cm.display.wrapper,cm.display.scrollbars.addClass)}}


function maybeScrollWindow(cm,coords){if(signalDOMEvent(cm,"scrollCursorIntoView")){return}
var display=cm.display,box=display.sizer.getBoundingClientRect(),doScroll=null
if(coords.top+box.top<0){doScroll=true}
else if(coords.bottom+box.top>(window.innerHeight||document.documentElement.clientHeight)){doScroll=false}
if(doScroll!=null&&!phantom){var scrollNode=elt("div","\u200b",null,("position: absolute;\n                         top: "+(coords.top-display.viewOffset-paddingTop(cm.display))+"px;\n                         height: "+(coords.bottom-coords.top+scrollGap(cm)+display.barHeight)+"px;\n                         left: "+(coords.left)+"px; width: 2px;"))
cm.display.lineSpace.appendChild(scrollNode)
scrollNode.scrollIntoView(doScroll)
cm.display.lineSpace.removeChild(scrollNode)}}


function scrollPosIntoView(cm,pos,end,margin){if(margin==null){margin=0}
var coords
for(var limit=0;limit<5;limit++){var changed=false
coords=cursorCoords(cm,pos)
var endCoords=!end||end==pos?coords:cursorCoords(cm,end)
var scrollPos=calculateScrollPos(cm,Math.min(coords.left,endCoords.left),Math.min(coords.top,endCoords.top)-margin,Math.max(coords.left,endCoords.left),Math.max(coords.bottom,endCoords.bottom)+margin)
var startTop=cm.doc.scrollTop,startLeft=cm.doc.scrollLeft
if(scrollPos.scrollTop!=null){setScrollTop(cm,scrollPos.scrollTop)
if(Math.abs(cm.doc.scrollTop-startTop)>1){changed=true}}
if(scrollPos.scrollLeft!=null){setScrollLeft(cm,scrollPos.scrollLeft)
if(Math.abs(cm.doc.scrollLeft-startLeft)>1){changed=true}}
if(!changed){break}}
return coords}
function scrollIntoView(cm,x1,y1,x2,y2){var scrollPos=calculateScrollPos(cm,x1,y1,x2,y2)
if(scrollPos.scrollTop!=null){setScrollTop(cm,scrollPos.scrollTop)}
if(scrollPos.scrollLeft!=null){setScrollLeft(cm,scrollPos.scrollLeft)}}



function calculateScrollPos(cm,x1,y1,x2,y2){var display=cm.display,snapMargin=textHeight(cm.display)
if(y1<0){y1=0}
var screentop=cm.curOp&&cm.curOp.scrollTop!=null?cm.curOp.scrollTop:display.scroller.scrollTop
var screen=displayHeight(cm),result={}
if(y2-y1>screen){y2=y1+screen}
var docBottom=cm.doc.height+paddingVert(display)
var atTop=y1<snapMargin,atBottom=y2>docBottom-snapMargin
if(y1<screentop){result.scrollTop=atTop?0:y1}else if(y2>screentop+screen){var newTop=Math.min(y1,(atBottom?docBottom:y2)-screen)
if(newTop!=screentop){result.scrollTop=newTop}}
var screenleft=cm.curOp&&cm.curOp.scrollLeft!=null?cm.curOp.scrollLeft:display.scroller.scrollLeft
var screenw=displayWidth(cm)-(cm.options.fixedGutter?display.gutters.offsetWidth:0)
var tooWide=x2-x1>screenw
if(tooWide){x2=x1+screenw}
if(x1<10)
{result.scrollLeft=0}
else if(x1<screenleft)
{result.scrollLeft=Math.max(0,x1-(tooWide?0:10))}
else if(x2>screenw+screenleft-3)
{result.scrollLeft=x2+(tooWide?0:10)-screenw}
return result}

function addToScrollPos(cm,left,top){if(left!=null||top!=null){resolveScrollToPos(cm)}
if(left!=null)
{cm.curOp.scrollLeft=(cm.curOp.scrollLeft==null?cm.doc.scrollLeft:cm.curOp.scrollLeft)+left}
if(top!=null)
{cm.curOp.scrollTop=(cm.curOp.scrollTop==null?cm.doc.scrollTop:cm.curOp.scrollTop)+top}}

function ensureCursorVisible(cm){resolveScrollToPos(cm)
var cur=cm.getCursor(),from=cur,to=cur
if(!cm.options.lineWrapping){from=cur.ch?Pos(cur.line,cur.ch-1):cur
to=Pos(cur.line,cur.ch+1)}
cm.curOp.scrollToPos={from:from,to:to,margin:cm.options.cursorScrollMargin,isCursor:true}}



function resolveScrollToPos(cm){var range=cm.curOp.scrollToPos
if(range){cm.curOp.scrollToPos=null
var from=estimateCoords(cm,range.from),to=estimateCoords(cm,range.to)
var sPos=calculateScrollPos(cm,Math.min(from.left,to.left),Math.min(from.top,to.top)-range.margin,Math.max(from.right,to.right),Math.max(from.bottom,to.bottom)+range.margin)
cm.scrollTo(sPos.scrollLeft,sPos.scrollTop)}}




var nextOpId=0

function startOperation(cm){cm.curOp={cm:cm,viewChanged:false, startHeight:cm.doc.height, forceUpdate:false, updateInput:null, typing:false,changeObjs:null, cursorActivityHandlers:null, cursorActivityCalled:0, selectionChanged:false, updateMaxLine:false, scrollLeft:null,scrollTop:null, scrollToPos:null, focus:false,id:++nextOpId
}
pushOperation(cm.curOp)}
function endOperation(cm){var op=cm.curOp
finishOperation(op,function(group){for(var i=0;i<group.ops.length;i++)
{group.ops[i].cm.curOp=null}
endOperations(group)})}

function endOperations(group){var ops=group.ops
for(var i=0;i<ops.length;i++)
{endOperation_R1(ops[i])}
for(var i$1=0;i$1<ops.length;i$1++)
{endOperation_W1(ops[i$1])}
for(var i$2=0;i$2<ops.length;i$2++)
{endOperation_R2(ops[i$2])}
for(var i$3=0;i$3<ops.length;i$3++)
{endOperation_W2(ops[i$3])}
for(var i$4=0;i$4<ops.length;i$4++)
{endOperation_finish(ops[i$4])}}
function endOperation_R1(op){var cm=op.cm,display=cm.display
maybeClipScrollbars(cm)
if(op.updateMaxLine){findMaxLine(cm)}
op.mustUpdate=op.viewChanged||op.forceUpdate||op.scrollTop!=null||op.scrollToPos&&(op.scrollToPos.from.line<display.viewFrom||op.scrollToPos.to.line>=display.viewTo)||display.maxLineChanged&&cm.options.lineWrapping
op.update=op.mustUpdate&&new DisplayUpdate(cm,op.mustUpdate&&{top:op.scrollTop,ensure:op.scrollToPos},op.forceUpdate)}
function endOperation_W1(op){op.updatedDisplay=op.mustUpdate&&updateDisplayIfNeeded(op.cm,op.update)}
function endOperation_R2(op){var cm=op.cm,display=cm.display
if(op.updatedDisplay){updateHeightsInViewport(cm)}
op.barMeasure=measureForScrollbars(cm) 
if(display.maxLineChanged&&!cm.options.lineWrapping){op.adjustWidthTo=measureChar(cm,display.maxLine,display.maxLine.text.length).left+3
cm.display.sizerWidth=op.adjustWidthTo
op.barMeasure.scrollWidth=Math.max(display.scroller.clientWidth,display.sizer.offsetLeft+op.adjustWidthTo+scrollGap(cm)+cm.display.barWidth)
op.maxScrollLeft=Math.max(0,display.sizer.offsetLeft+op.adjustWidthTo-displayWidth(cm))}
if(op.updatedDisplay||op.selectionChanged)
{op.preparedSelection=display.input.prepareSelection(op.focus)}}
function endOperation_W2(op){var cm=op.cm
if(op.adjustWidthTo!=null){cm.display.sizer.style.minWidth=op.adjustWidthTo+"px"
if(op.maxScrollLeft<cm.doc.scrollLeft)
{setScrollLeft(cm,Math.min(cm.display.scroller.scrollLeft,op.maxScrollLeft),true)}
cm.display.maxLineChanged=false}
var takeFocus=op.focus&&op.focus==activeElt()&&(!document.hasFocus||document.hasFocus())
if(op.preparedSelection)
{cm.display.input.showSelection(op.preparedSelection,takeFocus)}
if(op.updatedDisplay||op.startHeight!=cm.doc.height)
{updateScrollbars(cm,op.barMeasure)}
if(op.updatedDisplay)
{setDocumentHeight(cm,op.barMeasure)}
if(op.selectionChanged){restartBlink(cm)}
if(cm.state.focused&&op.updateInput)
{cm.display.input.reset(op.typing)}
if(takeFocus){ensureFocus(op.cm)}}
function endOperation_finish(op){var cm=op.cm,display=cm.display,doc=cm.doc
if(op.updatedDisplay){postUpdateDisplay(cm,op.update)} 
if(display.wheelStartX!=null&&(op.scrollTop!=null||op.scrollLeft!=null||op.scrollToPos))
{display.wheelStartX=display.wheelStartY=null} 
if(op.scrollTop!=null&&(display.scroller.scrollTop!=op.scrollTop||op.forceScroll)){doc.scrollTop=Math.max(0,Math.min(display.scroller.scrollHeight-display.scroller.clientHeight,op.scrollTop))
display.scrollbars.setScrollTop(doc.scrollTop)
display.scroller.scrollTop=doc.scrollTop}
if(op.scrollLeft!=null&&(display.scroller.scrollLeft!=op.scrollLeft||op.forceScroll)){doc.scrollLeft=Math.max(0,Math.min(display.scroller.scrollWidth-display.scroller.clientWidth,op.scrollLeft))
display.scrollbars.setScrollLeft(doc.scrollLeft)
display.scroller.scrollLeft=doc.scrollLeft
alignHorizontally(cm)}
if(op.scrollToPos){var coords=scrollPosIntoView(cm,clipPos(doc,op.scrollToPos.from),clipPos(doc,op.scrollToPos.to),op.scrollToPos.margin)
if(op.scrollToPos.isCursor&&cm.state.focused){maybeScrollWindow(cm,coords)}}
 
var hidden=op.maybeHiddenMarkers,unhidden=op.maybeUnhiddenMarkers
if(hidden){for(var i=0;i<hidden.length;++i)
{if(!hidden[i].lines.length){signal(hidden[i],"hide")}}}
if(unhidden){for(var i$1=0;i$1<unhidden.length;++i$1)
{if(unhidden[i$1].lines.length){signal(unhidden[i$1],"unhide")}}}
if(display.wrapper.offsetHeight)
{doc.scrollTop=cm.display.scroller.scrollTop} 
if(op.changeObjs)
{signal(cm,"changes",cm,op.changeObjs)}
if(op.update)
{op.update.finish()}}
function runInOp(cm,f){if(cm.curOp){return f()}
startOperation(cm)
try{return f()}
finally{endOperation(cm)}}
function operation(cm,f){return function(){if(cm.curOp){return f.apply(cm,arguments)}
startOperation(cm)
try{return f.apply(cm,arguments)}
finally{endOperation(cm)}}}

function methodOp(f){return function(){if(this.curOp){return f.apply(this,arguments)}
startOperation(this)
try{return f.apply(this,arguments)}
finally{endOperation(this)}}}
function docMethodOp(f){return function(){var cm=this.cm
if(!cm||cm.curOp){return f.apply(this,arguments)}
startOperation(cm)
try{return f.apply(this,arguments)}
finally{endOperation(cm)}}}




function regChange(cm,from,to,lendiff){if(from==null){from=cm.doc.first}
if(to==null){to=cm.doc.first+cm.doc.size}
if(!lendiff){lendiff=0}
var display=cm.display
if(lendiff&&to<display.viewTo&&(display.updateLineNumbers==null||display.updateLineNumbers>from))
{display.updateLineNumbers=from}
cm.curOp.viewChanged=true
if(from>=display.viewTo){ if(sawCollapsedSpans&&visualLineNo(cm.doc,from)<display.viewTo)
{resetView(cm)}}else if(to<=display.viewFrom){ if(sawCollapsedSpans&&visualLineEndNo(cm.doc,to+lendiff)>display.viewFrom){resetView(cm)}else{display.viewFrom+=lendiff
display.viewTo+=lendiff}}else if(from<=display.viewFrom&&to>=display.viewTo){ resetView(cm)}else if(from<=display.viewFrom){ var cut=viewCuttingPoint(cm,to,to+lendiff,1)
if(cut){display.view=display.view.slice(cut.index)
display.viewFrom=cut.lineN
display.viewTo+=lendiff}else{resetView(cm)}}else if(to>=display.viewTo){ var cut$1=viewCuttingPoint(cm,from,from,-1)
if(cut$1){display.view=display.view.slice(0,cut$1.index)
display.viewTo=cut$1.lineN}else{resetView(cm)}}else{ var cutTop=viewCuttingPoint(cm,from,from,-1)
var cutBot=viewCuttingPoint(cm,to,to+lendiff,1)
if(cutTop&&cutBot){display.view=display.view.slice(0,cutTop.index).concat(buildViewArray(cm,cutTop.lineN,cutBot.lineN)).concat(display.view.slice(cutBot.index))
display.viewTo+=lendiff}else{resetView(cm)}}
var ext=display.externalMeasured
if(ext){if(to<ext.lineN)
{ext.lineN+=lendiff}
else if(from<ext.lineN+ext.size)
{display.externalMeasured=null}}}
function regLineChange(cm,line,type){cm.curOp.viewChanged=true
var display=cm.display,ext=cm.display.externalMeasured
if(ext&&line>=ext.lineN&&line<ext.lineN+ext.size)
{display.externalMeasured=null}
if(line<display.viewFrom||line>=display.viewTo){return}
var lineView=display.view[findViewIndex(cm,line)]
if(lineView.node==null){return}
var arr=lineView.changes||(lineView.changes=[])
if(indexOf(arr,type)==-1){arr.push(type)}}
function resetView(cm){cm.display.viewFrom=cm.display.viewTo=cm.doc.first
cm.display.view=[]
cm.display.viewOffset=0}
function viewCuttingPoint(cm,oldN,newN,dir){var index=findViewIndex(cm,oldN),diff,view=cm.display.view
if(!sawCollapsedSpans||newN==cm.doc.first+cm.doc.size)
{return{index:index,lineN:newN}}
var n=cm.display.viewFrom
for(var i=0;i<index;i++)
{n+=view[i].size}
if(n!=oldN){if(dir>0){if(index==view.length-1){return null}
diff=(n+view[index].size)-oldN
index++}else{diff=n-oldN}
oldN+=diff;newN+=diff}
while(visualLineNo(cm.doc,newN)!=newN){if(index==(dir<0?0:view.length-1)){return null}
newN+=dir*view[index-(dir<0?1:0)].size
index+=dir}
return{index:index,lineN:newN}}

function adjustView(cm,from,to){var display=cm.display,view=display.view
if(view.length==0||from>=display.viewTo||to<=display.viewFrom){display.view=buildViewArray(cm,from,to)
display.viewFrom=from}else{if(display.viewFrom>from)
{display.view=buildViewArray(cm,from,display.viewFrom).concat(display.view)}
else if(display.viewFrom<from)
{display.view=display.view.slice(findViewIndex(cm,from))}
display.viewFrom=from
if(display.viewTo<to)
{display.view=display.view.concat(buildViewArray(cm,display.viewTo,to))}
else if(display.viewTo>to)
{display.view=display.view.slice(0,findViewIndex(cm,to))}}
display.viewTo=to}

function countDirtyView(cm){var view=cm.display.view,dirty=0
for(var i=0;i<view.length;i++){var lineView=view[i]
if(!lineView.hidden&&(!lineView.node||lineView.changes)){++dirty}}
return dirty}
function startWorker(cm,time){if(cm.doc.mode.startState&&cm.doc.frontier<cm.display.viewTo)
{cm.state.highlight.set(time,bind(highlightWorker,cm))}}
function highlightWorker(cm){var doc=cm.doc
if(doc.frontier<doc.first){doc.frontier=doc.first}
if(doc.frontier>=cm.display.viewTo){return}
var end=+new Date+cm.options.workTime
var state=copyState(doc.mode,getStateBefore(cm,doc.frontier))
var changedLines=[]
doc.iter(doc.frontier,Math.min(doc.first+doc.size,cm.display.viewTo+500),function(line){if(doc.frontier>=cm.display.viewFrom){ var oldStyles=line.styles,tooLong=line.text.length>cm.options.maxHighlightLength
var highlighted=highlightLine(cm,line,tooLong?copyState(doc.mode,state):state,true)
line.styles=highlighted.styles
var oldCls=line.styleClasses,newCls=highlighted.classes
if(newCls){line.styleClasses=newCls}
else if(oldCls){line.styleClasses=null}
var ischange=!oldStyles||oldStyles.length!=line.styles.length||oldCls!=newCls&&(!oldCls||!newCls||oldCls.bgClass!=newCls.bgClass||oldCls.textClass!=newCls.textClass)
for(var i=0;!ischange&&i<oldStyles.length;++i){ischange=oldStyles[i]!=line.styles[i]}
if(ischange){changedLines.push(doc.frontier)}
line.stateAfter=tooLong?state:copyState(doc.mode,state)}else{if(line.text.length<=cm.options.maxHighlightLength)
{processLine(cm,line.text,state)}
line.stateAfter=doc.frontier%5==0?copyState(doc.mode,state):null}
++doc.frontier
if(+new Date>end){startWorker(cm,cm.options.workDelay)
return true}})
if(changedLines.length){runInOp(cm,function(){for(var i=0;i<changedLines.length;i++)
{regLineChange(cm,changedLines[i],"text")}})}}
var DisplayUpdate=function(cm,viewport,force){var display=cm.display
this.viewport=viewport

this.visible=visibleLines(display,cm.doc,viewport)
this.editorIsHidden=!display.wrapper.offsetWidth
this.wrapperHeight=display.wrapper.clientHeight
this.wrapperWidth=display.wrapper.clientWidth
this.oldDisplayWidth=displayWidth(cm)
this.force=force
this.dims=getDimensions(cm)
this.events=[]};DisplayUpdate.prototype.signal=function(emitter,type){if(hasHandler(emitter,type))
{this.events.push(arguments)}};DisplayUpdate.prototype.finish=function(){var this$1=this;for(var i=0;i<this.events.length;i++)
{signal.apply(null,this$1.events[i])}};function maybeClipScrollbars(cm){var display=cm.display
if(!display.scrollbarsClipped&&display.scroller.offsetWidth){display.nativeBarWidth=display.scroller.offsetWidth-display.scroller.clientWidth
display.heightForcer.style.height=scrollGap(cm)+"px"
display.sizer.style.marginBottom=-display.nativeBarWidth+"px"
display.sizer.style.borderRightWidth=scrollGap(cm)+"px"
display.scrollbarsClipped=true}}


function updateDisplayIfNeeded(cm,update){var display=cm.display,doc=cm.doc
if(update.editorIsHidden){resetView(cm)
return false}
if(!update.force&&update.visible.from>=display.viewFrom&&update.visible.to<=display.viewTo&&(display.updateLineNumbers==null||display.updateLineNumbers>=display.viewTo)&&display.renderedView==display.view&&countDirtyView(cm)==0)
{return false}
if(maybeUpdateLineNumberWidth(cm)){resetView(cm)
update.dims=getDimensions(cm)}
var end=doc.first+doc.size
var from=Math.max(update.visible.from-cm.options.viewportMargin,doc.first)
var to=Math.min(end,update.visible.to+cm.options.viewportMargin)
if(display.viewFrom<from&&from-display.viewFrom<20){from=Math.max(doc.first,display.viewFrom)}
if(display.viewTo>to&&display.viewTo-to<20){to=Math.min(end,display.viewTo)}
if(sawCollapsedSpans){from=visualLineNo(cm.doc,from)
to=visualLineEndNo(cm.doc,to)}
var different=from!=display.viewFrom||to!=display.viewTo||display.lastWrapHeight!=update.wrapperHeight||display.lastWrapWidth!=update.wrapperWidth
adjustView(cm,from,to)
display.viewOffset=heightAtLine(getLine(cm.doc,display.viewFrom)) 
cm.display.mover.style.top=display.viewOffset+"px"
var toUpdate=countDirtyView(cm)
if(!different&&toUpdate==0&&!update.force&&display.renderedView==display.view&&(display.updateLineNumbers==null||display.updateLineNumbers>=display.viewTo))
{return false}

var focused=activeElt()
if(toUpdate>4){display.lineDiv.style.display="none"}
patchDisplay(cm,display.updateLineNumbers,update.dims)
if(toUpdate>4){display.lineDiv.style.display=""}
display.renderedView=display.view


if(focused&&activeElt()!=focused&&focused.offsetHeight){focused.focus()}

removeChildren(display.cursorDiv)
removeChildren(display.selectionDiv)
display.gutters.style.height=display.sizer.style.minHeight=0
if(different){display.lastWrapHeight=update.wrapperHeight
display.lastWrapWidth=update.wrapperWidth
startWorker(cm,400)}
display.updateLineNumbers=null
return true}
function postUpdateDisplay(cm,update){var viewport=update.viewport
for(var first=true;;first=false){if(!first||!cm.options.lineWrapping||update.oldDisplayWidth==displayWidth(cm)){if(viewport&&viewport.top!=null)
{viewport={top:Math.min(cm.doc.height+paddingVert(cm.display)-displayHeight(cm),viewport.top)}}

update.visible=visibleLines(cm.display,cm.doc,viewport)
if(update.visible.from>=cm.display.viewFrom&&update.visible.to<=cm.display.viewTo)
{break}}
if(!updateDisplayIfNeeded(cm,update)){break}
updateHeightsInViewport(cm)
var barMeasure=measureForScrollbars(cm)
updateSelection(cm)
updateScrollbars(cm,barMeasure)
setDocumentHeight(cm,barMeasure)}
update.signal(cm,"update",cm)
if(cm.display.viewFrom!=cm.display.reportedViewFrom||cm.display.viewTo!=cm.display.reportedViewTo){update.signal(cm,"viewportChange",cm,cm.display.viewFrom,cm.display.viewTo)
cm.display.reportedViewFrom=cm.display.viewFrom;cm.display.reportedViewTo=cm.display.viewTo}}
function updateDisplaySimple(cm,viewport){var update=new DisplayUpdate(cm,viewport)
if(updateDisplayIfNeeded(cm,update)){updateHeightsInViewport(cm)
postUpdateDisplay(cm,update)
var barMeasure=measureForScrollbars(cm)
updateSelection(cm)
updateScrollbars(cm,barMeasure)
setDocumentHeight(cm,barMeasure)
update.finish()}}



function patchDisplay(cm,updateNumbersFrom,dims){var display=cm.display,lineNumbers=cm.options.lineNumbers
var container=display.lineDiv,cur=container.firstChild
function rm(node){var next=node.nextSibling
 
if(webkit&&mac&&cm.display.currentWheelTarget==node)
{node.style.display="none"}
else
{node.parentNode.removeChild(node)}
return next}
var view=display.view,lineN=display.viewFrom


for(var i=0;i<view.length;i++){var lineView=view[i]
if(lineView.hidden){}else if(!lineView.node||lineView.node.parentNode!=container){ var node=buildLineElement(cm,lineView,lineN,dims)
container.insertBefore(node,cur)}else{ while(cur!=lineView.node){cur=rm(cur)}
var updateNumber=lineNumbers&&updateNumbersFrom!=null&&updateNumbersFrom<=lineN&&lineView.lineNumber
if(lineView.changes){if(indexOf(lineView.changes,"gutter")>-1){updateNumber=false}
updateLineForChanges(cm,lineView,lineN,dims)}
if(updateNumber){removeChildren(lineView.lineNumber)
lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options,lineN)))}
cur=lineView.node.nextSibling}
lineN+=lineView.size}
while(cur){cur=rm(cur)}}
function updateGutterSpace(cm){var width=cm.display.gutters.offsetWidth
cm.display.sizer.style.marginLeft=width+"px"}
function setDocumentHeight(cm,measure){cm.display.sizer.style.minHeight=measure.docHeight+"px"
cm.display.heightForcer.style.top=measure.docHeight+"px"
cm.display.gutters.style.height=(measure.docHeight+cm.display.barHeight+scrollGap(cm))+"px"}

function updateGutters(cm){var gutters=cm.display.gutters,specs=cm.options.gutters
removeChildren(gutters)
var i=0
for(;i<specs.length;++i){var gutterClass=specs[i]
var gElt=gutters.appendChild(elt("div",null,"CodeMirror-gutter "+gutterClass))
if(gutterClass=="CodeMirror-linenumbers"){cm.display.lineGutter=gElt
gElt.style.width=(cm.display.lineNumWidth||1)+"px"}}
gutters.style.display=i?"":"none"
updateGutterSpace(cm)}

function setGuttersForLineNumbers(options){var found=indexOf(options.gutters,"CodeMirror-linenumbers")
if(found==-1&&options.lineNumbers){options.gutters=options.gutters.concat(["CodeMirror-linenumbers"])}else if(found>-1&&!options.lineNumbers){options.gutters=options.gutters.slice(0)
options.gutters.splice(found,1)}}




function Selection(ranges,primIndex){this.ranges=ranges
this.primIndex=primIndex}
Selection.prototype={primary:function(){return this.ranges[this.primIndex]},equals:function(other){var this$1=this;if(other==this){return true}
if(other.primIndex!=this.primIndex||other.ranges.length!=this.ranges.length){return false}
for(var i=0;i<this.ranges.length;i++){var here=this$1.ranges[i],there=other.ranges[i]
if(cmp(here.anchor,there.anchor)!=0||cmp(here.head,there.head)!=0){return false}}
return true},deepCopy:function(){var this$1=this;var out=[]
for(var i=0;i<this.ranges.length;i++)
{out[i]=new Range(copyPos(this$1.ranges[i].anchor),copyPos(this$1.ranges[i].head))}
return new Selection(out,this.primIndex)},somethingSelected:function(){var this$1=this;for(var i=0;i<this.ranges.length;i++)
{if(!this$1.ranges[i].empty()){return true}}
return false},contains:function(pos,end){var this$1=this;if(!end){end=pos}
for(var i=0;i<this.ranges.length;i++){var range=this$1.ranges[i]
if(cmp(end,range.from())>=0&&cmp(pos,range.to())<=0)
{return i}}
return-1}}
function Range(anchor,head){this.anchor=anchor;this.head=head}
Range.prototype={from:function(){return minPos(this.anchor,this.head)},to:function(){return maxPos(this.anchor,this.head)},empty:function(){return this.head.line==this.anchor.line&&this.head.ch==this.anchor.ch}}


function normalizeSelection(ranges,primIndex){var prim=ranges[primIndex]
ranges.sort(function(a,b){return cmp(a.from(),b.from());})
primIndex=indexOf(ranges,prim)
for(var i=1;i<ranges.length;i++){var cur=ranges[i],prev=ranges[i-1]
if(cmp(prev.to(),cur.from())>=0){var from=minPos(prev.from(),cur.from()),to=maxPos(prev.to(),cur.to())
var inv=prev.empty()?cur.from()==cur.head:prev.from()==prev.head
if(i<=primIndex){--primIndex}
ranges.splice(--i,2,new Range(inv?to:from,inv?from:to))}}
return new Selection(ranges,primIndex)}
function simpleSelection(anchor,head){return new Selection([new Range(anchor,head||anchor)],0)}

function changeEnd(change){if(!change.text){return change.to}
return Pos(change.from.line+change.text.length-1,lst(change.text).length+(change.text.length==1?change.from.ch:0))}

function adjustForChange(pos,change){if(cmp(pos,change.from)<0){return pos}
if(cmp(pos,change.to)<=0){return changeEnd(change)}
var line=pos.line+change.text.length-(change.to.line-change.from.line)-1,ch=pos.ch
if(pos.line==change.to.line){ch+=changeEnd(change).ch-change.to.ch}
return Pos(line,ch)}
function computeSelAfterChange(doc,change){var out=[]
for(var i=0;i<doc.sel.ranges.length;i++){var range=doc.sel.ranges[i]
out.push(new Range(adjustForChange(range.anchor,change),adjustForChange(range.head,change)))}
return normalizeSelection(out,doc.sel.primIndex)}
function offsetPos(pos,old,nw){if(pos.line==old.line)
{return Pos(nw.line,pos.ch-old.ch+nw.ch)}
else
{return Pos(nw.line+(pos.line-old.line),pos.ch)}}

function computeReplacedSel(doc,changes,hint){var out=[]
var oldPrev=Pos(doc.first,0),newPrev=oldPrev
for(var i=0;i<changes.length;i++){var change=changes[i]
var from=offsetPos(change.from,oldPrev,newPrev)
var to=offsetPos(changeEnd(change),oldPrev,newPrev)
oldPrev=change.to
newPrev=to
if(hint=="around"){var range=doc.sel.ranges[i],inv=cmp(range.head,range.anchor)<0
out[i]=new Range(inv?to:from,inv?from:to)}else{out[i]=new Range(from,from)}}
return new Selection(out,doc.sel.primIndex)}
function loadMode(cm){cm.doc.mode=getMode(cm.options,cm.doc.modeOption)
resetModeState(cm)}
function resetModeState(cm){cm.doc.iter(function(line){if(line.stateAfter){line.stateAfter=null}
if(line.styles){line.styles=null}})
cm.doc.frontier=cm.doc.first
startWorker(cm,100)
cm.state.modeGen++
if(cm.curOp){regChange(cm)}}



function isWholeLineUpdate(doc,change){return change.from.ch==0&&change.to.ch==0&&lst(change.text)==""&&(!doc.cm||doc.cm.options.wholeLineUpdateBefore)}
function updateDoc(doc,change,markedSpans,estimateHeight){function spansFor(n){return markedSpans?markedSpans[n]:null}
function update(line,text,spans){updateLine(line,text,spans,estimateHeight)
signalLater(line,"change",line,change)}
function linesFor(start,end){var result=[]
for(var i=start;i<end;++i)
{result.push(new Line(text[i],spansFor(i),estimateHeight))}
return result}
var from=change.from,to=change.to,text=change.text
var firstLine=getLine(doc,from.line),lastLine=getLine(doc,to.line)
var lastText=lst(text),lastSpans=spansFor(text.length-1),nlines=to.line-from.line
 
if(change.full){doc.insert(0,linesFor(0,text.length))
doc.remove(text.length,doc.size-text.length)}else if(isWholeLineUpdate(doc,change)){
var added=linesFor(0,text.length-1)
update(lastLine,lastLine.text,lastSpans)
if(nlines){doc.remove(from.line,nlines)}
if(added.length){doc.insert(from.line,added)}}else if(firstLine==lastLine){if(text.length==1){update(firstLine,firstLine.text.slice(0,from.ch)+lastText+firstLine.text.slice(to.ch),lastSpans)}else{var added$1=linesFor(1,text.length-1)
added$1.push(new Line(lastText+firstLine.text.slice(to.ch),lastSpans,estimateHeight))
update(firstLine,firstLine.text.slice(0,from.ch)+text[0],spansFor(0))
doc.insert(from.line+1,added$1)}}else if(text.length==1){update(firstLine,firstLine.text.slice(0,from.ch)+text[0]+lastLine.text.slice(to.ch),spansFor(0))
doc.remove(from.line+1,nlines)}else{update(firstLine,firstLine.text.slice(0,from.ch)+text[0],spansFor(0))
update(lastLine,lastText+lastLine.text.slice(to.ch),lastSpans)
var added$2=linesFor(1,text.length-1)
if(nlines>1){doc.remove(from.line+1,nlines-1)}
doc.insert(from.line+1,added$2)}
signalLater(doc,"change",doc,change)}
function linkedDocs(doc,f,sharedHistOnly){function propagate(doc,skip,sharedHist){if(doc.linked){for(var i=0;i<doc.linked.length;++i){var rel=doc.linked[i]
if(rel.doc==skip){continue}
var shared=sharedHist&&rel.sharedHist
if(sharedHistOnly&&!shared){continue}
f(rel.doc,shared)
propagate(rel.doc,doc,shared)}}}
propagate(doc,null,true)}
function attachDoc(cm,doc){if(doc.cm){throw new Error("This document is already in use.")}
cm.doc=doc
doc.cm=cm
estimateLineHeights(cm)
loadMode(cm)
if(!cm.options.lineWrapping){findMaxLine(cm)}
cm.options.mode=doc.modeOption
regChange(cm)}
function History(startGen){

this.done=[];this.undone=[]
this.undoDepth=Infinity

 
this.lastModTime=this.lastSelTime=0
this.lastOp=this.lastSelOp=null
this.lastOrigin=this.lastSelOrigin=null
 
this.generation=this.maxGeneration=startGen||1}

function historyChangeFromChange(doc,change){var histChange={from:copyPos(change.from),to:changeEnd(change),text:getBetween(doc,change.from,change.to)}
attachLocalSpans(doc,histChange,change.from.line,change.to.line+1)
linkedDocs(doc,function(doc){return attachLocalSpans(doc,histChange,change.from.line,change.to.line+1);},true)
return histChange}

function clearSelectionEvents(array){while(array.length){var last=lst(array)
if(last.ranges){array.pop()}
else{break}}}

function lastChangeEvent(hist,force){if(force){clearSelectionEvents(hist.done)
return lst(hist.done)}else if(hist.done.length&&!lst(hist.done).ranges){return lst(hist.done)}else if(hist.done.length>1&&!hist.done[hist.done.length-2].ranges){hist.done.pop()
return lst(hist.done)}}


function addChangeToHistory(doc,change,selAfter,opId){var hist=doc.history
hist.undone.length=0
var time=+new Date,cur
var last
if((hist.lastOp==opId||hist.lastOrigin==change.origin&&change.origin&&((change.origin.charAt(0)=="+"&&doc.cm&&hist.lastModTime>time-doc.cm.options.historyEventDelay)||change.origin.charAt(0)=="*"))&&(cur=lastChangeEvent(hist,hist.lastOp==opId))){ last=lst(cur.changes)
if(cmp(change.from,change.to)==0&&cmp(change.from,last.to)==0){
 last.to=changeEnd(change)}else{ cur.changes.push(historyChangeFromChange(doc,change))}}else{var before=lst(hist.done)
if(!before||!before.ranges)
{pushSelectionToHistory(doc.sel,hist.done)}
cur={changes:[historyChangeFromChange(doc,change)],generation:hist.generation}
hist.done.push(cur)
while(hist.done.length>hist.undoDepth){hist.done.shift()
if(!hist.done[0].ranges){hist.done.shift()}}}
hist.done.push(selAfter)
hist.generation=++hist.maxGeneration
hist.lastModTime=hist.lastSelTime=time
hist.lastOp=hist.lastSelOp=opId
hist.lastOrigin=hist.lastSelOrigin=change.origin
if(!last){signal(doc,"historyAdded")}}
function selectionEventCanBeMerged(doc,origin,prev,sel){var ch=origin.charAt(0)
return ch=="*"||ch=="+"&&prev.ranges.length==sel.ranges.length&&prev.somethingSelected()==sel.somethingSelected()&&new Date-doc.history.lastSelTime<=(doc.cm?doc.cm.options.historyEventDelay:500)}



function addSelectionToHistory(doc,sel,opId,options){var hist=doc.history,origin=options&&options.origin




if(opId==hist.lastSelOp||(origin&&hist.lastSelOrigin==origin&&(hist.lastModTime==hist.lastSelTime&&hist.lastOrigin==origin||selectionEventCanBeMerged(doc,origin,lst(hist.done),sel))))
{hist.done[hist.done.length-1]=sel}
else
{pushSelectionToHistory(sel,hist.done)}
hist.lastSelTime=+new Date
hist.lastSelOrigin=origin
hist.lastSelOp=opId
if(options&&options.clearRedo!==false)
{clearSelectionEvents(hist.undone)}}
function pushSelectionToHistory(sel,dest){var top=lst(dest)
if(!(top&&top.ranges&&top.equals(sel)))
{dest.push(sel)}}
function attachLocalSpans(doc,change,from,to){var existing=change["spans_"+doc.id],n=0
doc.iter(Math.max(doc.first,from),Math.min(doc.first+doc.size,to),function(line){if(line.markedSpans)
{(existing||(existing=change["spans_"+doc.id]={}))[n]=line.markedSpans}
++n})}

function removeClearedSpans(spans){if(!spans){return null}
var out
for(var i=0;i<spans.length;++i){if(spans[i].marker.explicitlyCleared){if(!out){out=spans.slice(0,i)}}
else if(out){out.push(spans[i])}}
return!out?spans:out.length?out:null}
function getOldSpans(doc,change){var found=change["spans_"+doc.id]
if(!found){return null}
var nw=[]
for(var i=0;i<change.text.length;++i)
{nw.push(removeClearedSpans(found[i]))}
return nw}



function mergeOldSpans(doc,change){var old=getOldSpans(doc,change)
var stretched=stretchSpansOverChange(doc,change)
if(!old){return stretched}
if(!stretched){return old}
for(var i=0;i<old.length;++i){var oldCur=old[i],stretchCur=stretched[i]
if(oldCur&&stretchCur){spans:for(var j=0;j<stretchCur.length;++j){var span=stretchCur[j]
for(var k=0;k<oldCur.length;++k)
{if(oldCur[k].marker==span.marker){continue spans}}
oldCur.push(span)}}else if(stretchCur){old[i]=stretchCur}}
return old}

function copyHistoryArray(events,newGroup,instantiateSel){var copy=[]
for(var i=0;i<events.length;++i){var event=events[i]
if(event.ranges){copy.push(instantiateSel?Selection.prototype.deepCopy.call(event):event)
continue}
var changes=event.changes,newChanges=[]
copy.push({changes:newChanges})
for(var j=0;j<changes.length;++j){var change=changes[j],m=(void 0)
newChanges.push({from:change.from,to:change.to,text:change.text})
if(newGroup){for(var prop in change){if(m=prop.match(/^spans_(\d+)$/)){if(indexOf(newGroup,Number(m[1]))>-1){lst(newChanges)[prop]=change[prop]
delete change[prop]}}}}}}
return copy}



function extendRange(doc,range,head,other){if(doc.cm&&doc.cm.display.shift||doc.extend){var anchor=range.anchor
if(other){var posBefore=cmp(head,anchor)<0
if(posBefore!=(cmp(other,anchor)<0)){anchor=head
head=other}else if(posBefore!=(cmp(head,other)<0)){head=other}}
return new Range(anchor,head)}else{return new Range(other||head,head)}}
function extendSelection(doc,head,other,options){setSelection(doc,new Selection([extendRange(doc,doc.sel.primary(),head,other)],0),options)}

function extendSelections(doc,heads,options){var out=[]
for(var i=0;i<doc.sel.ranges.length;i++)
{out[i]=extendRange(doc,doc.sel.ranges[i],heads[i],null)}
var newSel=normalizeSelection(out,doc.sel.primIndex)
setSelection(doc,newSel,options)}
function replaceOneSelection(doc,i,range,options){var ranges=doc.sel.ranges.slice(0)
ranges[i]=range
setSelection(doc,normalizeSelection(ranges,doc.sel.primIndex),options)}
function setSimpleSelection(doc,anchor,head,options){setSelection(doc,simpleSelection(anchor,head),options)}

function filterSelectionChange(doc,sel,options){var obj={ranges:sel.ranges,update:function(ranges){var this$1=this;this.ranges=[]
for(var i=0;i<ranges.length;i++)
{this$1.ranges[i]=new Range(clipPos(doc,ranges[i].anchor),clipPos(doc,ranges[i].head))}},origin:options&&options.origin}
signal(doc,"beforeSelectionChange",doc,obj)
if(doc.cm){signal(doc.cm,"beforeSelectionChange",doc.cm,obj)}
if(obj.ranges!=sel.ranges){return normalizeSelection(obj.ranges,obj.ranges.length-1)}
else{return sel}}
function setSelectionReplaceHistory(doc,sel,options){var done=doc.history.done,last=lst(done)
if(last&&last.ranges){done[done.length-1]=sel
setSelectionNoUndo(doc,sel,options)}else{setSelection(doc,sel,options)}}
function setSelection(doc,sel,options){setSelectionNoUndo(doc,sel,options)
addSelectionToHistory(doc,doc.sel,doc.cm?doc.cm.curOp.id:NaN,options)}
function setSelectionNoUndo(doc,sel,options){if(hasHandler(doc,"beforeSelectionChange")||doc.cm&&hasHandler(doc.cm,"beforeSelectionChange"))
{sel=filterSelectionChange(doc,sel,options)}
var bias=options&&options.bias||(cmp(sel.primary().head,doc.sel.primary().head)<0?-1:1)
setSelectionInner(doc,skipAtomicInSelection(doc,sel,bias,true))
if(!(options&&options.scroll===false)&&doc.cm)
{ensureCursorVisible(doc.cm)}}
function setSelectionInner(doc,sel){if(sel.equals(doc.sel)){return}
doc.sel=sel
if(doc.cm){doc.cm.curOp.updateInput=doc.cm.curOp.selectionChanged=true
signalCursorActivity(doc.cm)}
signalLater(doc,"cursorActivity",doc)}

function reCheckSelection(doc){setSelectionInner(doc,skipAtomicInSelection(doc,doc.sel,null,false),sel_dontScroll)}

function skipAtomicInSelection(doc,sel,bias,mayClear){var out
for(var i=0;i<sel.ranges.length;i++){var range=sel.ranges[i]
var old=sel.ranges.length==doc.sel.ranges.length&&doc.sel.ranges[i]
var newAnchor=skipAtomic(doc,range.anchor,old&&old.anchor,bias,mayClear)
var newHead=skipAtomic(doc,range.head,old&&old.head,bias,mayClear)
if(out||newAnchor!=range.anchor||newHead!=range.head){if(!out){out=sel.ranges.slice(0,i)}
out[i]=new Range(newAnchor,newHead)}}
return out?normalizeSelection(out,sel.primIndex):sel}
function skipAtomicInner(doc,pos,oldPos,dir,mayClear){var line=getLine(doc,pos.line)
if(line.markedSpans){for(var i=0;i<line.markedSpans.length;++i){var sp=line.markedSpans[i],m=sp.marker
if((sp.from==null||(m.inclusiveLeft?sp.from<=pos.ch:sp.from<pos.ch))&&(sp.to==null||(m.inclusiveRight?sp.to>=pos.ch:sp.to>pos.ch))){if(mayClear){signal(m,"beforeCursorEnter")
if(m.explicitlyCleared){if(!line.markedSpans){break}
else{--i;continue}}}
if(!m.atomic){continue}
if(oldPos){var near=m.find(dir<0?1:-1),diff=(void 0)
if(dir<0?m.inclusiveRight:m.inclusiveLeft)
{near=movePos(doc,near,-dir,near&&near.line==pos.line?line:null)}
if(near&&near.line==pos.line&&(diff=cmp(near,oldPos))&&(dir<0?diff<0:diff>0))
{return skipAtomicInner(doc,near,pos,dir,mayClear)}}
var far=m.find(dir<0?-1:1)
if(dir<0?m.inclusiveLeft:m.inclusiveRight)
{far=movePos(doc,far,dir,far.line==pos.line?line:null)}
return far?skipAtomicInner(doc,far,pos,dir,mayClear):null}}}
return pos}
function skipAtomic(doc,pos,oldPos,bias,mayClear){var dir=bias||1
var found=skipAtomicInner(doc,pos,oldPos,dir,mayClear)||(!mayClear&&skipAtomicInner(doc,pos,oldPos,dir,true))||skipAtomicInner(doc,pos,oldPos,-dir,mayClear)||(!mayClear&&skipAtomicInner(doc,pos,oldPos,-dir,true))
if(!found){doc.cantEdit=true
return Pos(doc.first,0)}
return found}
function movePos(doc,pos,dir,line){if(dir<0&&pos.ch==0){if(pos.line>doc.first){return clipPos(doc,Pos(pos.line-1))}
else{return null}}else if(dir>0&&pos.ch==(line||getLine(doc,pos.line)).text.length){if(pos.line<doc.first+doc.size-1){return Pos(pos.line+1,0)}
else{return null}}else{return new Pos(pos.line,pos.ch+dir)}}
function selectAll(cm){cm.setSelection(Pos(cm.firstLine(),0),Pos(cm.lastLine()),sel_dontScroll)}

function filterChange(doc,change,update){var obj={canceled:false,from:change.from,to:change.to,text:change.text,origin:change.origin,cancel:function(){return obj.canceled=true;}}
if(update){obj.update=function(from,to,text,origin){if(from){obj.from=clipPos(doc,from)}
if(to){obj.to=clipPos(doc,to)}
if(text){obj.text=text}
if(origin!==undefined){obj.origin=origin}}}
signal(doc,"beforeChange",doc,obj)
if(doc.cm){signal(doc.cm,"beforeChange",doc.cm,obj)}
if(obj.canceled){return null}
return{from:obj.from,to:obj.to,text:obj.text,origin:obj.origin}}

function makeChange(doc,change,ignoreReadOnly){if(doc.cm){if(!doc.cm.curOp){return operation(doc.cm,makeChange)(doc,change,ignoreReadOnly)}
if(doc.cm.state.suppressEdits){return}}
if(hasHandler(doc,"beforeChange")||doc.cm&&hasHandler(doc.cm,"beforeChange")){change=filterChange(doc,change,true)
if(!change){return}}

var split=sawReadOnlySpans&&!ignoreReadOnly&&removeReadOnlyRanges(doc,change.from,change.to)
if(split){for(var i=split.length-1;i>=0;--i)
{makeChangeInner(doc,{from:split[i].from,to:split[i].to,text:i?[""]:change.text})}}else{makeChangeInner(doc,change)}}
function makeChangeInner(doc,change){if(change.text.length==1&&change.text[0]==""&&cmp(change.from,change.to)==0){return}
var selAfter=computeSelAfterChange(doc,change)
addChangeToHistory(doc,change,selAfter,doc.cm?doc.cm.curOp.id:NaN)
makeChangeSingleDoc(doc,change,selAfter,stretchSpansOverChange(doc,change))
var rebased=[]
linkedDocs(doc,function(doc,sharedHist){if(!sharedHist&&indexOf(rebased,doc.history)==-1){rebaseHist(doc.history,change)
rebased.push(doc.history)}
makeChangeSingleDoc(doc,change,null,stretchSpansOverChange(doc,change))})}
function makeChangeFromHistory(doc,type,allowSelectionOnly){if(doc.cm&&doc.cm.state.suppressEdits&&!allowSelectionOnly){return}
var hist=doc.history,event,selAfter=doc.sel
var source=type=="undo"?hist.done:hist.undone,dest=type=="undo"?hist.undone:hist.done


var i=0
for(;i<source.length;i++){event=source[i]
if(allowSelectionOnly?event.ranges&&!event.equals(doc.sel):!event.ranges)
{break}}
if(i==source.length){return}
hist.lastOrigin=hist.lastSelOrigin=null
for(;;){event=source.pop()
if(event.ranges){pushSelectionToHistory(event,dest)
if(allowSelectionOnly&&!event.equals(doc.sel)){setSelection(doc,event,{clearRedo:false})
return}
selAfter=event}
else{break}}

var antiChanges=[]
pushSelectionToHistory(selAfter,dest)
dest.push({changes:antiChanges,generation:hist.generation})
hist.generation=event.generation||++hist.maxGeneration
var filter=hasHandler(doc,"beforeChange")||doc.cm&&hasHandler(doc.cm,"beforeChange")
var loop=function(i){var change=event.changes[i]
change.origin=type
if(filter&&!filterChange(doc,change,false)){source.length=0
return{}}
antiChanges.push(historyChangeFromChange(doc,change))
var after=i?computeSelAfterChange(doc,change):lst(source)
makeChangeSingleDoc(doc,change,after,mergeOldSpans(doc,change))
if(!i&&doc.cm){doc.cm.scrollIntoView({from:change.from,to:changeEnd(change)})}
var rebased=[] 
linkedDocs(doc,function(doc,sharedHist){if(!sharedHist&&indexOf(rebased,doc.history)==-1){rebaseHist(doc.history,change)
rebased.push(doc.history)}
makeChangeSingleDoc(doc,change,null,mergeOldSpans(doc,change))})};for(var i$1=event.changes.length-1;i$1>=0;--i$1){var returned=loop(i$1);if(returned)return returned.v;}}

function shiftDoc(doc,distance){if(distance==0){return}
doc.first+=distance
doc.sel=new Selection(map(doc.sel.ranges,function(range){return new Range(Pos(range.anchor.line+distance,range.anchor.ch),Pos(range.head.line+distance,range.head.ch));}),doc.sel.primIndex)
if(doc.cm){regChange(doc.cm,doc.first,doc.first-distance,distance)
for(var d=doc.cm.display,l=d.viewFrom;l<d.viewTo;l++)
{regLineChange(doc.cm,l,"gutter")}}}

function makeChangeSingleDoc(doc,change,selAfter,spans){if(doc.cm&&!doc.cm.curOp)
{return operation(doc.cm,makeChangeSingleDoc)(doc,change,selAfter,spans)}
if(change.to.line<doc.first){shiftDoc(doc,change.text.length-1-(change.to.line-change.from.line))
return}
if(change.from.line>doc.lastLine()){return} 
if(change.from.line<doc.first){var shift=change.text.length-1-(doc.first-change.from.line)
shiftDoc(doc,shift)
change={from:Pos(doc.first,0),to:Pos(change.to.line+shift,change.to.ch),text:[lst(change.text)],origin:change.origin}}
var last=doc.lastLine()
if(change.to.line>last){change={from:change.from,to:Pos(last,getLine(doc,last).text.length),text:[change.text[0]],origin:change.origin}}
change.removed=getBetween(doc,change.from,change.to)
if(!selAfter){selAfter=computeSelAfterChange(doc,change)}
if(doc.cm){makeChangeSingleDocInEditor(doc.cm,change,spans)}
else{updateDoc(doc,change,spans)}
setSelectionNoUndo(doc,selAfter,sel_dontScroll)}

function makeChangeSingleDocInEditor(cm,change,spans){var doc=cm.doc,display=cm.display,from=change.from,to=change.to
var recomputeMaxLength=false,checkWidthStart=from.line
if(!cm.options.lineWrapping){checkWidthStart=lineNo(visualLine(getLine(doc,from.line)))
doc.iter(checkWidthStart,to.line+1,function(line){if(line==display.maxLine){recomputeMaxLength=true
return true}})}
if(doc.sel.contains(change.from,change.to)>-1)
{signalCursorActivity(cm)}
updateDoc(doc,change,spans,estimateHeight(cm))
if(!cm.options.lineWrapping){doc.iter(checkWidthStart,from.line+change.text.length,function(line){var len=lineLength(line)
if(len>display.maxLineLength){display.maxLine=line
display.maxLineLength=len
display.maxLineChanged=true
recomputeMaxLength=false}})
if(recomputeMaxLength){cm.curOp.updateMaxLine=true}} 
doc.frontier=Math.min(doc.frontier,from.line)
startWorker(cm,400)
var lendiff=change.text.length-(to.line-from.line)-1
 
if(change.full)
{regChange(cm)}
else if(from.line==to.line&&change.text.length==1&&!isWholeLineUpdate(cm.doc,change))
{regLineChange(cm,from.line,"text")}
else
{regChange(cm,from.line,to.line+1,lendiff)}
var changesHandler=hasHandler(cm,"changes"),changeHandler=hasHandler(cm,"change")
if(changeHandler||changesHandler){var obj={from:from,to:to,text:change.text,removed:change.removed,origin:change.origin}
if(changeHandler){signalLater(cm,"change",cm,obj)}
if(changesHandler){(cm.curOp.changeObjs||(cm.curOp.changeObjs=[])).push(obj)}}
cm.display.selForContextMenu=null}
function replaceRange(doc,code,from,to,origin){if(!to){to=from}
if(cmp(to,from)<0){var tmp=to;to=from;from=tmp}
if(typeof code=="string"){code=doc.splitLines(code)}
makeChange(doc,{from:from,to:to,text:code,origin:origin})}
function rebaseHistSelSingle(pos,from,to,diff){if(to<pos.line){pos.line+=diff}else if(from<pos.line){pos.line=from
pos.ch=0}}






function rebaseHistArray(array,from,to,diff){for(var i=0;i<array.length;++i){var sub=array[i],ok=true
if(sub.ranges){if(!sub.copied){sub=array[i]=sub.deepCopy();sub.copied=true}
for(var j=0;j<sub.ranges.length;j++){rebaseHistSelSingle(sub.ranges[j].anchor,from,to,diff)
rebaseHistSelSingle(sub.ranges[j].head,from,to,diff)}
continue}
for(var j$1=0;j$1<sub.changes.length;++j$1){var cur=sub.changes[j$1]
if(to<cur.from.line){cur.from=Pos(cur.from.line+diff,cur.from.ch)
cur.to=Pos(cur.to.line+diff,cur.to.ch)}else if(from<=cur.to.line){ok=false
break}}
if(!ok){array.splice(0,i+1)
i=0}}}
function rebaseHist(hist,change){var from=change.from.line,to=change.to.line,diff=change.text.length-(to-from)-1
rebaseHistArray(hist.done,from,to,diff)
rebaseHistArray(hist.undone,from,to,diff)}

function changeLine(doc,handle,changeType,op){var no=handle,line=handle
if(typeof handle=="number"){line=getLine(doc,clipLine(doc,handle))}
else{no=lineNo(handle)}
if(no==null){return null}
if(op(line,no)&&doc.cm){regLineChange(doc.cm,no,changeType)}
return line}






function LeafChunk(lines){var this$1=this;this.lines=lines
this.parent=null
var height=0
for(var i=0;i<lines.length;++i){lines[i].parent=this$1
height+=lines[i].height}
this.height=height}
LeafChunk.prototype={chunkSize:function(){return this.lines.length},removeInner:function(at,n){var this$1=this;for(var i=at,e=at+n;i<e;++i){var line=this$1.lines[i]
this$1.height-=line.height
cleanUpLine(line)
signalLater(line,"delete")}
this.lines.splice(at,n)},collapse:function(lines){lines.push.apply(lines,this.lines)},
insertInner:function(at,lines,height){var this$1=this;this.height+=height
this.lines=this.lines.slice(0,at).concat(lines).concat(this.lines.slice(at))
for(var i=0;i<lines.length;++i){lines[i].parent=this$1}},iterN:function(at,n,op){var this$1=this;for(var e=at+n;at<e;++at)
{if(op(this$1.lines[at])){return true}}}}
function BranchChunk(children){var this$1=this;this.children=children
var size=0,height=0
for(var i=0;i<children.length;++i){var ch=children[i]
size+=ch.chunkSize();height+=ch.height
ch.parent=this$1}
this.size=size
this.height=height
this.parent=null}
BranchChunk.prototype={chunkSize:function(){return this.size},removeInner:function(at,n){var this$1=this;this.size-=n
for(var i=0;i<this.children.length;++i){var child=this$1.children[i],sz=child.chunkSize()
if(at<sz){var rm=Math.min(n,sz-at),oldHeight=child.height
child.removeInner(at,rm)
this$1.height-=oldHeight-child.height
if(sz==rm){this$1.children.splice(i--,1);child.parent=null}
if((n-=rm)==0){break}
at=0}else{at-=sz}}

if(this.size-n<25&&(this.children.length>1||!(this.children[0]instanceof LeafChunk))){var lines=[]
this.collapse(lines)
this.children=[new LeafChunk(lines)]
this.children[0].parent=this}},collapse:function(lines){var this$1=this;for(var i=0;i<this.children.length;++i){this$1.children[i].collapse(lines)}},insertInner:function(at,lines,height){var this$1=this;this.size+=lines.length
this.height+=height
for(var i=0;i<this.children.length;++i){var child=this$1.children[i],sz=child.chunkSize()
if(at<=sz){child.insertInner(at,lines,height)
if(child.lines&&child.lines.length>50){var remaining=child.lines.length%25+25
for(var pos=remaining;pos<child.lines.length;){var leaf=new LeafChunk(child.lines.slice(pos,pos+=25))
child.height-=leaf.height
this$1.children.splice(++i,0,leaf)
leaf.parent=this$1}
child.lines=child.lines.slice(0,remaining)
this$1.maybeSpill()}
break}
at-=sz}},maybeSpill:function(){if(this.children.length<=10){return}
var me=this
do{var spilled=me.children.splice(me.children.length-5,5)
var sibling=new BranchChunk(spilled)
if(!me.parent){ var copy=new BranchChunk(me.children)
copy.parent=me
me.children=[copy,sibling]
me=copy}else{me.size-=sibling.size
me.height-=sibling.height
var myIndex=indexOf(me.parent.children,me)
me.parent.children.splice(myIndex+1,0,sibling)}
sibling.parent=me.parent}while(me.children.length>10)
me.parent.maybeSpill()},iterN:function(at,n,op){var this$1=this;for(var i=0;i<this.children.length;++i){var child=this$1.children[i],sz=child.chunkSize()
if(at<sz){var used=Math.min(n,sz-at)
if(child.iterN(at,used,op)){return true}
if((n-=used)==0){break}
at=0}else{at-=sz}}}}
function LineWidget(doc,node,options){var this$1=this;if(options){for(var opt in options){if(options.hasOwnProperty(opt))
{this$1[opt]=options[opt]}}}
this.doc=doc
this.node=node}
eventMixin(LineWidget)
function adjustScrollWhenAboveVisible(cm,line,diff){if(heightAtLine(line)<((cm.curOp&&cm.curOp.scrollTop)||cm.doc.scrollTop))
{addToScrollPos(cm,null,diff)}}
LineWidget.prototype.clear=function(){var this$1=this;var cm=this.doc.cm,ws=this.line.widgets,line=this.line,no=lineNo(line)
if(no==null||!ws){return}
for(var i=0;i<ws.length;++i){if(ws[i]==this$1){ws.splice(i--,1)}}
if(!ws.length){line.widgets=null}
var height=widgetHeight(this)
updateLineHeight(line,Math.max(0,line.height-height))
if(cm){runInOp(cm,function(){adjustScrollWhenAboveVisible(cm,line,-height)
regLineChange(cm,no,"widget")})}}
LineWidget.prototype.changed=function(){var oldH=this.height,cm=this.doc.cm,line=this.line
this.height=null
var diff=widgetHeight(this)-oldH
if(!diff){return}
updateLineHeight(line,line.height+diff)
if(cm){runInOp(cm,function(){cm.curOp.forceUpdate=true
adjustScrollWhenAboveVisible(cm,line,diff)})}}
function addLineWidget(doc,handle,node,options){var widget=new LineWidget(doc,node,options)
var cm=doc.cm
if(cm&&widget.noHScroll){cm.display.alignWidgets=true}
changeLine(doc,handle,"widget",function(line){var widgets=line.widgets||(line.widgets=[])
if(widget.insertAt==null){widgets.push(widget)}
else{widgets.splice(Math.min(widgets.length-1,Math.max(0,widget.insertAt)),0,widget)}
widget.line=line
if(cm&&!lineIsHidden(doc,line)){var aboveVisible=heightAtLine(line)<doc.scrollTop
updateLineHeight(line,line.height+widgetHeight(widget))
if(aboveVisible){addToScrollPos(cm,null,widget.height)}
cm.curOp.forceUpdate=true}
return true})
return widget}










var nextMarkerId=0
function TextMarker(doc,type){this.lines=[]
this.type=type
this.doc=doc
this.id=++nextMarkerId}
eventMixin(TextMarker)
TextMarker.prototype.clear=function(){var this$1=this;if(this.explicitlyCleared){return}
var cm=this.doc.cm,withOp=cm&&!cm.curOp
if(withOp){startOperation(cm)}
if(hasHandler(this,"clear")){var found=this.find()
if(found){signalLater(this,"clear",found.from,found.to)}}
var min=null,max=null
for(var i=0;i<this.lines.length;++i){var line=this$1.lines[i]
var span=getMarkedSpanFor(line.markedSpans,this$1)
if(cm&&!this$1.collapsed){regLineChange(cm,lineNo(line),"text")}
else if(cm){if(span.to!=null){max=lineNo(line)}
if(span.from!=null){min=lineNo(line)}}
line.markedSpans=removeMarkedSpan(line.markedSpans,span)
if(span.from==null&&this$1.collapsed&&!lineIsHidden(this$1.doc,line)&&cm)
{updateLineHeight(line,textHeight(cm.display))}}
if(cm&&this.collapsed&&!cm.options.lineWrapping){for(var i$1=0;i$1<this.lines.length;++i$1){var visual=visualLine(this$1.lines[i$1]),len=lineLength(visual)
if(len>cm.display.maxLineLength){cm.display.maxLine=visual
cm.display.maxLineLength=len
cm.display.maxLineChanged=true}}}
if(min!=null&&cm&&this.collapsed){regChange(cm,min,max+1)}
this.lines.length=0
this.explicitlyCleared=true
if(this.atomic&&this.doc.cantEdit){this.doc.cantEdit=false
if(cm){reCheckSelection(cm.doc)}}
if(cm){signalLater(cm,"markerCleared",cm,this)}
if(withOp){endOperation(cm)}
if(this.parent){this.parent.clear()}}



TextMarker.prototype.find=function(side,lineObj){var this$1=this;if(side==null&&this.type=="bookmark"){side=1}
var from,to
for(var i=0;i<this.lines.length;++i){var line=this$1.lines[i]
var span=getMarkedSpanFor(line.markedSpans,this$1)
if(span.from!=null){from=Pos(lineObj?line:lineNo(line),span.from)
if(side==-1){return from}}
if(span.to!=null){to=Pos(lineObj?line:lineNo(line),span.to)
if(side==1){return to}}}
return from&&{from:from,to:to}}

TextMarker.prototype.changed=function(){var pos=this.find(-1,true),widget=this,cm=this.doc.cm
if(!pos||!cm){return}
runInOp(cm,function(){var line=pos.line,lineN=lineNo(pos.line)
var view=findViewForLine(cm,lineN)
if(view){clearLineMeasurementCacheFor(view)
cm.curOp.selectionChanged=cm.curOp.forceUpdate=true}
cm.curOp.updateMaxLine=true
if(!lineIsHidden(widget.doc,line)&&widget.height!=null){var oldHeight=widget.height
widget.height=null
var dHeight=widgetHeight(widget)-oldHeight
if(dHeight)
{updateLineHeight(line,line.height+dHeight)}}})}
TextMarker.prototype.attachLine=function(line){if(!this.lines.length&&this.doc.cm){var op=this.doc.cm.curOp
if(!op.maybeHiddenMarkers||indexOf(op.maybeHiddenMarkers,this)==-1)
{(op.maybeUnhiddenMarkers||(op.maybeUnhiddenMarkers=[])).push(this)}}
this.lines.push(line)}
TextMarker.prototype.detachLine=function(line){this.lines.splice(indexOf(this.lines,line),1)
if(!this.lines.length&&this.doc.cm){var op=this.doc.cm.curOp;(op.maybeHiddenMarkers||(op.maybeHiddenMarkers=[])).push(this)}}
function markText(doc,from,to,options,type){

if(options&&options.shared){return markTextShared(doc,from,to,options,type)}
if(doc.cm&&!doc.cm.curOp){return operation(doc.cm,markText)(doc,from,to,options,type)}
var marker=new TextMarker(doc,type),diff=cmp(from,to)
if(options){copyObj(options,marker,false)} 
if(diff>0||diff==0&&marker.clearWhenEmpty!==false)
{return marker}
if(marker.replacedWith){marker.collapsed=true
marker.widgetNode=elt("span",[marker.replacedWith],"CodeMirror-widget")
if(!options.handleMouseEvents){marker.widgetNode.setAttribute("cm-ignore-events","true")}
if(options.insertLeft){marker.widgetNode.insertLeft=true}}
if(marker.collapsed){if(conflictingCollapsedRange(doc,from.line,from,to,marker)||from.line!=to.line&&conflictingCollapsedRange(doc,to.line,from,to,marker))
{throw new Error("Inserting collapsed marker partially overlapping an existing one")}
seeCollapsedSpans()}
if(marker.addToHistory)
{addChangeToHistory(doc,{from:from,to:to,origin:"markText"},doc.sel,NaN)}
var curLine=from.line,cm=doc.cm,updateMaxLine
doc.iter(curLine,to.line+1,function(line){if(cm&&marker.collapsed&&!cm.options.lineWrapping&&visualLine(line)==cm.display.maxLine)
{updateMaxLine=true}
if(marker.collapsed&&curLine!=from.line){updateLineHeight(line,0)}
addMarkedSpan(line,new MarkedSpan(marker,curLine==from.line?from.ch:null,curLine==to.line?to.ch:null))
++curLine}) 
if(marker.collapsed){doc.iter(from.line,to.line+1,function(line){if(lineIsHidden(doc,line)){updateLineHeight(line,0)}})}
if(marker.clearOnEnter){on(marker,"beforeCursorEnter",function(){return marker.clear();})}
if(marker.readOnly){seeReadOnlySpans()
if(doc.history.done.length||doc.history.undone.length)
{doc.clearHistory()}}
if(marker.collapsed){marker.id=++nextMarkerId
marker.atomic=true}
if(cm){ if(updateMaxLine){cm.curOp.updateMaxLine=true}
if(marker.collapsed)
{regChange(cm,from.line,to.line+1)}
else if(marker.className||marker.title||marker.startStyle||marker.endStyle||marker.css)
{for(var i=from.line;i<=to.line;i++){regLineChange(cm,i,"text")}}
if(marker.atomic){reCheckSelection(cm.doc)}
signalLater(cm,"markerAdded",cm,marker)}
return marker}



function SharedTextMarker(markers,primary){var this$1=this;this.markers=markers
this.primary=primary
for(var i=0;i<markers.length;++i)
{markers[i].parent=this$1}}
eventMixin(SharedTextMarker)
SharedTextMarker.prototype.clear=function(){var this$1=this;if(this.explicitlyCleared){return}
this.explicitlyCleared=true
for(var i=0;i<this.markers.length;++i)
{this$1.markers[i].clear()}
signalLater(this,"clear")}
SharedTextMarker.prototype.find=function(side,lineObj){return this.primary.find(side,lineObj)}
function markTextShared(doc,from,to,options,type){options=copyObj(options)
options.shared=false
var markers=[markText(doc,from,to,options,type)],primary=markers[0]
var widget=options.widgetNode
linkedDocs(doc,function(doc){if(widget){options.widgetNode=widget.cloneNode(true)}
markers.push(markText(doc,clipPos(doc,from),clipPos(doc,to),options,type))
for(var i=0;i<doc.linked.length;++i)
{if(doc.linked[i].isParent){return}}
primary=lst(markers)})
return new SharedTextMarker(markers,primary)}
function findSharedMarkers(doc){return doc.findMarks(Pos(doc.first,0),doc.clipPos(Pos(doc.lastLine())),function(m){return m.parent;})}
function copySharedMarkers(doc,markers){for(var i=0;i<markers.length;i++){var marker=markers[i],pos=marker.find()
var mFrom=doc.clipPos(pos.from),mTo=doc.clipPos(pos.to)
if(cmp(mFrom,mTo)){var subMark=markText(doc,mFrom,mTo,marker.primary,marker.primary.type)
marker.markers.push(subMark)
subMark.parent=marker}}}
function detachSharedMarkers(markers){var loop=function(i){var marker=markers[i],linked=[marker.primary.doc]
linkedDocs(marker.primary.doc,function(d){return linked.push(d);})
for(var j=0;j<marker.markers.length;j++){var subMarker=marker.markers[j]
if(indexOf(linked,subMarker.doc)==-1){subMarker.parent=null
marker.markers.splice(j--,1)}}};for(var i=0;i<markers.length;i++)loop(i);}
var nextDocId=0
var Doc=function(text,mode,firstLine,lineSep){if(!(this instanceof Doc)){return new Doc(text,mode,firstLine,lineSep)}
if(firstLine==null){firstLine=0}
BranchChunk.call(this,[new LeafChunk([new Line("",null)])])
this.first=firstLine
this.scrollTop=this.scrollLeft=0
this.cantEdit=false
this.cleanGeneration=1
this.frontier=firstLine
var start=Pos(firstLine,0)
this.sel=simpleSelection(start)
this.history=new History(null)
this.id=++nextDocId
this.modeOption=mode
this.lineSep=lineSep
this.extend=false
if(typeof text=="string"){text=this.splitLines(text)}
updateDoc(this,{from:start,to:start,text:text})
setSelection(this,simpleSelection(start),sel_dontScroll)}
Doc.prototype=createObj(BranchChunk.prototype,{constructor:Doc,


iter:function(from,to,op){if(op){this.iterN(from-this.first,to-from,op)}
else{this.iterN(this.first,this.first+this.size,from)}},insert:function(at,lines){var height=0
for(var i=0;i<lines.length;++i){height+=lines[i].height}
this.insertInner(at-this.first,lines,height)},remove:function(at,n){this.removeInner(at-this.first,n)},
getValue:function(lineSep){var lines=getLines(this,this.first,this.first+this.size)
if(lineSep===false){return lines}
return lines.join(lineSep||this.lineSeparator())},setValue:docMethodOp(function(code){var top=Pos(this.first,0),last=this.first+this.size-1
makeChange(this,{from:top,to:Pos(last,getLine(this,last).text.length),text:this.splitLines(code),origin:"setValue",full:true},true)
setSelection(this,simpleSelection(top))}),replaceRange:function(code,from,to,origin){from=clipPos(this,from)
to=to?clipPos(this,to):from
replaceRange(this,code,from,to,origin)},getRange:function(from,to,lineSep){var lines=getBetween(this,clipPos(this,from),clipPos(this,to))
if(lineSep===false){return lines}
return lines.join(lineSep||this.lineSeparator())},getLine:function(line){var l=this.getLineHandle(line);return l&&l.text},getLineHandle:function(line){if(isLine(this,line)){return getLine(this,line)}},getLineNumber:function(line){return lineNo(line)},getLineHandleVisualStart:function(line){if(typeof line=="number"){line=getLine(this,line)}
return visualLine(line)},lineCount:function(){return this.size},firstLine:function(){return this.first},lastLine:function(){return this.first+this.size-1},clipPos:function(pos){return clipPos(this,pos)},getCursor:function(start){var range=this.sel.primary(),pos
if(start==null||start=="head"){pos=range.head}
else if(start=="anchor"){pos=range.anchor}
else if(start=="end"||start=="to"||start===false){pos=range.to()}
else{pos=range.from()}
return pos},listSelections:function(){return this.sel.ranges},somethingSelected:function(){return this.sel.somethingSelected()},setCursor:docMethodOp(function(line,ch,options){setSimpleSelection(this,clipPos(this,typeof line=="number"?Pos(line,ch||0):line),null,options)}),setSelection:docMethodOp(function(anchor,head,options){setSimpleSelection(this,clipPos(this,anchor),clipPos(this,head||anchor),options)}),extendSelection:docMethodOp(function(head,other,options){extendSelection(this,clipPos(this,head),other&&clipPos(this,other),options)}),extendSelections:docMethodOp(function(heads,options){extendSelections(this,clipPosArray(this,heads),options)}),extendSelectionsBy:docMethodOp(function(f,options){var heads=map(this.sel.ranges,f)
extendSelections(this,clipPosArray(this,heads),options)}),setSelections:docMethodOp(function(ranges,primary,options){var this$1=this;if(!ranges.length){return}
var out=[]
for(var i=0;i<ranges.length;i++)
{out[i]=new Range(clipPos(this$1,ranges[i].anchor),clipPos(this$1,ranges[i].head))}
if(primary==null){primary=Math.min(ranges.length-1,this.sel.primIndex)}
setSelection(this,normalizeSelection(out,primary),options)}),addSelection:docMethodOp(function(anchor,head,options){var ranges=this.sel.ranges.slice(0)
ranges.push(new Range(clipPos(this,anchor),clipPos(this,head||anchor)))
setSelection(this,normalizeSelection(ranges,ranges.length-1),options)}),getSelection:function(lineSep){var this$1=this;var ranges=this.sel.ranges,lines
for(var i=0;i<ranges.length;i++){var sel=getBetween(this$1,ranges[i].from(),ranges[i].to())
lines=lines?lines.concat(sel):sel}
if(lineSep===false){return lines}
else{return lines.join(lineSep||this.lineSeparator())}},getSelections:function(lineSep){var this$1=this;var parts=[],ranges=this.sel.ranges
for(var i=0;i<ranges.length;i++){var sel=getBetween(this$1,ranges[i].from(),ranges[i].to())
if(lineSep!==false){sel=sel.join(lineSep||this$1.lineSeparator())}
parts[i]=sel}
return parts},replaceSelection:function(code,collapse,origin){var dup=[]
for(var i=0;i<this.sel.ranges.length;i++)
{dup[i]=code}
this.replaceSelections(dup,collapse,origin||"+input")},replaceSelections:docMethodOp(function(code,collapse,origin){var this$1=this;var changes=[],sel=this.sel
for(var i=0;i<sel.ranges.length;i++){var range=sel.ranges[i]
changes[i]={from:range.from(),to:range.to(),text:this$1.splitLines(code[i]),origin:origin}}
var newSel=collapse&&collapse!="end"&&computeReplacedSel(this,changes,collapse)
for(var i$1=changes.length-1;i$1>=0;i$1--)
{makeChange(this$1,changes[i$1])}
if(newSel){setSelectionReplaceHistory(this,newSel)}
else if(this.cm){ensureCursorVisible(this.cm)}}),undo:docMethodOp(function(){makeChangeFromHistory(this,"undo")}),redo:docMethodOp(function(){makeChangeFromHistory(this,"redo")}),undoSelection:docMethodOp(function(){makeChangeFromHistory(this,"undo",true)}),redoSelection:docMethodOp(function(){makeChangeFromHistory(this,"redo",true)}),setExtending:function(val){this.extend=val},getExtending:function(){return this.extend},historySize:function(){var hist=this.history,done=0,undone=0
for(var i=0;i<hist.done.length;i++){if(!hist.done[i].ranges){++done}}
for(var i$1=0;i$1<hist.undone.length;i$1++){if(!hist.undone[i$1].ranges){++undone}}
return{undo:done,redo:undone}},clearHistory:function(){this.history=new History(this.history.maxGeneration)},markClean:function(){this.cleanGeneration=this.changeGeneration(true)},changeGeneration:function(forceSplit){if(forceSplit)
{this.history.lastOp=this.history.lastSelOp=this.history.lastOrigin=null}
return this.history.generation},isClean:function(gen){return this.history.generation==(gen||this.cleanGeneration)},getHistory:function(){return{done:copyHistoryArray(this.history.done),undone:copyHistoryArray(this.history.undone)}},setHistory:function(histData){var hist=this.history=new History(this.history.maxGeneration)
hist.done=copyHistoryArray(histData.done.slice(0),null,true)
hist.undone=copyHistoryArray(histData.undone.slice(0),null,true)},setGutterMarker:docMethodOp(function(line,gutterID,value){return changeLine(this,line,"gutter",function(line){var markers=line.gutterMarkers||(line.gutterMarkers={})
markers[gutterID]=value
if(!value&&isEmpty(markers)){line.gutterMarkers=null}
return true})}),clearGutter:docMethodOp(function(gutterID){var this$1=this;var i=this.first
this.iter(function(line){if(line.gutterMarkers&&line.gutterMarkers[gutterID]){changeLine(this$1,line,"gutter",function(){line.gutterMarkers[gutterID]=null
if(isEmpty(line.gutterMarkers)){line.gutterMarkers=null}
return true})}
++i})}),lineInfo:function(line){var n
if(typeof line=="number"){if(!isLine(this,line)){return null}
n=line
line=getLine(this,line)
if(!line){return null}}else{n=lineNo(line)
if(n==null){return null}}
return{line:n,handle:line,text:line.text,gutterMarkers:line.gutterMarkers,textClass:line.textClass,bgClass:line.bgClass,wrapClass:line.wrapClass,widgets:line.widgets}},addLineClass:docMethodOp(function(handle,where,cls){return changeLine(this,handle,where=="gutter"?"gutter":"class",function(line){var prop=where=="text"?"textClass":where=="background"?"bgClass":where=="gutter"?"gutterClass":"wrapClass"
if(!line[prop]){line[prop]=cls}
else if(classTest(cls).test(line[prop])){return false}
else{line[prop]+=" "+cls}
return true})}),removeLineClass:docMethodOp(function(handle,where,cls){return changeLine(this,handle,where=="gutter"?"gutter":"class",function(line){var prop=where=="text"?"textClass":where=="background"?"bgClass":where=="gutter"?"gutterClass":"wrapClass"
var cur=line[prop]
if(!cur){return false}
else if(cls==null){line[prop]=null}
else{var found=cur.match(classTest(cls))
if(!found){return false}
var end=found.index+found[0].length
line[prop]=cur.slice(0,found.index)+(!found.index||end==cur.length?"":" ")+cur.slice(end)||null}
return true})}),addLineWidget:docMethodOp(function(handle,node,options){return addLineWidget(this,handle,node,options)}),removeLineWidget:function(widget){widget.clear()},markText:function(from,to,options){return markText(this,clipPos(this,from),clipPos(this,to),options,options&&options.type||"range")},setBookmark:function(pos,options){var realOpts={replacedWith:options&&(options.nodeType==null?options.widget:options),insertLeft:options&&options.insertLeft,clearWhenEmpty:false,shared:options&&options.shared,handleMouseEvents:options&&options.handleMouseEvents}
pos=clipPos(this,pos)
return markText(this,pos,pos,realOpts,"bookmark")},findMarksAt:function(pos){pos=clipPos(this,pos)
var markers=[],spans=getLine(this,pos.line).markedSpans
if(spans){for(var i=0;i<spans.length;++i){var span=spans[i]
if((span.from==null||span.from<=pos.ch)&&(span.to==null||span.to>=pos.ch))
{markers.push(span.marker.parent||span.marker)}}}
return markers},findMarks:function(from,to,filter){from=clipPos(this,from);to=clipPos(this,to)
var found=[],lineNo=from.line
this.iter(from.line,to.line+1,function(line){var spans=line.markedSpans
if(spans){for(var i=0;i<spans.length;i++){var span=spans[i]
if(!(span.to!=null&&lineNo==from.line&&from.ch>=span.to||span.from==null&&lineNo!=from.line||span.from!=null&&lineNo==to.line&&span.from>=to.ch)&&(!filter||filter(span.marker)))
{found.push(span.marker.parent||span.marker)}}}
++lineNo})
return found},getAllMarks:function(){var markers=[]
this.iter(function(line){var sps=line.markedSpans
if(sps){for(var i=0;i<sps.length;++i)
{if(sps[i].from!=null){markers.push(sps[i].marker)}}}})
return markers},posFromIndex:function(off){var ch,lineNo=this.first,sepSize=this.lineSeparator().length
this.iter(function(line){var sz=line.text.length+sepSize
if(sz>off){ch=off;return true}
off-=sz
++lineNo})
return clipPos(this,Pos(lineNo,ch))},indexFromPos:function(coords){coords=clipPos(this,coords)
var index=coords.ch
if(coords.line<this.first||coords.ch<0){return 0}
var sepSize=this.lineSeparator().length
this.iter(this.first,coords.line,function(line){ index+=line.text.length+sepSize})
return index},copy:function(copyHistory){var doc=new Doc(getLines(this,this.first,this.first+this.size),this.modeOption,this.first,this.lineSep)
doc.scrollTop=this.scrollTop;doc.scrollLeft=this.scrollLeft
doc.sel=this.sel
doc.extend=false
if(copyHistory){doc.history.undoDepth=this.history.undoDepth
doc.setHistory(this.getHistory())}
return doc},linkedDoc:function(options){if(!options){options={}}
var from=this.first,to=this.first+this.size
if(options.from!=null&&options.from>from){from=options.from}
if(options.to!=null&&options.to<to){to=options.to}
var copy=new Doc(getLines(this,from,to),options.mode||this.modeOption,from,this.lineSep)
if(options.sharedHist){copy.history=this.history;}(this.linked||(this.linked=[])).push({doc:copy,sharedHist:options.sharedHist})
copy.linked=[{doc:this,isParent:true,sharedHist:options.sharedHist}]
copySharedMarkers(copy,findSharedMarkers(this))
return copy},unlinkDoc:function(other){var this$1=this;if(other instanceof CodeMirror){other=other.doc}
if(this.linked){for(var i=0;i<this.linked.length;++i){var link=this$1.linked[i]
if(link.doc!=other){continue}
this$1.linked.splice(i,1)
other.unlinkDoc(this$1)
detachSharedMarkers(findSharedMarkers(this$1))
break}} 
if(other.history==this.history){var splitIds=[other.id]
linkedDocs(other,function(doc){return splitIds.push(doc.id);},true)
other.history=new History(null)
other.history.done=copyHistoryArray(this.history.done,splitIds)
other.history.undone=copyHistoryArray(this.history.undone,splitIds)}},iterLinkedDocs:function(f){linkedDocs(this,f)},getMode:function(){return this.mode},getEditor:function(){return this.cm},splitLines:function(str){if(this.lineSep){return str.split(this.lineSep)}
return splitLinesAuto(str)},lineSeparator:function(){return this.lineSep||"\n"}})
Doc.prototype.eachLine=Doc.prototype.iter


var lastDrop=0
function onDrop(e){var cm=this
clearDragCursor(cm)
if(signalDOMEvent(cm,e)||eventInWidget(cm.display,e))
{return}
e_preventDefault(e)
if(ie){lastDrop=+new Date}
var pos=posFromMouse(cm,e,true),files=e.dataTransfer.files
if(!pos||cm.isReadOnly()){return}

if(files&&files.length&&window.FileReader&&window.File){var n=files.length,text=Array(n),read=0
var loadFile=function(file,i){if(cm.options.allowDropFileTypes&&indexOf(cm.options.allowDropFileTypes,file.type)==-1)
{return}
var reader=new FileReader
reader.onload=operation(cm,function(){var content=reader.result
if(/[\x00-\x08\x0e-\x1f]{2}/.test(content)){content=""}
text[i]=content
if(++read==n){pos=clipPos(cm.doc,pos)
var change={from:pos,to:pos,text:cm.doc.splitLines(text.join(cm.doc.lineSeparator())),origin:"paste"}
makeChange(cm.doc,change)
setSelectionReplaceHistory(cm.doc,simpleSelection(pos,changeEnd(change)))}})
reader.readAsText(file)}
for(var i=0;i<n;++i){loadFile(files[i],i)}}else{
if(cm.state.draggingText&&cm.doc.sel.contains(pos)>-1){cm.state.draggingText(e) 
setTimeout(function(){return cm.display.input.focus();},20)
return}
try{var text$1=e.dataTransfer.getData("Text")
if(text$1){var selected
if(cm.state.draggingText&&!cm.state.draggingText.copy)
{selected=cm.listSelections()}
setSelectionNoUndo(cm.doc,simpleSelection(pos,pos))
if(selected){for(var i$1=0;i$1<selected.length;++i$1)
{replaceRange(cm.doc,"",selected[i$1].anchor,selected[i$1].head,"drag")}}
cm.replaceSelection(text$1,"around","paste")
cm.display.input.focus()}}
catch(e){}}}
function onDragStart(cm,e){if(ie&&(!cm.state.draggingText||+new Date-lastDrop<100)){e_stop(e);return}
if(signalDOMEvent(cm,e)||eventInWidget(cm.display,e)){return}
e.dataTransfer.setData("Text",cm.getSelection())
e.dataTransfer.effectAllowed="copyMove"
if(e.dataTransfer.setDragImage&&!safari){var img=elt("img",null,null,"position: fixed; left: 0; top: 0;")
img.src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
if(presto){img.width=img.height=1
cm.display.wrapper.appendChild(img) 
img._top=img.offsetTop}
e.dataTransfer.setDragImage(img,0,0)
if(presto){img.parentNode.removeChild(img)}}}
function onDragOver(cm,e){var pos=posFromMouse(cm,e)
if(!pos){return}
var frag=document.createDocumentFragment()
drawSelectionCursor(cm,pos,frag)
if(!cm.display.dragCursor){cm.display.dragCursor=elt("div",null,"CodeMirror-cursors CodeMirror-dragcursors")
cm.display.lineSpace.insertBefore(cm.display.dragCursor,cm.display.cursorDiv)}
removeChildrenAndAdd(cm.display.dragCursor,frag)}
function clearDragCursor(cm){if(cm.display.dragCursor){cm.display.lineSpace.removeChild(cm.display.dragCursor)
cm.display.dragCursor=null}}


function forEachCodeMirror(f){if(!document.body.getElementsByClassName){return}
var byClass=document.body.getElementsByClassName("CodeMirror")
for(var i=0;i<byClass.length;i++){var cm=byClass[i].CodeMirror
if(cm){f(cm)}}}
var globalsRegistered=false
function ensureGlobalHandlers(){if(globalsRegistered){return}
registerGlobalHandlers()
globalsRegistered=true}
function registerGlobalHandlers(){var resizeTimer
on(window,"resize",function(){if(resizeTimer==null){resizeTimer=setTimeout(function(){resizeTimer=null
forEachCodeMirror(onResize)},100)}}) 
on(window,"blur",function(){return forEachCodeMirror(onBlur);})}
function onResize(cm){var d=cm.display
if(d.lastWrapHeight==d.wrapper.clientHeight&&d.lastWrapWidth==d.wrapper.clientWidth)
{return}
d.cachedCharWidth=d.cachedTextHeight=d.cachedPaddingH=null
d.scrollbarsClipped=false
cm.setSize()}
var keyNames={3:"Enter",8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause",20:"CapsLock",27:"Esc",32:"Space",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",44:"PrintScrn",45:"Insert",46:"Delete",59:";",61:"=",91:"Mod",92:"Mod",93:"Mod",106:"*",107:"=",109:"-",110:".",111:"/",127:"Delete",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",63232:"Up",63233:"Down",63234:"Left",63235:"Right",63272:"Delete",63273:"Home",63275:"End",63276:"PageUp",63277:"PageDown",63302:"Insert"}
for(var i=0;i<10;i++){keyNames[i+48]=keyNames[i+96]=String(i)}
for(var i$1=65;i$1<=90;i$1++){keyNames[i$1]=String.fromCharCode(i$1)}
for(var i$2=1;i$2<=12;i$2++){keyNames[i$2+111]=keyNames[i$2+63235]="F"+i$2}
var keyMap={}
keyMap.basic={"Left":"goCharLeft","Right":"goCharRight","Up":"goLineUp","Down":"goLineDown","End":"goLineEnd","Home":"goLineStartSmart","PageUp":"goPageUp","PageDown":"goPageDown","Delete":"delCharAfter","Backspace":"delCharBefore","Shift-Backspace":"delCharBefore","Tab":"defaultTab","Shift-Tab":"indentAuto","Enter":"newlineAndIndent","Insert":"toggleOverwrite","Esc":"singleSelection"}


keyMap.pcDefault={"Ctrl-A":"selectAll","Ctrl-D":"deleteLine","Ctrl-Z":"undo","Shift-Ctrl-Z":"redo","Ctrl-Y":"redo","Ctrl-Home":"goDocStart","Ctrl-End":"goDocEnd","Ctrl-Up":"goLineUp","Ctrl-Down":"goLineDown","Ctrl-Left":"goGroupLeft","Ctrl-Right":"goGroupRight","Alt-Left":"goLineStart","Alt-Right":"goLineEnd","Ctrl-Backspace":"delGroupBefore","Ctrl-Delete":"delGroupAfter","Ctrl-S":"save","Ctrl-F":"find","Ctrl-G":"findNext","Shift-Ctrl-G":"findPrev","Shift-Ctrl-F":"replace","Shift-Ctrl-R":"replaceAll","Ctrl-[":"indentLess","Ctrl-]":"indentMore","Ctrl-U":"undoSelection","Shift-Ctrl-U":"redoSelection","Alt-U":"redoSelection",fallthrough:"basic"}
keyMap.emacsy={"Ctrl-F":"goCharRight","Ctrl-B":"goCharLeft","Ctrl-P":"goLineUp","Ctrl-N":"goLineDown","Alt-F":"goWordRight","Alt-B":"goWordLeft","Ctrl-A":"goLineStart","Ctrl-E":"goLineEnd","Ctrl-V":"goPageDown","Shift-Ctrl-V":"goPageUp","Ctrl-D":"delCharAfter","Ctrl-H":"delCharBefore","Alt-D":"delWordAfter","Alt-Backspace":"delWordBefore","Ctrl-K":"killLine","Ctrl-T":"transposeChars","Ctrl-O":"openLine"}
keyMap.macDefault={"Cmd-A":"selectAll","Cmd-D":"deleteLine","Cmd-Z":"undo","Shift-Cmd-Z":"redo","Cmd-Y":"redo","Cmd-Home":"goDocStart","Cmd-Up":"goDocStart","Cmd-End":"goDocEnd","Cmd-Down":"goDocEnd","Alt-Left":"goGroupLeft","Alt-Right":"goGroupRight","Cmd-Left":"goLineLeft","Cmd-Right":"goLineRight","Alt-Backspace":"delGroupBefore","Ctrl-Alt-Backspace":"delGroupAfter","Alt-Delete":"delGroupAfter","Cmd-S":"save","Cmd-F":"find","Cmd-G":"findNext","Shift-Cmd-G":"findPrev","Cmd-Alt-F":"replace","Shift-Cmd-Alt-F":"replaceAll","Cmd-[":"indentLess","Cmd-]":"indentMore","Cmd-Backspace":"delWrappedLineLeft","Cmd-Delete":"delWrappedLineRight","Cmd-U":"undoSelection","Shift-Cmd-U":"redoSelection","Ctrl-Up":"goDocStart","Ctrl-Down":"goDocEnd",fallthrough:["basic","emacsy"]}
keyMap["default"]=mac?keyMap.macDefault:keyMap.pcDefault

function normalizeKeyName(name){var parts=name.split(/-(?!$)/)
name=parts[parts.length-1]
var alt,ctrl,shift,cmd
for(var i=0;i<parts.length-1;i++){var mod=parts[i]
if(/^(cmd|meta|m)$/i.test(mod)){cmd=true}
else if(/^a(lt)?$/i.test(mod)){alt=true}
else if(/^(c|ctrl|control)$/i.test(mod)){ctrl=true}
else if(/^s(hift)?$/i.test(mod)){shift=true}
else{throw new Error("Unrecognized modifier name: "+mod)}}
if(alt){name="Alt-"+name}
if(ctrl){name="Ctrl-"+name}
if(cmd){name="Cmd-"+name}
if(shift){name="Shift-"+name}
return name}




function normalizeKeyMap(keymap){var copy={}
for(var keyname in keymap){if(keymap.hasOwnProperty(keyname)){var value=keymap[keyname]
if(/^(name|fallthrough|(de|at)tach)$/.test(keyname)){continue}
if(value=="..."){delete keymap[keyname];continue}
var keys=map(keyname.split(" "),normalizeKeyName)
for(var i=0;i<keys.length;i++){var val=(void 0),name=(void 0)
if(i==keys.length-1){name=keys.join(" ")
val=value}else{name=keys.slice(0,i+1).join(" ")
val="..."}
var prev=copy[name]
if(!prev){copy[name]=val}
else if(prev!=val){throw new Error("Inconsistent bindings for "+name)}}
delete keymap[keyname]}}
for(var prop in copy){keymap[prop]=copy[prop]}
return keymap}
function lookupKey(key,map,handle,context){map=getKeyMap(map)
var found=map.call?map.call(key,context):map[key]
if(found===false){return"nothing"}
if(found==="..."){return"multi"}
if(found!=null&&handle(found)){return"handled"}
if(map.fallthrough){if(Object.prototype.toString.call(map.fallthrough)!="[object Array]")
{return lookupKey(key,map.fallthrough,handle,context)}
for(var i=0;i<map.fallthrough.length;i++){var result=lookupKey(key,map.fallthrough[i],handle,context)
if(result){return result}}}}

function isModifierKey(value){var name=typeof value=="string"?value:keyNames[value.keyCode]
return name=="Ctrl"||name=="Alt"||name=="Shift"||name=="Mod"}
function keyName(event,noShift){if(presto&&event.keyCode==34&&event["char"]){return false}
var base=keyNames[event.keyCode],name=base
if(name==null||event.altGraphKey){return false}
if(event.altKey&&base!="Alt"){name="Alt-"+name}
if((flipCtrlCmd?event.metaKey:event.ctrlKey)&&base!="Ctrl"){name="Ctrl-"+name}
if((flipCtrlCmd?event.ctrlKey:event.metaKey)&&base!="Cmd"){name="Cmd-"+name}
if(!noShift&&event.shiftKey&&base!="Shift"){name="Shift-"+name}
return name}
function getKeyMap(val){return typeof val=="string"?keyMap[val]:val}

function deleteNearSelection(cm,compute){var ranges=cm.doc.sel.ranges,kill=[]

for(var i=0;i<ranges.length;i++){var toKill=compute(ranges[i])
while(kill.length&&cmp(toKill.from,lst(kill).to)<=0){var replaced=kill.pop()
if(cmp(replaced.from,toKill.from)<0){toKill.from=replaced.from
break}}
kill.push(toKill)}
runInOp(cm,function(){for(var i=kill.length-1;i>=0;i--)
{replaceRange(cm.doc,"",kill[i].from,kill[i].to,"+delete")}
ensureCursorVisible(cm)})}

var commands={selectAll:selectAll,singleSelection:function(cm){return cm.setSelection(cm.getCursor("anchor"),cm.getCursor("head"),sel_dontScroll);},killLine:function(cm){return deleteNearSelection(cm,function(range){if(range.empty()){var len=getLine(cm.doc,range.head.line).text.length
if(range.head.ch==len&&range.head.line<cm.lastLine())
{return{from:range.head,to:Pos(range.head.line+1,0)}}
else
{return{from:range.head,to:Pos(range.head.line,len)}}}else{return{from:range.from(),to:range.to()}}});},deleteLine:function(cm){return deleteNearSelection(cm,function(range){return({from:Pos(range.from().line,0),to:clipPos(cm.doc,Pos(range.to().line+1,0))});});},delLineLeft:function(cm){return deleteNearSelection(cm,function(range){return({from:Pos(range.from().line,0),to:range.from()});});},delWrappedLineLeft:function(cm){return deleteNearSelection(cm,function(range){var top=cm.charCoords(range.head,"div").top+5
var leftPos=cm.coordsChar({left:0,top:top},"div")
return{from:leftPos,to:range.from()}});},delWrappedLineRight:function(cm){return deleteNearSelection(cm,function(range){var top=cm.charCoords(range.head,"div").top+5
var rightPos=cm.coordsChar({left:cm.display.lineDiv.offsetWidth+100,top:top},"div")
return{from:range.from(),to:rightPos}});},undo:function(cm){return cm.undo();},redo:function(cm){return cm.redo();},undoSelection:function(cm){return cm.undoSelection();},redoSelection:function(cm){return cm.redoSelection();},goDocStart:function(cm){return cm.extendSelection(Pos(cm.firstLine(),0));},goDocEnd:function(cm){return cm.extendSelection(Pos(cm.lastLine()));},goLineStart:function(cm){return cm.extendSelectionsBy(function(range){return lineStart(cm,range.head.line);},{origin:"+move",bias:1});},goLineStartSmart:function(cm){return cm.extendSelectionsBy(function(range){return lineStartSmart(cm,range.head);},{origin:"+move",bias:1});},goLineEnd:function(cm){return cm.extendSelectionsBy(function(range){return lineEnd(cm,range.head.line);},{origin:"+move",bias:-1});},goLineRight:function(cm){return cm.extendSelectionsBy(function(range){var top=cm.charCoords(range.head,"div").top+5
return cm.coordsChar({left:cm.display.lineDiv.offsetWidth+100,top:top},"div")},sel_move);},goLineLeft:function(cm){return cm.extendSelectionsBy(function(range){var top=cm.charCoords(range.head,"div").top+5
return cm.coordsChar({left:0,top:top},"div")},sel_move);},goLineLeftSmart:function(cm){return cm.extendSelectionsBy(function(range){var top=cm.charCoords(range.head,"div").top+5
var pos=cm.coordsChar({left:0,top:top},"div")
if(pos.ch<cm.getLine(pos.line).search(/\S/)){return lineStartSmart(cm,range.head)}
return pos},sel_move);},goLineUp:function(cm){return cm.moveV(-1,"line");},goLineDown:function(cm){return cm.moveV(1,"line");},goPageUp:function(cm){return cm.moveV(-1,"page");},goPageDown:function(cm){return cm.moveV(1,"page");},goCharLeft:function(cm){return cm.moveH(-1,"char");},goCharRight:function(cm){return cm.moveH(1,"char");},goColumnLeft:function(cm){return cm.moveH(-1,"column");},goColumnRight:function(cm){return cm.moveH(1,"column");},goWordLeft:function(cm){return cm.moveH(-1,"word");},goGroupRight:function(cm){return cm.moveH(1,"group");},goGroupLeft:function(cm){return cm.moveH(-1,"group");},goWordRight:function(cm){return cm.moveH(1,"word");},delCharBefore:function(cm){return cm.deleteH(-1,"char");},delCharAfter:function(cm){return cm.deleteH(1,"char");},delWordBefore:function(cm){return cm.deleteH(-1,"word");},delWordAfter:function(cm){return cm.deleteH(1,"word");},delGroupBefore:function(cm){return cm.deleteH(-1,"group");},delGroupAfter:function(cm){return cm.deleteH(1,"group");},indentAuto:function(cm){return cm.indentSelection("smart");},indentMore:function(cm){return cm.indentSelection("add");},indentLess:function(cm){return cm.indentSelection("subtract");},insertTab:function(cm){return cm.replaceSelection("\t");},insertSoftTab:function(cm){var spaces=[],ranges=cm.listSelections(),tabSize=cm.options.tabSize
for(var i=0;i<ranges.length;i++){var pos=ranges[i].from()
var col=countColumn(cm.getLine(pos.line),pos.ch,tabSize)
spaces.push(spaceStr(tabSize-col%tabSize))}
cm.replaceSelections(spaces)},defaultTab:function(cm){if(cm.somethingSelected()){cm.indentSelection("add")}
else{cm.execCommand("insertTab")}},transposeChars:function(cm){return runInOp(cm,function(){var ranges=cm.listSelections(),newSel=[]
for(var i=0;i<ranges.length;i++){if(!ranges[i].empty()){continue}
var cur=ranges[i].head,line=getLine(cm.doc,cur.line).text
if(line){if(cur.ch==line.length){cur=new Pos(cur.line,cur.ch-1)}
if(cur.ch>0){cur=new Pos(cur.line,cur.ch+1)
cm.replaceRange(line.charAt(cur.ch-1)+line.charAt(cur.ch-2),Pos(cur.line,cur.ch-2),cur,"+transpose")}else if(cur.line>cm.doc.first){var prev=getLine(cm.doc,cur.line-1).text
if(prev){cur=new Pos(cur.line,1)
cm.replaceRange(line.charAt(0)+cm.doc.lineSeparator()+
prev.charAt(prev.length-1),Pos(cur.line-1,prev.length-1),cur,"+transpose")}}}
newSel.push(new Range(cur,cur))}
cm.setSelections(newSel)});},newlineAndIndent:function(cm){return runInOp(cm,function(){var sels=cm.listSelections()
for(var i=sels.length-1;i>=0;i--)
{cm.replaceRange(cm.doc.lineSeparator(),sels[i].anchor,sels[i].head,"+input")}
sels=cm.listSelections()
for(var i$1=0;i$1<sels.length;i$1++)
{cm.indentLine(sels[i$1].from().line,null,true)}
ensureCursorVisible(cm)});},openLine:function(cm){return cm.replaceSelection("\n","start");},toggleOverwrite:function(cm){return cm.toggleOverwrite();}}
function lineStart(cm,lineN){var line=getLine(cm.doc,lineN)
var visual=visualLine(line)
if(visual!=line){lineN=lineNo(visual)}
var order=getOrder(visual)
var ch=!order?0:order[0].level%2?lineRight(visual):lineLeft(visual)
return Pos(lineN,ch)}
function lineEnd(cm,lineN){var merged,line=getLine(cm.doc,lineN)
while(merged=collapsedSpanAtEnd(line)){line=merged.find(1,true).line
lineN=null}
var order=getOrder(line)
var ch=!order?line.text.length:order[0].level%2?lineLeft(line):lineRight(line)
return Pos(lineN==null?lineNo(line):lineN,ch)}
function lineStartSmart(cm,pos){var start=lineStart(cm,pos.line)
var line=getLine(cm.doc,start.line)
var order=getOrder(line)
if(!order||order[0].level==0){var firstNonWS=Math.max(0,line.text.search(/\S/))
var inWS=pos.line==start.line&&pos.ch<=firstNonWS&&pos.ch
return Pos(start.line,inWS?0:firstNonWS)}
return start}
function doHandleBinding(cm,bound,dropShift){if(typeof bound=="string"){bound=commands[bound]
if(!bound){return false}}
 
cm.display.input.ensurePolled()
var prevShift=cm.display.shift,done=false
try{if(cm.isReadOnly()){cm.state.suppressEdits=true}
if(dropShift){cm.display.shift=false}
done=bound(cm)!=Pass}finally{cm.display.shift=prevShift
cm.state.suppressEdits=false}
return done}
function lookupKeyForEditor(cm,name,handle){for(var i=0;i<cm.state.keyMaps.length;i++){var result=lookupKey(name,cm.state.keyMaps[i],handle,cm)
if(result){return result}}
return(cm.options.extraKeys&&lookupKey(name,cm.options.extraKeys,handle,cm))||lookupKey(name,cm.options.keyMap,handle,cm)}
var stopSeq=new Delayed
function dispatchKey(cm,name,e,handle){var seq=cm.state.keySeq
if(seq){if(isModifierKey(name)){return"handled"}
stopSeq.set(50,function(){if(cm.state.keySeq==seq){cm.state.keySeq=null
cm.display.input.reset()}})
name=seq+" "+name}
var result=lookupKeyForEditor(cm,name,handle)
if(result=="multi")
{cm.state.keySeq=name}
if(result=="handled")
{signalLater(cm,"keyHandled",cm,name,e)}
if(result=="handled"||result=="multi"){e_preventDefault(e)
restartBlink(cm)}
if(seq&&!result&&/\'$/.test(name)){e_preventDefault(e)
return true}
return!!result}
function handleKeyBinding(cm,e){var name=keyName(e,true)
if(!name){return false}
if(e.shiftKey&&!cm.state.keySeq){

return dispatchKey(cm,"Shift-"+name,e,function(b){return doHandleBinding(cm,b,true);})||dispatchKey(cm,name,e,function(b){if(typeof b=="string"?/^go[A-Z]/.test(b):b.motion)
{return doHandleBinding(cm,b)}})}else{return dispatchKey(cm,name,e,function(b){return doHandleBinding(cm,b);})}}
function handleCharBinding(cm,e,ch){return dispatchKey(cm,"'"+ch+"'",e,function(b){return doHandleBinding(cm,b,true);})}
var lastStoppedKey=null
function onKeyDown(e){var cm=this
cm.curOp.focus=activeElt()
if(signalDOMEvent(cm,e)){return}
if(ie&&ie_version<11&&e.keyCode==27){e.returnValue=false}
var code=e.keyCode
cm.display.shift=code==16||e.shiftKey
var handled=handleKeyBinding(cm,e)
if(presto){lastStoppedKey=handled?code:null
 
if(!handled&&code==88&&!hasCopyEvent&&(mac?e.metaKey:e.ctrlKey))
{cm.replaceSelection("",null,"cut")}}
if(code==18&&!/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className))
{showCrossHair(cm)}}
function showCrossHair(cm){var lineDiv=cm.display.lineDiv
addClass(lineDiv,"CodeMirror-crosshair")
function up(e){if(e.keyCode==18||!e.altKey){rmClass(lineDiv,"CodeMirror-crosshair")
off(document,"keyup",up)
off(document,"mouseover",up)}}
on(document,"keyup",up)
on(document,"mouseover",up)}
function onKeyUp(e){if(e.keyCode==16){this.doc.sel.shift=false}
signalDOMEvent(this,e)}
function onKeyPress(e){var cm=this
if(eventInWidget(cm.display,e)||signalDOMEvent(cm,e)||e.ctrlKey&&!e.altKey||mac&&e.metaKey){return}
var keyCode=e.keyCode,charCode=e.charCode
if(presto&&keyCode==lastStoppedKey){lastStoppedKey=null;e_preventDefault(e);return}
if((presto&&(!e.which||e.which<10))&&handleKeyBinding(cm,e)){return}
var ch=String.fromCharCode(charCode==null?keyCode:charCode) 
if(ch=="\x08"){return}
if(handleCharBinding(cm,e,ch)){return}
cm.display.input.onKeyPress(e)}



function onMouseDown(e){var cm=this,display=cm.display
if(signalDOMEvent(cm,e)||display.activeTouch&&display.input.supportsTouch()){return}
display.input.ensurePolled()
display.shift=e.shiftKey
if(eventInWidget(display,e)){if(!webkit){
display.scroller.draggable=false
setTimeout(function(){return display.scroller.draggable=true;},100)}
return}
if(clickInGutter(cm,e)){return}
var start=posFromMouse(cm,e)
window.focus()
switch(e_button(e)){case 1: if(cm.state.selectingText)
{cm.state.selectingText(e)}
else if(start)
{leftButtonDown(cm,e,start)}
else if(e_target(e)==display.scroller)
{e_preventDefault(e)}
break
case 2:if(webkit){cm.state.lastMiddleDown=+new Date}
if(start){extendSelection(cm.doc,start)}
setTimeout(function(){return display.input.focus();},20)
e_preventDefault(e)
break
case 3:if(captureRightClick){onContextMenu(cm,e)}
else{delayBlurEvent(cm)}
break}}
var lastClick;var lastDoubleClick;function leftButtonDown(cm,e,start){if(ie){setTimeout(bind(ensureFocus,cm),0)}
else{cm.curOp.focus=activeElt()}
var now=+new Date,type
if(lastDoubleClick&&lastDoubleClick.time>now-400&&cmp(lastDoubleClick.pos,start)==0){type="triple"}else if(lastClick&&lastClick.time>now-400&&cmp(lastClick.pos,start)==0){type="double"
lastDoubleClick={time:now,pos:start}}else{type="single"
lastClick={time:now,pos:start}}
var sel=cm.doc.sel,modifier=mac?e.metaKey:e.ctrlKey,contained
if(cm.options.dragDrop&&dragAndDrop&&!cm.isReadOnly()&&type=="single"&&(contained=sel.contains(start))>-1&&(cmp((contained=sel.ranges[contained]).from(),start)<0||start.xRel>0)&&(cmp(contained.to(),start)>0||start.xRel<0))
{leftButtonStartDrag(cm,e,start,modifier)}
else
{leftButtonSelect(cm,e,start,type,modifier)}}

function leftButtonStartDrag(cm,e,start,modifier){var display=cm.display,startTime=+new Date
var dragEnd=operation(cm,function(e2){if(webkit){display.scroller.draggable=false}
cm.state.draggingText=false
off(document,"mouseup",dragEnd)
off(display.scroller,"drop",dragEnd)
if(Math.abs(e.clientX-e2.clientX)+Math.abs(e.clientY-e2.clientY)<10){e_preventDefault(e2)
if(!modifier&&+new Date-200<startTime)
{extendSelection(cm.doc,start)}
if(webkit||ie&&ie_version==9)
{setTimeout(function(){document.body.focus();display.input.focus()},20)}
else
{display.input.focus()}}})
if(webkit){display.scroller.draggable=true}
cm.state.draggingText=dragEnd
dragEnd.copy=mac?e.altKey:e.ctrlKey
 
if(display.scroller.dragDrop){display.scroller.dragDrop()}
on(document,"mouseup",dragEnd)
on(display.scroller,"drop",dragEnd)}
function leftButtonSelect(cm,e,start,type,addNew){var display=cm.display,doc=cm.doc
e_preventDefault(e)
var ourRange,ourIndex,startSel=doc.sel,ranges=startSel.ranges
if(addNew&&!e.shiftKey){ourIndex=doc.sel.contains(start)
if(ourIndex>-1)
{ourRange=ranges[ourIndex]}
else
{ourRange=new Range(start,start)}}else{ourRange=doc.sel.primary()
ourIndex=doc.sel.primIndex}
if(chromeOS?e.shiftKey&&e.metaKey:e.altKey){type="rect"
if(!addNew){ourRange=new Range(start,start)}
start=posFromMouse(cm,e,true,true)
ourIndex=-1}else if(type=="double"){var word=cm.findWordAt(start)
if(cm.display.shift||doc.extend)
{ourRange=extendRange(doc,ourRange,word.anchor,word.head)}
else
{ourRange=word}}else if(type=="triple"){var line=new Range(Pos(start.line,0),clipPos(doc,Pos(start.line+1,0)))
if(cm.display.shift||doc.extend)
{ourRange=extendRange(doc,ourRange,line.anchor,line.head)}
else
{ourRange=line}}else{ourRange=extendRange(doc,ourRange,start)}
if(!addNew){ourIndex=0
setSelection(doc,new Selection([ourRange],0),sel_mouse)
startSel=doc.sel}else if(ourIndex==-1){ourIndex=ranges.length
setSelection(doc,normalizeSelection(ranges.concat([ourRange]),ourIndex),{scroll:false,origin:"*mouse"})}else if(ranges.length>1&&ranges[ourIndex].empty()&&type=="single"&&!e.shiftKey){setSelection(doc,normalizeSelection(ranges.slice(0,ourIndex).concat(ranges.slice(ourIndex+1)),0),{scroll:false,origin:"*mouse"})
startSel=doc.sel}else{replaceOneSelection(doc,ourIndex,ourRange,sel_mouse)}
var lastPos=start
function extendTo(pos){if(cmp(lastPos,pos)==0){return}
lastPos=pos
if(type=="rect"){var ranges=[],tabSize=cm.options.tabSize
var startCol=countColumn(getLine(doc,start.line).text,start.ch,tabSize)
var posCol=countColumn(getLine(doc,pos.line).text,pos.ch,tabSize)
var left=Math.min(startCol,posCol),right=Math.max(startCol,posCol)
for(var line=Math.min(start.line,pos.line),end=Math.min(cm.lastLine(),Math.max(start.line,pos.line));line<=end;line++){var text=getLine(doc,line).text,leftPos=findColumn(text,left,tabSize)
if(left==right)
{ranges.push(new Range(Pos(line,leftPos),Pos(line,leftPos)))}
else if(text.length>leftPos)
{ranges.push(new Range(Pos(line,leftPos),Pos(line,findColumn(text,right,tabSize))))}}
if(!ranges.length){ranges.push(new Range(start,start))}
setSelection(doc,normalizeSelection(startSel.ranges.slice(0,ourIndex).concat(ranges),ourIndex),{origin:"*mouse",scroll:false})
cm.scrollIntoView(pos)}else{var oldRange=ourRange
var anchor=oldRange.anchor,head=pos
if(type!="single"){var range
if(type=="double")
{range=cm.findWordAt(pos)}
else
{range=new Range(Pos(pos.line,0),clipPos(doc,Pos(pos.line+1,0)))}
if(cmp(range.anchor,anchor)>0){head=range.head
anchor=minPos(oldRange.from(),range.anchor)}else{head=range.anchor
anchor=maxPos(oldRange.to(),range.head)}}
var ranges$1=startSel.ranges.slice(0)
ranges$1[ourIndex]=new Range(clipPos(doc,anchor),head)
setSelection(doc,normalizeSelection(ranges$1,ourIndex),sel_mouse)}}
var editorSize=display.wrapper.getBoundingClientRect()


var counter=0
function extend(e){var curCount=++counter
var cur=posFromMouse(cm,e,true,type=="rect")
if(!cur){return}
if(cmp(cur,lastPos)!=0){cm.curOp.focus=activeElt()
extendTo(cur)
var visible=visibleLines(display,doc)
if(cur.line>=visible.to||cur.line<visible.from)
{setTimeout(operation(cm,function(){if(counter==curCount){extend(e)}}),150)}}else{var outside=e.clientY<editorSize.top?-20:e.clientY>editorSize.bottom?20:0
if(outside){setTimeout(operation(cm,function(){if(counter!=curCount){return}
display.scroller.scrollTop+=outside
extend(e)}),50)}}}
function done(e){cm.state.selectingText=false
counter=Infinity
e_preventDefault(e)
display.input.focus()
off(document,"mousemove",move)
off(document,"mouseup",up)
doc.history.lastSelOrigin=null}
var move=operation(cm,function(e){if(!e_button(e)){done(e)}
else{extend(e)}})
var up=operation(cm,done)
cm.state.selectingText=up
on(document,"mousemove",move)
on(document,"mouseup",up)}

function gutterEvent(cm,e,type,prevent){var mX,mY
try{mX=e.clientX;mY=e.clientY}
catch(e){return false}
if(mX>=Math.floor(cm.display.gutters.getBoundingClientRect().right)){return false}
if(prevent){e_preventDefault(e)}
var display=cm.display
var lineBox=display.lineDiv.getBoundingClientRect()
if(mY>lineBox.bottom||!hasHandler(cm,type)){return e_defaultPrevented(e)}
mY-=lineBox.top-display.viewOffset
for(var i=0;i<cm.options.gutters.length;++i){var g=display.gutters.childNodes[i]
if(g&&g.getBoundingClientRect().right>=mX){var line=lineAtHeight(cm.doc,mY)
var gutter=cm.options.gutters[i]
signal(cm,type,cm,line,gutter,e)
return e_defaultPrevented(e)}}}
function clickInGutter(cm,e){return gutterEvent(cm,e,"gutterClick",true)}



function onContextMenu(cm,e){if(eventInWidget(cm.display,e)||contextMenuInGutter(cm,e)){return}
if(signalDOMEvent(cm,e,"contextmenu")){return}
cm.display.input.onContextMenu(e)}
function contextMenuInGutter(cm,e){if(!hasHandler(cm,"gutterContextMenu")){return false}
return gutterEvent(cm,e,"gutterContextMenu",false)}
function themeChanged(cm){cm.display.wrapper.className=cm.display.wrapper.className.replace(/\s*cm-s-\S+/g,"")+
cm.options.theme.replace(/(^|\s)\s*/g," cm-s-")
clearCaches(cm)}
var Init={toString:function(){return"CodeMirror.Init"}}
var defaults={}
var optionHandlers={}
function defineOptions(CodeMirror){var optionHandlers=CodeMirror.optionHandlers
function option(name,deflt,handle,notOnInit){CodeMirror.defaults[name]=deflt
if(handle){optionHandlers[name]=notOnInit?function(cm,val,old){if(old!=Init){handle(cm,val,old)}}:handle}}
CodeMirror.defineOption=option

CodeMirror.Init=Init


option("value","",function(cm,val){return cm.setValue(val);},true)
option("mode",null,function(cm,val){cm.doc.modeOption=val
loadMode(cm)},true)
option("indentUnit",2,loadMode,true)
option("indentWithTabs",false)
option("smartIndent",true)
option("tabSize",4,function(cm){resetModeState(cm)
clearCaches(cm)
regChange(cm)},true)
option("lineSeparator",null,function(cm,val){cm.doc.lineSep=val
if(!val){return}
var newBreaks=[],lineNo=cm.doc.first
cm.doc.iter(function(line){for(var pos=0;;){var found=line.text.indexOf(val,pos)
if(found==-1){break}
pos=found+val.length
newBreaks.push(Pos(lineNo,found))}
lineNo++})
for(var i=newBreaks.length-1;i>=0;i--)
{replaceRange(cm.doc,val,newBreaks[i],Pos(newBreaks[i].line,newBreaks[i].ch+val.length))}})
option("specialChars",/[\u0000-\u001f\u007f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/g,function(cm,val,old){cm.state.specialChars=new RegExp(val.source+(val.test("\t")?"":"|\t"),"g")
if(old!=Init){cm.refresh()}})
option("specialCharPlaceholder",defaultSpecialCharPlaceholder,function(cm){return cm.refresh();},true)
option("electricChars",true)
option("inputStyle",mobile?"contenteditable":"textarea",function(){throw new Error("inputStyle can not (yet) be changed in a running editor")
},true)
option("spellcheck",false,function(cm,val){return cm.getInputField().spellcheck=val;},true)
option("rtlMoveVisually",!windows)
option("wholeLineUpdateBefore",true)
option("theme","default",function(cm){themeChanged(cm)
guttersChanged(cm)},true)
option("keyMap","default",function(cm,val,old){var next=getKeyMap(val)
var prev=old!=Init&&getKeyMap(old)
if(prev&&prev.detach){prev.detach(cm,next)}
if(next.attach){next.attach(cm,prev||null)}})
option("extraKeys",null)
option("lineWrapping",false,wrappingChanged,true)
option("gutters",[],function(cm){setGuttersForLineNumbers(cm.options)
guttersChanged(cm)},true)
option("fixedGutter",true,function(cm,val){cm.display.gutters.style.left=val?compensateForHScroll(cm.display)+"px":"0"
cm.refresh()},true)
option("coverGutterNextToScrollbar",false,function(cm){return updateScrollbars(cm);},true)
option("scrollbarStyle","native",function(cm){initScrollbars(cm)
updateScrollbars(cm)
cm.display.scrollbars.setScrollTop(cm.doc.scrollTop)
cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft)},true)
option("lineNumbers",false,function(cm){setGuttersForLineNumbers(cm.options)
guttersChanged(cm)},true)
option("firstLineNumber",1,guttersChanged,true)
option("lineNumberFormatter",function(integer){return integer;},guttersChanged,true)
option("showCursorWhenSelecting",false,updateSelection,true)
option("resetSelectionOnContextMenu",true)
option("lineWiseCopyCut",true)
option("readOnly",false,function(cm,val){if(val=="nocursor"){onBlur(cm)
cm.display.input.blur()
cm.display.disabled=true}else{cm.display.disabled=false}
cm.display.input.readOnlyChanged(val)})
option("disableInput",false,function(cm,val){if(!val){cm.display.input.reset()}},true)
option("dragDrop",true,dragDropChanged)
option("allowDropFileTypes",null)
option("cursorBlinkRate",530)
option("cursorScrollMargin",0)
option("cursorHeight",1,updateSelection,true)
option("singleCursorHeightPerLine",true,updateSelection,true)
option("workTime",100)
option("workDelay",100)
option("flattenSpans",true,resetModeState,true)
option("addModeClass",false,resetModeState,true)
option("pollInterval",100)
option("undoDepth",200,function(cm,val){return cm.doc.history.undoDepth=val;})
option("historyEventDelay",1250)
option("viewportMargin",10,function(cm){return cm.refresh();},true)
option("maxHighlightLength",10000,resetModeState,true)
option("moveInputWithCursor",true,function(cm,val){if(!val){cm.display.input.resetPosition()}})
option("tabindex",null,function(cm,val){return cm.display.input.getField().tabIndex=val||"";})
option("autofocus",null)}
function guttersChanged(cm){updateGutters(cm)
regChange(cm)
alignHorizontally(cm)}
function dragDropChanged(cm,value,old){var wasOn=old&&old!=Init
if(!value!=!wasOn){var funcs=cm.display.dragFunctions
var toggle=value?on:off
toggle(cm.display.scroller,"dragstart",funcs.start)
toggle(cm.display.scroller,"dragenter",funcs.enter)
toggle(cm.display.scroller,"dragover",funcs.over)
toggle(cm.display.scroller,"dragleave",funcs.leave)
toggle(cm.display.scroller,"drop",funcs.drop)}}
function wrappingChanged(cm){if(cm.options.lineWrapping){addClass(cm.display.wrapper,"CodeMirror-wrap")
cm.display.sizer.style.minWidth=""
cm.display.sizerWidth=null}else{rmClass(cm.display.wrapper,"CodeMirror-wrap")
findMaxLine(cm)}
estimateLineHeights(cm)
regChange(cm)
clearCaches(cm)
setTimeout(function(){return updateScrollbars(cm);},100)}

function CodeMirror(place,options){var this$1=this;if(!(this instanceof CodeMirror)){return new CodeMirror(place,options)}
this.options=options=options?copyObj(options):{}
copyObj(defaults,options,false)
setGuttersForLineNumbers(options)
var doc=options.value
if(typeof doc=="string"){doc=new Doc(doc,options.mode,null,options.lineSeparator)}
this.doc=doc
var input=new CodeMirror.inputStyles[options.inputStyle](this)
var display=this.display=new Display(place,doc,input)
display.wrapper.CodeMirror=this
updateGutters(this)
themeChanged(this)
if(options.lineWrapping)
{this.display.wrapper.className+=" CodeMirror-wrap"}
initScrollbars(this)
this.state={keyMaps:[], overlays:[], modeGen:0, overwrite:false,delayingBlurEvent:false,focused:false,suppressEdits:false, pasteIncoming:false,cutIncoming:false, selectingText:false,draggingText:false,highlight:new Delayed(), keySeq:null, specialChars:null}
if(options.autofocus&&!mobile){display.input.focus()}
 
if(ie&&ie_version<11){setTimeout(function(){return this$1.display.input.reset(true);},20)}
registerEventHandlers(this)
ensureGlobalHandlers()
startOperation(this)
this.curOp.forceUpdate=true
attachDoc(this,doc)
if((options.autofocus&&!mobile)||this.hasFocus())
{setTimeout(bind(onFocus,this),20)}
else
{onBlur(this)}
for(var opt in optionHandlers){if(optionHandlers.hasOwnProperty(opt))
{optionHandlers[opt](this$1,options[opt],Init)}}
maybeUpdateLineNumberWidth(this)
if(options.finishInit){options.finishInit(this)}
for(var i=0;i<initHooks.length;++i){initHooks[i](this$1)}
endOperation(this)

if(webkit&&options.lineWrapping&&getComputedStyle(display.lineDiv).textRendering=="optimizelegibility")
{display.lineDiv.style.textRendering="auto"}}
CodeMirror.defaults=defaults

CodeMirror.optionHandlers=optionHandlers

function registerEventHandlers(cm){var d=cm.display
on(d.scroller,"mousedown",operation(cm,onMouseDown)) 
if(ie&&ie_version<11)
{on(d.scroller,"dblclick",operation(cm,function(e){if(signalDOMEvent(cm,e)){return}
var pos=posFromMouse(cm,e)
if(!pos||clickInGutter(cm,e)||eventInWidget(cm.display,e)){return}
e_preventDefault(e)
var word=cm.findWordAt(pos)
extendSelection(cm.doc,word.anchor,word.head)}))}
else
{on(d.scroller,"dblclick",function(e){return signalDOMEvent(cm,e)||e_preventDefault(e);})}


if(!captureRightClick){on(d.scroller,"contextmenu",function(e){return onContextMenu(cm,e);})} 
var touchFinished,prevTouch={end:0}
function finishTouch(){if(d.activeTouch){touchFinished=setTimeout(function(){return d.activeTouch=null;},1000)
prevTouch=d.activeTouch
prevTouch.end=+new Date}}
function isMouseLikeTouchEvent(e){if(e.touches.length!=1){return false}
var touch=e.touches[0]
return touch.radiusX<=1&&touch.radiusY<=1}
function farAway(touch,other){if(other.left==null){return true}
var dx=other.left-touch.left,dy=other.top-touch.top
return dx*dx+dy*dy>20*20}
on(d.scroller,"touchstart",function(e){if(!signalDOMEvent(cm,e)&&!isMouseLikeTouchEvent(e)){d.input.ensurePolled()
clearTimeout(touchFinished)
var now=+new Date
d.activeTouch={start:now,moved:false,prev:now-prevTouch.end<=300?prevTouch:null}
if(e.touches.length==1){d.activeTouch.left=e.touches[0].pageX
d.activeTouch.top=e.touches[0].pageY}}})
on(d.scroller,"touchmove",function(){if(d.activeTouch){d.activeTouch.moved=true}})
on(d.scroller,"touchend",function(e){var touch=d.activeTouch
if(touch&&!eventInWidget(d,e)&&touch.left!=null&&!touch.moved&&new Date-touch.start<300){var pos=cm.coordsChar(d.activeTouch,"page"),range
if(!touch.prev||farAway(touch,touch.prev))
{range=new Range(pos,pos)}
else if(!touch.prev.prev||farAway(touch,touch.prev.prev))
{range=cm.findWordAt(pos)}
else
{range=new Range(Pos(pos.line,0),clipPos(cm.doc,Pos(pos.line+1,0)))}
cm.setSelection(range.anchor,range.head)
cm.focus()
e_preventDefault(e)}
finishTouch()})
on(d.scroller,"touchcancel",finishTouch)

on(d.scroller,"scroll",function(){if(d.scroller.clientHeight){setScrollTop(cm,d.scroller.scrollTop)
setScrollLeft(cm,d.scroller.scrollLeft,true)
signal(cm,"scroll",cm)}})
on(d.scroller,"mousewheel",function(e){return onScrollWheel(cm,e);})
on(d.scroller,"DOMMouseScroll",function(e){return onScrollWheel(cm,e);}) 
on(d.wrapper,"scroll",function(){return d.wrapper.scrollTop=d.wrapper.scrollLeft=0;})
d.dragFunctions={enter:function(e){if(!signalDOMEvent(cm,e)){e_stop(e)}},over:function(e){if(!signalDOMEvent(cm,e)){onDragOver(cm,e);e_stop(e)}},start:function(e){return onDragStart(cm,e);},drop:operation(cm,onDrop),leave:function(e){if(!signalDOMEvent(cm,e)){clearDragCursor(cm)}}}
var inp=d.input.getField()
on(inp,"keyup",function(e){return onKeyUp.call(cm,e);})
on(inp,"keydown",operation(cm,onKeyDown))
on(inp,"keypress",operation(cm,onKeyPress))
on(inp,"focus",function(e){return onFocus(cm,e);})
on(inp,"blur",function(e){return onBlur(cm,e);})}
var initHooks=[]
CodeMirror.defineInitHook=function(f){return initHooks.push(f);}



function indentLine(cm,n,how,aggressive){var doc=cm.doc,state
if(how==null){how="add"}
if(how=="smart"){
if(!doc.mode.indent){how="prev"}
else{state=getStateBefore(cm,n)}}
var tabSize=cm.options.tabSize
var line=getLine(doc,n),curSpace=countColumn(line.text,null,tabSize)
if(line.stateAfter){line.stateAfter=null}
var curSpaceString=line.text.match(/^\s*/)[0],indentation
if(!aggressive&&!/\S/.test(line.text)){indentation=0
how="not"}else if(how=="smart"){indentation=doc.mode.indent(state,line.text.slice(curSpaceString.length),line.text)
if(indentation==Pass||indentation>150){if(!aggressive){return}
how="prev"}}
if(how=="prev"){if(n>doc.first){indentation=countColumn(getLine(doc,n-1).text,null,tabSize)}
else{indentation=0}}else if(how=="add"){indentation=curSpace+cm.options.indentUnit}else if(how=="subtract"){indentation=curSpace-cm.options.indentUnit}else if(typeof how=="number"){indentation=curSpace+how}
indentation=Math.max(0,indentation)
var indentString="",pos=0
if(cm.options.indentWithTabs)
{for(var i=Math.floor(indentation/tabSize);i;--i){pos+=tabSize;indentString+="\t"}}
if(pos<indentation){indentString+=spaceStr(indentation-pos)}
if(indentString!=curSpaceString){replaceRange(doc,indentString,Pos(n,0),Pos(n,curSpaceString.length),"+input")
line.stateAfter=null
return true}else{
for(var i$1=0;i$1<doc.sel.ranges.length;i$1++){var range=doc.sel.ranges[i$1]
if(range.head.line==n&&range.head.ch<curSpaceString.length){var pos$1=Pos(n,curSpaceString.length)
replaceOneSelection(doc,i$1,new Range(pos$1,pos$1))
break}}}}


var lastCopied=null
function setLastCopied(newLastCopied){lastCopied=newLastCopied}
function applyTextInput(cm,inserted,deleted,sel,origin){var doc=cm.doc
cm.display.shift=false
if(!sel){sel=doc.sel}
var paste=cm.state.pasteIncoming||origin=="paste"
var textLines=splitLinesAuto(inserted),multiPaste=null
 
if(paste&&sel.ranges.length>1){if(lastCopied&&lastCopied.text.join("\n")==inserted){if(sel.ranges.length%lastCopied.text.length==0){multiPaste=[]
for(var i=0;i<lastCopied.text.length;i++)
{multiPaste.push(doc.splitLines(lastCopied.text[i]))}}}else if(textLines.length==sel.ranges.length){multiPaste=map(textLines,function(l){return[l];})}}
var updateInput
 
for(var i$1=sel.ranges.length-1;i$1>=0;i$1--){var range=sel.ranges[i$1]
var from=range.from(),to=range.to()
if(range.empty()){if(deleted&&deleted>0)
{from=Pos(from.line,from.ch-deleted)}
else if(cm.state.overwrite&&!paste)
{to=Pos(to.line,Math.min(getLine(doc,to.line).text.length,to.ch+lst(textLines).length))}
else if(lastCopied&&lastCopied.lineWise&&lastCopied.text.join("\n")==inserted)
{from=to=Pos(from.line,0)}}
updateInput=cm.curOp.updateInput
var changeEvent={from:from,to:to,text:multiPaste?multiPaste[i$1%multiPaste.length]:textLines,origin:origin||(paste?"paste":cm.state.cutIncoming?"cut":"+input")}
makeChange(cm.doc,changeEvent)
signalLater(cm,"inputRead",cm,changeEvent)}
if(inserted&&!paste)
{triggerElectric(cm,inserted)}
ensureCursorVisible(cm)
cm.curOp.updateInput=updateInput
cm.curOp.typing=true
cm.state.pasteIncoming=cm.state.cutIncoming=false}
function handlePaste(e,cm){var pasted=e.clipboardData&&e.clipboardData.getData("Text")
if(pasted){e.preventDefault()
if(!cm.isReadOnly()&&!cm.options.disableInput)
{runInOp(cm,function(){return applyTextInput(cm,pasted,0,null,"paste");})}
return true}}
function triggerElectric(cm,inserted){ if(!cm.options.electricChars||!cm.options.smartIndent){return}
var sel=cm.doc.sel
for(var i=sel.ranges.length-1;i>=0;i--){var range=sel.ranges[i]
if(range.head.ch>100||(i&&sel.ranges[i-1].head.line==range.head.line)){continue}
var mode=cm.getModeAt(range.head)
var indented=false
if(mode.electricChars){for(var j=0;j<mode.electricChars.length;j++)
{if(inserted.indexOf(mode.electricChars.charAt(j))>-1){indented=indentLine(cm,range.head.line,"smart")
break}}}else if(mode.electricInput){if(mode.electricInput.test(getLine(cm.doc,range.head.line).text.slice(0,range.head.ch)))
{indented=indentLine(cm,range.head.line,"smart")}}
if(indented){signalLater(cm,"electricInput",cm,range.head.line)}}}
function copyableRanges(cm){var text=[],ranges=[]
for(var i=0;i<cm.doc.sel.ranges.length;i++){var line=cm.doc.sel.ranges[i].head.line
var lineRange={anchor:Pos(line,0),head:Pos(line+1,0)}
ranges.push(lineRange)
text.push(cm.getRange(lineRange.anchor,lineRange.head))}
return{text:text,ranges:ranges}}
function disableBrowserMagic(field,spellcheck){field.setAttribute("autocorrect","off")
field.setAttribute("autocapitalize","off")
field.setAttribute("spellcheck",!!spellcheck)}
function hiddenTextarea(){var te=elt("textarea",null,null,"position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none")
var div=elt("div",[te],null,"overflow: hidden; position: relative; width: 3px; height: 0px;")



if(webkit){te.style.width="1000px"}
else{te.setAttribute("wrap","off")}
if(ios){te.style.border="1px solid black"}
disableBrowserMagic(te)
return div}




function addEditorMethods(CodeMirror){var optionHandlers=CodeMirror.optionHandlers
var helpers=CodeMirror.helpers={}
CodeMirror.prototype={constructor:CodeMirror,focus:function(){window.focus();this.display.input.focus()},setOption:function(option,value){var options=this.options,old=options[option]
if(options[option]==value&&option!="mode"){return}
options[option]=value
if(optionHandlers.hasOwnProperty(option))
{operation(this,optionHandlers[option])(this,value,old)}
signal(this,"optionChange",this,option)},getOption:function(option){return this.options[option]},getDoc:function(){return this.doc},addKeyMap:function(map,bottom){this.state.keyMaps[bottom?"push":"unshift"](getKeyMap(map))},removeKeyMap:function(map){var maps=this.state.keyMaps
for(var i=0;i<maps.length;++i)
{if(maps[i]==map||maps[i].name==map){maps.splice(i,1)
return true}}},addOverlay:methodOp(function(spec,options){var mode=spec.token?spec:CodeMirror.getMode(this.options,spec)
if(mode.startState){throw new Error("Overlays may not be stateful.")}
insertSorted(this.state.overlays,{mode:mode,modeSpec:spec,opaque:options&&options.opaque,priority:(options&&options.priority)||0},function(overlay){return overlay.priority;})
this.state.modeGen++
regChange(this)}),removeOverlay:methodOp(function(spec){var this$1=this;var overlays=this.state.overlays
for(var i=0;i<overlays.length;++i){var cur=overlays[i].modeSpec
if(cur==spec||typeof spec=="string"&&cur.name==spec){overlays.splice(i,1)
this$1.state.modeGen++
regChange(this$1)
return}}}),indentLine:methodOp(function(n,dir,aggressive){if(typeof dir!="string"&&typeof dir!="number"){if(dir==null){dir=this.options.smartIndent?"smart":"prev"}
else{dir=dir?"add":"subtract"}}
if(isLine(this.doc,n)){indentLine(this,n,dir,aggressive)}}),indentSelection:methodOp(function(how){var this$1=this;var ranges=this.doc.sel.ranges,end=-1
for(var i=0;i<ranges.length;i++){var range=ranges[i]
if(!range.empty()){var from=range.from(),to=range.to()
var start=Math.max(end,from.line)
end=Math.min(this$1.lastLine(),to.line-(to.ch?0:1))+1
for(var j=start;j<end;++j)
{indentLine(this$1,j,how)}
var newRanges=this$1.doc.sel.ranges
if(from.ch==0&&ranges.length==newRanges.length&&newRanges[i].from().ch>0)
{replaceOneSelection(this$1.doc,i,new Range(from,newRanges[i].to()),sel_dontScroll)}}else if(range.head.line>end){indentLine(this$1,range.head.line,how,true)
end=range.head.line
if(i==this$1.doc.sel.primIndex){ensureCursorVisible(this$1)}}}}),
getTokenAt:function(pos,precise){return takeToken(this,pos,precise)},getLineTokens:function(line,precise){return takeToken(this,Pos(line),precise,true)},getTokenTypeAt:function(pos){pos=clipPos(this.doc,pos)
var styles=getLineStyles(this,getLine(this.doc,pos.line))
var before=0,after=(styles.length-1)/2,ch=pos.ch
var type
if(ch==0){type=styles[2]}
else{for(;;){var mid=(before+after)>>1
if((mid?styles[mid*2-1]:0)>=ch){after=mid}
else if(styles[mid*2+1]<ch){before=mid+1}
else{type=styles[mid*2+2];break}}}
var cut=type?type.indexOf("overlay "):-1
return cut<0?type:cut==0?null:type.slice(0,cut-1)},getModeAt:function(pos){var mode=this.doc.mode
if(!mode.innerMode){return mode}
return CodeMirror.innerMode(mode,this.getTokenAt(pos).state).mode},getHelper:function(pos,type){return this.getHelpers(pos,type)[0]},getHelpers:function(pos,type){var this$1=this;var found=[]
if(!helpers.hasOwnProperty(type)){return found}
var help=helpers[type],mode=this.getModeAt(pos)
if(typeof mode[type]=="string"){if(help[mode[type]]){found.push(help[mode[type]])}}else if(mode[type]){for(var i=0;i<mode[type].length;i++){var val=help[mode[type][i]]
if(val){found.push(val)}}}else if(mode.helperType&&help[mode.helperType]){found.push(help[mode.helperType])}else if(help[mode.name]){found.push(help[mode.name])}
for(var i$1=0;i$1<help._global.length;i$1++){var cur=help._global[i$1]
if(cur.pred(mode,this$1)&&indexOf(found,cur.val)==-1)
{found.push(cur.val)}}
return found},getStateAfter:function(line,precise){var doc=this.doc
line=clipLine(doc,line==null?doc.first+doc.size-1:line)
return getStateBefore(this,line+1,precise)},cursorCoords:function(start,mode){var pos,range=this.doc.sel.primary()
if(start==null){pos=range.head}
else if(typeof start=="object"){pos=clipPos(this.doc,start)}
else{pos=start?range.from():range.to()}
return cursorCoords(this,pos,mode||"page")},charCoords:function(pos,mode){return charCoords(this,clipPos(this.doc,pos),mode||"page")},coordsChar:function(coords,mode){coords=fromCoordSystem(this,coords,mode||"page")
return coordsChar(this,coords.left,coords.top)},lineAtHeight:function(height,mode){height=fromCoordSystem(this,{top:height,left:0},mode||"page").top
return lineAtHeight(this.doc,height+this.display.viewOffset)},heightAtLine:function(line,mode,includeWidgets){var end=false,lineObj
if(typeof line=="number"){var last=this.doc.first+this.doc.size-1
if(line<this.doc.first){line=this.doc.first}
else if(line>last){line=last;end=true}
lineObj=getLine(this.doc,line)}else{lineObj=line}
return intoCoordSystem(this,lineObj,{top:0,left:0},mode||"page",includeWidgets).top+
(end?this.doc.height-heightAtLine(lineObj):0)},defaultTextHeight:function(){return textHeight(this.display)},defaultCharWidth:function(){return charWidth(this.display)},getViewport:function(){return{from:this.display.viewFrom,to:this.display.viewTo}},addWidget:function(pos,node,scroll,vert,horiz){var display=this.display
pos=cursorCoords(this,clipPos(this.doc,pos))
var top=pos.bottom,left=pos.left
node.style.position="absolute"
node.setAttribute("cm-ignore-events","true")
this.display.input.setUneditable(node)
display.sizer.appendChild(node)
if(vert=="over"){top=pos.top}else if(vert=="above"||vert=="near"){var vspace=Math.max(display.wrapper.clientHeight,this.doc.height),hspace=Math.max(display.sizer.clientWidth,display.lineSpace.clientWidth) 
if((vert=='above'||pos.bottom+node.offsetHeight>vspace)&&pos.top>node.offsetHeight)
{top=pos.top-node.offsetHeight}
else if(pos.bottom+node.offsetHeight<=vspace)
{top=pos.bottom}
if(left+node.offsetWidth>hspace)
{left=hspace-node.offsetWidth}}
node.style.top=top+"px"
node.style.left=node.style.right=""
if(horiz=="right"){left=display.sizer.clientWidth-node.offsetWidth
node.style.right="0px"}else{if(horiz=="left"){left=0}
else if(horiz=="middle"){left=(display.sizer.clientWidth-node.offsetWidth)/2}
node.style.left=left+"px"}
if(scroll)
{scrollIntoView(this,left,top,left+node.offsetWidth,top+node.offsetHeight)}},triggerOnKeyDown:methodOp(onKeyDown),triggerOnKeyPress:methodOp(onKeyPress),triggerOnKeyUp:onKeyUp,execCommand:function(cmd){if(commands.hasOwnProperty(cmd))
{return commands[cmd].call(null,this)}},triggerElectric:methodOp(function(text){triggerElectric(this,text)}),findPosH:function(from,amount,unit,visually){var this$1=this;var dir=1
if(amount<0){dir=-1;amount=-amount}
var cur=clipPos(this.doc,from)
for(var i=0;i<amount;++i){cur=findPosH(this$1.doc,cur,dir,unit,visually)
if(cur.hitSide){break}}
return cur},moveH:methodOp(function(dir,unit){var this$1=this;this.extendSelectionsBy(function(range){if(this$1.display.shift||this$1.doc.extend||range.empty())
{return findPosH(this$1.doc,range.head,dir,unit,this$1.options.rtlMoveVisually)}
else
{return dir<0?range.from():range.to()}},sel_move)}),deleteH:methodOp(function(dir,unit){var sel=this.doc.sel,doc=this.doc
if(sel.somethingSelected())
{doc.replaceSelection("",null,"+delete")}
else
{deleteNearSelection(this,function(range){var other=findPosH(doc,range.head,dir,unit,false)
return dir<0?{from:other,to:range.head}:{from:range.head,to:other}})}}),findPosV:function(from,amount,unit,goalColumn){var this$1=this;var dir=1,x=goalColumn
if(amount<0){dir=-1;amount=-amount}
var cur=clipPos(this.doc,from)
for(var i=0;i<amount;++i){var coords=cursorCoords(this$1,cur,"div")
if(x==null){x=coords.left}
else{coords.left=x}
cur=findPosV(this$1,coords,dir,unit)
if(cur.hitSide){break}}
return cur},moveV:methodOp(function(dir,unit){var this$1=this;var doc=this.doc,goals=[]
var collapse=!this.display.shift&&!doc.extend&&doc.sel.somethingSelected()
doc.extendSelectionsBy(function(range){if(collapse)
{return dir<0?range.from():range.to()}
var headPos=cursorCoords(this$1,range.head,"div")
if(range.goalColumn!=null){headPos.left=range.goalColumn}
goals.push(headPos.left)
var pos=findPosV(this$1,headPos,dir,unit)
if(unit=="page"&&range==doc.sel.primary())
{addToScrollPos(this$1,null,charCoords(this$1,pos,"div").top-headPos.top)}
return pos},sel_move)
if(goals.length){for(var i=0;i<doc.sel.ranges.length;i++)
{doc.sel.ranges[i].goalColumn=goals[i]}}}),findWordAt:function(pos){var doc=this.doc,line=getLine(doc,pos.line).text
var start=pos.ch,end=pos.ch
if(line){var helper=this.getHelper(pos,"wordChars")
if((pos.xRel<0||end==line.length)&&start){--start;}else{++end}
var startChar=line.charAt(start)
var check=isWordChar(startChar,helper)?function(ch){return isWordChar(ch,helper);}:/\s/.test(startChar)?function(ch){return/\s/.test(ch);}:function(ch){return(!/\s/.test(ch)&&!isWordChar(ch));}
while(start>0&&check(line.charAt(start-1))){--start}
while(end<line.length&&check(line.charAt(end))){++end}}
return new Range(Pos(pos.line,start),Pos(pos.line,end))},toggleOverwrite:function(value){if(value!=null&&value==this.state.overwrite){return}
if(this.state.overwrite=!this.state.overwrite)
{addClass(this.display.cursorDiv,"CodeMirror-overwrite")}
else
{rmClass(this.display.cursorDiv,"CodeMirror-overwrite")}
signal(this,"overwriteToggle",this,this.state.overwrite)},hasFocus:function(){return this.display.input.getField()==activeElt()},isReadOnly:function(){return!!(this.options.readOnly||this.doc.cantEdit)},scrollTo:methodOp(function(x,y){if(x!=null||y!=null){resolveScrollToPos(this)}
if(x!=null){this.curOp.scrollLeft=x}
if(y!=null){this.curOp.scrollTop=y}}),getScrollInfo:function(){var scroller=this.display.scroller
return{left:scroller.scrollLeft,top:scroller.scrollTop,height:scroller.scrollHeight-scrollGap(this)-this.display.barHeight,width:scroller.scrollWidth-scrollGap(this)-this.display.barWidth,clientHeight:displayHeight(this),clientWidth:displayWidth(this)}},scrollIntoView:methodOp(function(range,margin){if(range==null){range={from:this.doc.sel.primary().head,to:null}
if(margin==null){margin=this.options.cursorScrollMargin}}else if(typeof range=="number"){range={from:Pos(range,0),to:null}}else if(range.from==null){range={from:range,to:null}}
if(!range.to){range.to=range.from}
range.margin=margin||0
if(range.from.line!=null){resolveScrollToPos(this)
this.curOp.scrollToPos=range}else{var sPos=calculateScrollPos(this,Math.min(range.from.left,range.to.left),Math.min(range.from.top,range.to.top)-range.margin,Math.max(range.from.right,range.to.right),Math.max(range.from.bottom,range.to.bottom)+range.margin)
this.scrollTo(sPos.scrollLeft,sPos.scrollTop)}}),setSize:methodOp(function(width,height){var this$1=this;var interpret=function(val){return typeof val=="number"||/^\d+$/.test(String(val))?val+"px":val;}
if(width!=null){this.display.wrapper.style.width=interpret(width)}
if(height!=null){this.display.wrapper.style.height=interpret(height)}
if(this.options.lineWrapping){clearLineMeasurementCache(this)}
var lineNo=this.display.viewFrom
this.doc.iter(lineNo,this.display.viewTo,function(line){if(line.widgets){for(var i=0;i<line.widgets.length;i++)
{if(line.widgets[i].noHScroll){regLineChange(this$1,lineNo,"widget");break}}}
++lineNo})
this.curOp.forceUpdate=true
signal(this,"refresh",this)}),operation:function(f){return runInOp(this,f)},refresh:methodOp(function(){var oldHeight=this.display.cachedTextHeight
regChange(this)
this.curOp.forceUpdate=true
clearCaches(this)
this.scrollTo(this.doc.scrollLeft,this.doc.scrollTop)
updateGutterSpace(this)
if(oldHeight==null||Math.abs(oldHeight-textHeight(this.display))>.5)
{estimateLineHeights(this)}
signal(this,"refresh",this)}),swapDoc:methodOp(function(doc){var old=this.doc
old.cm=null
attachDoc(this,doc)
clearCaches(this)
this.display.input.reset()
this.scrollTo(doc.scrollLeft,doc.scrollTop)
this.curOp.forceScroll=true
signalLater(this,"swapDoc",this,old)
return old}),getInputField:function(){return this.display.input.getField()},getWrapperElement:function(){return this.display.wrapper},getScrollerElement:function(){return this.display.scroller},getGutterElement:function(){return this.display.gutters}}
eventMixin(CodeMirror)
CodeMirror.registerHelper=function(type,name,value){if(!helpers.hasOwnProperty(type)){helpers[type]=CodeMirror[type]={_global:[]}}
helpers[type][name]=value}
CodeMirror.registerGlobalHelper=function(type,name,predicate,value){CodeMirror.registerHelper(type,name,value)
helpers[type]._global.push({pred:predicate,val:value})}}








function findPosH(doc,pos,dir,unit,visually){var line=pos.line,ch=pos.ch,origDir=dir
var lineObj=getLine(doc,line)
function findNextLine(){var l=line+dir
if(l<doc.first||l>=doc.first+doc.size){return false}
line=l
return lineObj=getLine(doc,l)}
function moveOnce(boundToLine){var next=(visually?moveVisually:moveLogically)(lineObj,ch,dir,true)
if(next==null){if(!boundToLine&&findNextLine()){if(visually){ch=(dir<0?lineRight:lineLeft)(lineObj)}
else{ch=dir<0?lineObj.text.length:0}}else{return false}}else{ch=next}
return true}
if(unit=="char"){moveOnce()}else if(unit=="column"){moveOnce(true)}else if(unit=="word"||unit=="group"){var sawType=null,group=unit=="group"
var helper=doc.cm&&doc.cm.getHelper(pos,"wordChars")
for(var first=true;;first=false){if(dir<0&&!moveOnce(!first)){break}
var cur=lineObj.text.charAt(ch)||"\n"
var type=isWordChar(cur,helper)?"w":group&&cur=="\n"?"n":!group||/\s/.test(cur)?null:"p"
if(group&&!first&&!type){type="s"}
if(sawType&&sawType!=type){if(dir<0){dir=1;moveOnce()}
break}
if(type){sawType=type}
if(dir>0&&!moveOnce(!first)){break}}}
var result=skipAtomic(doc,Pos(line,ch),pos,origDir,true)
if(!cmp(pos,result)){result.hitSide=true}
return result}


function findPosV(cm,pos,dir,unit){var doc=cm.doc,x=pos.left,y
if(unit=="page"){var pageSize=Math.min(cm.display.wrapper.clientHeight,window.innerHeight||document.documentElement.clientHeight)
var moveAmount=Math.max(pageSize-.5*textHeight(cm.display),3)
y=(dir>0?pos.bottom:pos.top)+dir*moveAmount}else if(unit=="line"){y=dir>0?pos.bottom+3:pos.top-3}
var target
for(;;){target=coordsChar(cm,x,y)
if(!target.outside){break}
if(dir<0?y<=0:y>=doc.height){target.hitSide=true;break}
y+=dir*5}
return target}
var ContentEditableInput=function(cm){this.cm=cm
this.lastAnchorNode=this.lastAnchorOffset=this.lastFocusNode=this.lastFocusOffset=null
this.polling=new Delayed()
this.composing=null
this.gracePeriod=false
this.readDOMTimeout=null};ContentEditableInput.prototype.init=function(display){var this$1=this;var input=this,cm=input.cm
var div=input.div=display.lineDiv
disableBrowserMagic(div,cm.options.spellcheck)
on(div,"paste",function(e){if(signalDOMEvent(cm,e)||handlePaste(e,cm)){return} 
if(ie_version<=11){setTimeout(operation(cm,function(){if(!input.pollContent()){regChange(cm)}}),20)}})
on(div,"compositionstart",function(e){this$1.composing={data:e.data,done:false}})
on(div,"compositionupdate",function(e){if(!this$1.composing){this$1.composing={data:e.data,done:false}}})
on(div,"compositionend",function(e){if(this$1.composing){if(e.data!=this$1.composing.data){this$1.readFromDOMSoon()}
this$1.composing.done=true}})
on(div,"touchstart",function(){return input.forceCompositionEnd();})
on(div,"input",function(){if(!this$1.composing){this$1.readFromDOMSoon()}})
function onCopyCut(e){if(signalDOMEvent(cm,e)){return}
if(cm.somethingSelected()){setLastCopied({lineWise:false,text:cm.getSelections()})
if(e.type=="cut"){cm.replaceSelection("",null,"cut")}}else if(!cm.options.lineWiseCopyCut){return}else{var ranges=copyableRanges(cm)
setLastCopied({lineWise:true,text:ranges.text})
if(e.type=="cut"){cm.operation(function(){cm.setSelections(ranges.ranges,0,sel_dontScroll)
cm.replaceSelection("",null,"cut")})}}
if(e.clipboardData){e.clipboardData.clearData()
var content=lastCopied.text.join("\n") 
e.clipboardData.setData("Text",content)
if(e.clipboardData.getData("Text")==content){e.preventDefault()
return}} 
var kludge=hiddenTextarea(),te=kludge.firstChild
cm.display.lineSpace.insertBefore(kludge,cm.display.lineSpace.firstChild)
te.value=lastCopied.text.join("\n")
var hadFocus=document.activeElement
selectInput(te)
setTimeout(function(){cm.display.lineSpace.removeChild(kludge)
hadFocus.focus()
if(hadFocus==div){input.showPrimarySelection()}},50)}
on(div,"copy",onCopyCut)
on(div,"cut",onCopyCut)};ContentEditableInput.prototype.prepareSelection=function(){var result=prepareSelection(this.cm,false)
result.focus=this.cm.state.focused
return result};ContentEditableInput.prototype.showSelection=function(info,takeFocus){if(!info||!this.cm.display.view.length){return}
if(info.focus||takeFocus){this.showPrimarySelection()}
this.showMultipleSelections(info)};ContentEditableInput.prototype.showPrimarySelection=function(){var sel=window.getSelection(),prim=this.cm.doc.sel.primary()
var curAnchor=domToPos(this.cm,sel.anchorNode,sel.anchorOffset)
var curFocus=domToPos(this.cm,sel.focusNode,sel.focusOffset)
if(curAnchor&&!curAnchor.bad&&curFocus&&!curFocus.bad&&cmp(minPos(curAnchor,curFocus),prim.from())==0&&cmp(maxPos(curAnchor,curFocus),prim.to())==0)
{return}
var start=posToDOM(this.cm,prim.from())
var end=posToDOM(this.cm,prim.to())
if(!start&&!end){return}
var view=this.cm.display.view
var old=sel.rangeCount&&sel.getRangeAt(0)
if(!start){start={node:view[0].measure.map[2],offset:0}}else if(!end){ var measure=view[view.length-1].measure
var map=measure.maps?measure.maps[measure.maps.length-1]:measure.map
end={node:map[map.length-1],offset:map[map.length-2]-map[map.length-3]}}
var rng
try{rng=range(start.node,start.offset,end.offset,end.node)}
catch(e){} 
if(rng){if(!gecko&&this.cm.state.focused){sel.collapse(start.node,start.offset)
if(!rng.collapsed){sel.removeAllRanges()
sel.addRange(rng)}}else{sel.removeAllRanges()
sel.addRange(rng)}
if(old&&sel.anchorNode==null){sel.addRange(old)}
else if(gecko){this.startGracePeriod()}}
this.rememberSelection()};ContentEditableInput.prototype.startGracePeriod=function(){var this$1=this;clearTimeout(this.gracePeriod)
this.gracePeriod=setTimeout(function(){this$1.gracePeriod=false
if(this$1.selectionChanged())
{this$1.cm.operation(function(){return this$1.cm.curOp.selectionChanged=true;})}},20)};ContentEditableInput.prototype.showMultipleSelections=function(info){removeChildrenAndAdd(this.cm.display.cursorDiv,info.cursors)
removeChildrenAndAdd(this.cm.display.selectionDiv,info.selection)};ContentEditableInput.prototype.rememberSelection=function(){var sel=window.getSelection()
this.lastAnchorNode=sel.anchorNode;this.lastAnchorOffset=sel.anchorOffset
this.lastFocusNode=sel.focusNode;this.lastFocusOffset=sel.focusOffset};ContentEditableInput.prototype.selectionInEditor=function(){var sel=window.getSelection()
if(!sel.rangeCount){return false}
var node=sel.getRangeAt(0).commonAncestorContainer
return contains(this.div,node)};ContentEditableInput.prototype.focus=function(){if(this.cm.options.readOnly!="nocursor"){if(!this.selectionInEditor())
{this.showSelection(this.prepareSelection(),true)}
this.div.focus()}};ContentEditableInput.prototype.blur=function(){this.div.blur()};ContentEditableInput.prototype.getField=function(){return this.div};ContentEditableInput.prototype.supportsTouch=function(){return true};ContentEditableInput.prototype.receivedFocus=function(){var input=this
if(this.selectionInEditor())
{this.pollSelection()}
else
{runInOp(this.cm,function(){return input.cm.curOp.selectionChanged=true;})}
function poll(){if(input.cm.state.focused){input.pollSelection()
input.polling.set(input.cm.options.pollInterval,poll)}}
this.polling.set(this.cm.options.pollInterval,poll)};ContentEditableInput.prototype.selectionChanged=function(){var sel=window.getSelection()
return sel.anchorNode!=this.lastAnchorNode||sel.anchorOffset!=this.lastAnchorOffset||sel.focusNode!=this.lastFocusNode||sel.focusOffset!=this.lastFocusOffset};ContentEditableInput.prototype.pollSelection=function(){if(!this.composing&&this.readDOMTimeout==null&&!this.gracePeriod&&this.selectionChanged()){var sel=window.getSelection(),cm=this.cm
this.rememberSelection()
var anchor=domToPos(cm,sel.anchorNode,sel.anchorOffset)
var head=domToPos(cm,sel.focusNode,sel.focusOffset)
if(anchor&&head){runInOp(cm,function(){setSelection(cm.doc,simpleSelection(anchor,head),sel_dontScroll)
if(anchor.bad||head.bad){cm.curOp.selectionChanged=true}})}}};ContentEditableInput.prototype.pollContent=function(){if(this.readDOMTimeout!=null){clearTimeout(this.readDOMTimeout)
this.readDOMTimeout=null}
var cm=this.cm,display=cm.display,sel=cm.doc.sel.primary()
var from=sel.from(),to=sel.to()
if(from.ch==0&&from.line>cm.firstLine())
{from=Pos(from.line-1,getLine(cm.doc,from.line-1).length)}
if(to.ch==getLine(cm.doc,to.line).text.length&&to.line<cm.lastLine())
{to=Pos(to.line+1,0)}
if(from.line<display.viewFrom||to.line>display.viewTo-1){return false}
var fromIndex,fromLine,fromNode
if(from.line==display.viewFrom||(fromIndex=findViewIndex(cm,from.line))==0){fromLine=lineNo(display.view[0].line)
fromNode=display.view[0].node}else{fromLine=lineNo(display.view[fromIndex].line)
fromNode=display.view[fromIndex-1].node.nextSibling}
var toIndex=findViewIndex(cm,to.line)
var toLine,toNode
if(toIndex==display.view.length-1){toLine=display.viewTo-1
toNode=display.lineDiv.lastChild}else{toLine=lineNo(display.view[toIndex+1].line)-1
toNode=display.view[toIndex+1].node.previousSibling}
if(!fromNode){return false}
var newText=cm.doc.splitLines(domTextBetween(cm,fromNode,toNode,fromLine,toLine))
var oldText=getBetween(cm.doc,Pos(fromLine,0),Pos(toLine,getLine(cm.doc,toLine).text.length))
while(newText.length>1&&oldText.length>1){if(lst(newText)==lst(oldText)){newText.pop();oldText.pop();toLine--}
else if(newText[0]==oldText[0]){newText.shift();oldText.shift();fromLine++}
else{break}}
var cutFront=0,cutEnd=0
var newTop=newText[0],oldTop=oldText[0],maxCutFront=Math.min(newTop.length,oldTop.length)
while(cutFront<maxCutFront&&newTop.charCodeAt(cutFront)==oldTop.charCodeAt(cutFront))
{++cutFront}
var newBot=lst(newText),oldBot=lst(oldText)
var maxCutEnd=Math.min(newBot.length-(newText.length==1?cutFront:0),oldBot.length-(oldText.length==1?cutFront:0))
while(cutEnd<maxCutEnd&&newBot.charCodeAt(newBot.length-cutEnd-1)==oldBot.charCodeAt(oldBot.length-cutEnd-1))
{++cutEnd}
newText[newText.length-1]=newBot.slice(0,newBot.length-cutEnd).replace(/^\u200b+/,"")
newText[0]=newText[0].slice(cutFront).replace(/\u200b+$/,"")
var chFrom=Pos(fromLine,cutFront)
var chTo=Pos(toLine,oldText.length?lst(oldText).length-cutEnd:0)
if(newText.length>1||newText[0]||cmp(chFrom,chTo)){replaceRange(cm.doc,newText,chFrom,chTo,"+input")
return true}};ContentEditableInput.prototype.ensurePolled=function(){this.forceCompositionEnd()};ContentEditableInput.prototype.reset=function(){this.forceCompositionEnd()};ContentEditableInput.prototype.forceCompositionEnd=function(){if(!this.composing){return}
clearTimeout(this.readDOMTimeout)
this.composing=null
if(!this.pollContent()){regChange(this.cm)}
this.div.blur()
this.div.focus()};ContentEditableInput.prototype.readFromDOMSoon=function(){var this$1=this;if(this.readDOMTimeout!=null){return}
this.readDOMTimeout=setTimeout(function(){this$1.readDOMTimeout=null
if(this$1.composing){if(this$1.composing.done){this$1.composing=null}
else{return}}
if(this$1.cm.isReadOnly()||!this$1.pollContent())
{runInOp(this$1.cm,function(){return regChange(this$1.cm);})}},80)};ContentEditableInput.prototype.setUneditable=function(node){node.contentEditable="false"};ContentEditableInput.prototype.onKeyPress=function(e){e.preventDefault()
if(!this.cm.isReadOnly())
{operation(this.cm,applyTextInput)(this.cm,String.fromCharCode(e.charCode==null?e.keyCode:e.charCode),0)}};ContentEditableInput.prototype.readOnlyChanged=function(val){this.div.contentEditable=String(val!="nocursor")};ContentEditableInput.prototype.onContextMenu=function(){};ContentEditableInput.prototype.resetPosition=function(){};ContentEditableInput.prototype.needsContentAttribute=true
function posToDOM(cm,pos){var view=findViewForLine(cm,pos.line)
if(!view||view.hidden){return null}
var line=getLine(cm.doc,pos.line)
var info=mapFromLineView(view,line,pos.line)
var order=getOrder(line),side="left"
if(order){var partPos=getBidiPartAt(order,pos.ch)
side=partPos%2?"right":"left"}
var result=nodeAndOffsetInLineMap(info.map,pos.ch,side)
result.offset=result.collapse=="right"?result.end:result.start
return result}
function badPos(pos,bad){if(bad){pos.bad=true;}return pos}
function domTextBetween(cm,from,to,fromLine,toLine){var text="",closing=false,lineSep=cm.doc.lineSeparator()
function recognizeMarker(id){return function(marker){return marker.id==id;}}
function walk(node){if(node.nodeType==1){var cmText=node.getAttribute("cm-text")
if(cmText!=null){if(cmText==""){text+=node.textContent.replace(/\u200b/g,"")}
else{text+=cmText}
return}
var markerID=node.getAttribute("cm-marker"),range
if(markerID){var found=cm.findMarks(Pos(fromLine,0),Pos(toLine+1,0),recognizeMarker(+markerID))
if(found.length&&(range=found[0].find()))
{text+=getBetween(cm.doc,range.from,range.to).join(lineSep)}
return}
if(node.getAttribute("contenteditable")=="false"){return}
for(var i=0;i<node.childNodes.length;i++)
{walk(node.childNodes[i])}
if(/^(pre|div|p)$/i.test(node.nodeName))
{closing=true}}else if(node.nodeType==3){var val=node.nodeValue
if(!val){return}
if(closing){text+=lineSep
closing=false}
text+=val}}
for(;;){walk(from)
if(from==to){break}
from=from.nextSibling}
return text}
function domToPos(cm,node,offset){var lineNode
if(node==cm.display.lineDiv){lineNode=cm.display.lineDiv.childNodes[offset]
if(!lineNode){return badPos(cm.clipPos(Pos(cm.display.viewTo-1)),true)}
node=null;offset=0}else{for(lineNode=node;;lineNode=lineNode.parentNode){if(!lineNode||lineNode==cm.display.lineDiv){return null}
if(lineNode.parentNode&&lineNode.parentNode==cm.display.lineDiv){break}}}
for(var i=0;i<cm.display.view.length;i++){var lineView=cm.display.view[i]
if(lineView.node==lineNode)
{return locateNodeInLineView(lineView,node,offset)}}}
function locateNodeInLineView(lineView,node,offset){var wrapper=lineView.text.firstChild,bad=false
if(!node||!contains(wrapper,node)){return badPos(Pos(lineNo(lineView.line),0),true)}
if(node==wrapper){bad=true
node=wrapper.childNodes[offset]
offset=0
if(!node){var line=lineView.rest?lst(lineView.rest):lineView.line
return badPos(Pos(lineNo(line),line.text.length),bad)}}
var textNode=node.nodeType==3?node:null,topNode=node
if(!textNode&&node.childNodes.length==1&&node.firstChild.nodeType==3){textNode=node.firstChild
if(offset){offset=textNode.nodeValue.length}}
while(topNode.parentNode!=wrapper){topNode=topNode.parentNode}
var measure=lineView.measure,maps=measure.maps
function find(textNode,topNode,offset){for(var i=-1;i<(maps?maps.length:0);i++){var map=i<0?measure.map:maps[i]
for(var j=0;j<map.length;j+=3){var curNode=map[j+2]
if(curNode==textNode||curNode==topNode){var line=lineNo(i<0?lineView.line:lineView.rest[i])
var ch=map[j]+offset
if(offset<0||curNode!=textNode){ch=map[j+(offset?1:0)]}
return Pos(line,ch)}}}}
var found=find(textNode,topNode,offset)
if(found){return badPos(found,bad)} 
for(var after=topNode.nextSibling,dist=textNode?textNode.nodeValue.length-offset:0;after;after=after.nextSibling){found=find(after,after.firstChild,0)
if(found)
{return badPos(Pos(found.line,found.ch-dist),bad)}
else
{dist+=after.textContent.length}}
for(var before=topNode.previousSibling,dist$1=offset;before;before=before.previousSibling){found=find(before,before.firstChild,-1)
if(found)
{return badPos(Pos(found.line,found.ch+dist$1),bad)}
else
{dist$1+=before.textContent.length}}}
var TextareaInput=function(cm){this.cm=cm
 
this.prevInput=""


this.pollingFast=false
 
this.polling=new Delayed()

this.inaccurateSelection=false
 
this.hasSelection=false
this.composing=null};TextareaInput.prototype.init=function(display){var this$1=this;var input=this,cm=this.cm
 
var div=this.wrapper=hiddenTextarea()

var te=this.textarea=div.firstChild
display.wrapper.insertBefore(div,display.wrapper.firstChild)
if(ios){te.style.width="0px"}
on(te,"input",function(){if(ie&&ie_version>=9&&this$1.hasSelection){this$1.hasSelection=null}
input.poll()})
on(te,"paste",function(e){if(signalDOMEvent(cm,e)||handlePaste(e,cm)){return}
cm.state.pasteIncoming=true
input.fastPoll()})
function prepareCopyCut(e){if(signalDOMEvent(cm,e)){return}
if(cm.somethingSelected()){setLastCopied({lineWise:false,text:cm.getSelections()})
if(input.inaccurateSelection){input.prevInput=""
input.inaccurateSelection=false
te.value=lastCopied.text.join("\n")
selectInput(te)}}else if(!cm.options.lineWiseCopyCut){return}else{var ranges=copyableRanges(cm)
setLastCopied({lineWise:true,text:ranges.text})
if(e.type=="cut"){cm.setSelections(ranges.ranges,null,sel_dontScroll)}else{input.prevInput=""
te.value=ranges.text.join("\n")
selectInput(te)}}
if(e.type=="cut"){cm.state.cutIncoming=true}}
on(te,"cut",prepareCopyCut)
on(te,"copy",prepareCopyCut)
on(display.scroller,"paste",function(e){if(eventInWidget(display,e)||signalDOMEvent(cm,e)){return}
cm.state.pasteIncoming=true
input.focus()})
on(display.lineSpace,"selectstart",function(e){if(!eventInWidget(display,e)){e_preventDefault(e)}})
on(te,"compositionstart",function(){var start=cm.getCursor("from")
if(input.composing){input.composing.range.clear()}
input.composing={start:start,range:cm.markText(start,cm.getCursor("to"),{className:"CodeMirror-composing"})}})
on(te,"compositionend",function(){if(input.composing){input.poll()
input.composing.range.clear()
input.composing=null}})};TextareaInput.prototype.prepareSelection=function(){ var cm=this.cm,display=cm.display,doc=cm.doc
var result=prepareSelection(cm) 
if(cm.options.moveInputWithCursor){var headPos=cursorCoords(cm,doc.sel.primary().head,"div")
var wrapOff=display.wrapper.getBoundingClientRect(),lineOff=display.lineDiv.getBoundingClientRect()
result.teTop=Math.max(0,Math.min(display.wrapper.clientHeight-10,headPos.top+lineOff.top-wrapOff.top))
result.teLeft=Math.max(0,Math.min(display.wrapper.clientWidth-10,headPos.left+lineOff.left-wrapOff.left))}
return result};TextareaInput.prototype.showSelection=function(drawn){var cm=this.cm,display=cm.display
removeChildrenAndAdd(display.cursorDiv,drawn.cursors)
removeChildrenAndAdd(display.selectionDiv,drawn.selection)
if(drawn.teTop!=null){this.wrapper.style.top=drawn.teTop+"px"
this.wrapper.style.left=drawn.teLeft+"px"}};TextareaInput.prototype.reset=function(typing){if(this.contextMenuPending){return}
var minimal,selected,cm=this.cm,doc=cm.doc
if(cm.somethingSelected()){this.prevInput=""
var range=doc.sel.primary()
minimal=hasCopyEvent&&(range.to().line-range.from().line>100||(selected=cm.getSelection()).length>1000)
var content=minimal?"-":selected||cm.getSelection()
this.textarea.value=content
if(cm.state.focused){selectInput(this.textarea)}
if(ie&&ie_version>=9){this.hasSelection=content}}else if(!typing){this.prevInput=this.textarea.value=""
if(ie&&ie_version>=9){this.hasSelection=null}}
this.inaccurateSelection=minimal};TextareaInput.prototype.getField=function(){return this.textarea};TextareaInput.prototype.supportsTouch=function(){return false};TextareaInput.prototype.focus=function(){if(this.cm.options.readOnly!="nocursor"&&(!mobile||activeElt()!=this.textarea)){try{this.textarea.focus()}
catch(e){}
}};TextareaInput.prototype.blur=function(){this.textarea.blur()};TextareaInput.prototype.resetPosition=function(){this.wrapper.style.top=this.wrapper.style.left=0};TextareaInput.prototype.receivedFocus=function(){this.slowPoll()};
TextareaInput.prototype.slowPoll=function(){var this$1=this;if(this.pollingFast){return}
this.polling.set(this.cm.options.pollInterval,function(){this$1.poll()
if(this$1.cm.state.focused){this$1.slowPoll()}})};

TextareaInput.prototype.fastPoll=function(){var missed=false,input=this
input.pollingFast=true
function p(){var changed=input.poll()
if(!changed&&!missed){missed=true;input.polling.set(60,p)}
else{input.pollingFast=false;input.slowPoll()}}
input.polling.set(20,p)};



TextareaInput.prototype.poll=function(){var this$1=this;var cm=this.cm,input=this.textarea,prevInput=this.prevInput



if(this.contextMenuPending||!cm.state.focused||(hasSelection(input)&&!prevInput&&!this.composing)||cm.isReadOnly()||cm.options.disableInput||cm.state.keySeq)
{return false}
var text=input.value

if(text==prevInput&&!cm.somethingSelected()){return false}


if(ie&&ie_version>=9&&this.hasSelection===text||mac&&/[\uf700-\uf7ff]/.test(text)){cm.display.input.reset()
return false}
if(cm.doc.sel==cm.display.selForContextMenu){var first=text.charCodeAt(0)
if(first==0x200b&&!prevInput){prevInput="\u200b"}
if(first==0x21da){this.reset();return this.cm.execCommand("undo")}} 
var same=0,l=Math.min(prevInput.length,text.length)
while(same<l&&prevInput.charCodeAt(same)==text.charCodeAt(same)){++same}
runInOp(cm,function(){applyTextInput(cm,text.slice(same),prevInput.length-same,null,this$1.composing?"*compose":null) 
if(text.length>1000||text.indexOf("\n")>-1){input.value=this$1.prevInput=""}
else{this$1.prevInput=text}
if(this$1.composing){this$1.composing.range.clear()
this$1.composing.range=cm.markText(this$1.composing.start,cm.getCursor("to"),{className:"CodeMirror-composing"})}})
return true};TextareaInput.prototype.ensurePolled=function(){if(this.pollingFast&&this.poll()){this.pollingFast=false}};TextareaInput.prototype.onKeyPress=function(){if(ie&&ie_version>=9){this.hasSelection=null}
this.fastPoll()};TextareaInput.prototype.onContextMenu=function(e){var input=this,cm=input.cm,display=cm.display,te=input.textarea
var pos=posFromMouse(cm,e),scrollPos=display.scroller.scrollTop
if(!pos||presto){return}

var reset=cm.options.resetSelectionOnContextMenu
if(reset&&cm.doc.sel.contains(pos)==-1)
{operation(cm,setSelection)(cm.doc,simpleSelection(pos),sel_dontScroll)}
var oldCSS=te.style.cssText,oldWrapperCSS=input.wrapper.style.cssText
input.wrapper.style.cssText="position: absolute"
var wrapperBox=input.wrapper.getBoundingClientRect()
te.style.cssText="position: absolute; width: 30px; height: 30px;\n      top: "+(e.clientY-wrapperBox.top-5)+"px; left: "+(e.clientX-wrapperBox.left-5)+"px;\n      z-index: 1000; background: "+(ie?"rgba(255, 255, 255, .05)":"transparent")+";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);"
var oldScrollY
if(webkit){oldScrollY=window.scrollY}
display.input.focus()
if(webkit){window.scrollTo(null,oldScrollY)}
display.input.reset() 
if(!cm.somethingSelected()){te.value=input.prevInput=" "}
input.contextMenuPending=true
display.selForContextMenu=cm.doc.sel
clearTimeout(display.detectingSelectAll)


function prepareSelectAllHack(){if(te.selectionStart!=null){var selected=cm.somethingSelected()
var extval="\u200b"+(selected?te.value:"")
te.value="\u21da"; te.value=extval
input.prevInput=selected?"":"\u200b"
te.selectionStart=1;te.selectionEnd=extval.length


display.selForContextMenu=cm.doc.sel}}
function rehide(){input.contextMenuPending=false
input.wrapper.style.cssText=oldWrapperCSS
te.style.cssText=oldCSS
if(ie&&ie_version<9){display.scrollbars.setScrollTop(display.scroller.scrollTop=scrollPos)} 
if(te.selectionStart!=null){if(!ie||(ie&&ie_version<9)){prepareSelectAllHack()}
var i=0,poll=function(){if(display.selForContextMenu==cm.doc.sel&&te.selectionStart==0&&te.selectionEnd>0&&input.prevInput=="\u200b")
{operation(cm,selectAll)(cm)}
else if(i++<10){display.detectingSelectAll=setTimeout(poll,500)}
else{display.input.reset()}}
display.detectingSelectAll=setTimeout(poll,200)}}
if(ie&&ie_version>=9){prepareSelectAllHack()}
if(captureRightClick){e_stop(e)
var mouseup=function(){off(window,"mouseup",mouseup)
setTimeout(rehide,20)}
on(window,"mouseup",mouseup)}else{setTimeout(rehide,50)}};TextareaInput.prototype.readOnlyChanged=function(val){if(!val){this.reset()}};TextareaInput.prototype.setUneditable=function(){};TextareaInput.prototype.needsContentAttribute=false
function fromTextArea(textarea,options){options=options?copyObj(options):{}
options.value=textarea.value
if(!options.tabindex&&textarea.tabIndex)
{options.tabindex=textarea.tabIndex}
if(!options.placeholder&&textarea.placeholder)
{options.placeholder=textarea.placeholder}

if(options.autofocus==null){var hasFocus=activeElt()
options.autofocus=hasFocus==textarea||textarea.getAttribute("autofocus")!=null&&hasFocus==document.body}
function save(){textarea.value=cm.getValue()}
var realSubmit
if(textarea.form){on(textarea.form,"submit",save)
if(!options.leaveSubmitMethodAlone){var form=textarea.form
realSubmit=form.submit
try{var wrappedSubmit=form.submit=function(){save()
form.submit=realSubmit
form.submit()
form.submit=wrappedSubmit}}catch(e){}}}
options.finishInit=function(cm){cm.save=save
cm.getTextArea=function(){return textarea;}
cm.toTextArea=function(){cm.toTextArea=isNaN
 save()
textarea.parentNode.removeChild(cm.getWrapperElement())
textarea.style.display=""
if(textarea.form){off(textarea.form,"submit",save)
if(typeof textarea.form.submit=="function")
{textarea.form.submit=realSubmit}}}}
textarea.style.display="none"
var cm=CodeMirror(function(node){return textarea.parentNode.insertBefore(node,textarea.nextSibling);},options)
return cm}
function addLegacyProps(CodeMirror){CodeMirror.off=off
CodeMirror.on=on
CodeMirror.wheelEventPixels=wheelEventPixels
CodeMirror.Doc=Doc
CodeMirror.splitLines=splitLinesAuto
CodeMirror.countColumn=countColumn
CodeMirror.findColumn=findColumn
CodeMirror.isWordChar=isWordCharBasic
CodeMirror.Pass=Pass
CodeMirror.signal=signal
CodeMirror.Line=Line
CodeMirror.changeEnd=changeEnd
CodeMirror.scrollbarModel=scrollbarModel
CodeMirror.Pos=Pos
CodeMirror.cmpPos=cmp
CodeMirror.modes=modes
CodeMirror.mimeModes=mimeModes
CodeMirror.resolveMode=resolveMode
CodeMirror.getMode=getMode
CodeMirror.modeExtensions=modeExtensions
CodeMirror.extendMode=extendMode
CodeMirror.copyState=copyState
CodeMirror.startState=startState
CodeMirror.innerMode=innerMode
CodeMirror.commands=commands
CodeMirror.keyMap=keyMap
CodeMirror.keyName=keyName
CodeMirror.isModifierKey=isModifierKey
CodeMirror.lookupKey=lookupKey
CodeMirror.normalizeKeyMap=normalizeKeyMap
CodeMirror.StringStream=StringStream
CodeMirror.SharedTextMarker=SharedTextMarker
CodeMirror.TextMarker=TextMarker
CodeMirror.LineWidget=LineWidget
CodeMirror.e_preventDefault=e_preventDefault
CodeMirror.e_stopPropagation=e_stopPropagation
CodeMirror.e_stop=e_stop
CodeMirror.addClass=addClass
CodeMirror.contains=contains
CodeMirror.rmClass=rmClass
CodeMirror.keyNames=keyNames}
defineOptions(CodeMirror)
addEditorMethods(CodeMirror)
var dontDelegate="iter insert remove copy getEditor constructor".split(" ")
for(var prop in Doc.prototype){if(Doc.prototype.hasOwnProperty(prop)&&indexOf(dontDelegate,prop)<0)
{CodeMirror.prototype[prop]=(function(method){return function(){return method.apply(this.doc,arguments)}})(Doc.prototype[prop])}}
eventMixin(Doc)
CodeMirror.inputStyles={"textarea":TextareaInput,"contenteditable":ContentEditableInput}



CodeMirror.defineMode=function(name){if(!CodeMirror.defaults.mode&&name!="null"){CodeMirror.defaults.mode=name}
defineMode.apply(this,arguments)}
CodeMirror.defineMIME=defineMIME

CodeMirror.defineMode("null",function(){return({token:function(stream){return stream.skipToEnd();}});})
CodeMirror.defineMIME("text/plain","null")
CodeMirror.defineExtension=function(name,func){CodeMirror.prototype[name]=func}
CodeMirror.defineDocExtension=function(name,func){Doc.prototype[name]=func}
CodeMirror.fromTextArea=fromTextArea
addLegacyProps(CodeMirror)
CodeMirror.version="5.21.1"
return CodeMirror;})));
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";function Context(indented,column,type,info,align,prev){this.indented=indented;this.column=column;this.type=type;this.info=info;this.align=align;this.prev=prev;}
function pushContext(state,col,type,info){var indent=state.indented;if(state.context&&state.context.type=="statement"&&type!="statement")
indent=state.context.indented;return state.context=new Context(indent,col,type,info,null,state.context);}
function popContext(state){var t=state.context.type;if(t==")"||t=="]"||t=="}")
state.indented=state.context.indented;return state.context=state.context.prev;}
function typeBefore(stream,state,pos){if(state.prevToken=="variable"||state.prevToken=="variable-3")return true;if(/\S(?:[^- ]>|[*\]])\s*$|\*$/.test(stream.string.slice(0,pos)))return true;if(state.typeAtEndOfLine&&stream.column()==stream.indentation())return true;}
function isTopScope(context){for(;;){if(!context||context.type=="top")return true;if(context.type=="}"&&context.prev.info!="namespace")return false;context=context.prev;}}
CodeMirror.defineMode("clike",function(config,parserConfig){var indentUnit=config.indentUnit,statementIndentUnit=parserConfig.statementIndentUnit||indentUnit,dontAlignCalls=parserConfig.dontAlignCalls,keywords=parserConfig.keywords||{},types=parserConfig.types||{},builtin=parserConfig.builtin||{},blockKeywords=parserConfig.blockKeywords||{},defKeywords=parserConfig.defKeywords||{},atoms=parserConfig.atoms||{},hooks=parserConfig.hooks||{},multiLineStrings=parserConfig.multiLineStrings,indentStatements=parserConfig.indentStatements!==false,indentSwitch=parserConfig.indentSwitch!==false,namespaceSeparator=parserConfig.namespaceSeparator,isPunctuationChar=parserConfig.isPunctuationChar||/[\[\]{}\(\),;\:\.]/,numberStart=parserConfig.numberStart||/[\d\.]/,number=parserConfig.number||/^(?:0x[a-f\d]+|0b[01]+|(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)(u|ll?|l|f)?/i,isOperatorChar=parserConfig.isOperatorChar||/[+\-*&%=<>!?|\/]/;var curPunc,isDefKeyword;function tokenBase(stream,state){var ch=stream.next();if(hooks[ch]){var result=hooks[ch](stream,state);if(result!==false)return result;}
if(ch=='"'||ch=="'"){state.tokenize=tokenString(ch);return state.tokenize(stream,state);}
if(isPunctuationChar.test(ch)){curPunc=ch;return null;}
if(numberStart.test(ch)){stream.backUp(1)
if(stream.match(number))return"number"
stream.next()}
if(ch=="/"){if(stream.eat("*")){state.tokenize=tokenComment;return tokenComment(stream,state);}
if(stream.eat("/")){stream.skipToEnd();return"comment";}}
if(isOperatorChar.test(ch)){while(!stream.match(/^\/[\/*]/,false)&&stream.eat(isOperatorChar)){}
return"operator";}
stream.eatWhile(/[\w\$_\xa1-\uffff]/);if(namespaceSeparator)while(stream.match(namespaceSeparator))
stream.eatWhile(/[\w\$_\xa1-\uffff]/);var cur=stream.current();if(contains(keywords,cur)){if(contains(blockKeywords,cur))curPunc="newstatement";if(contains(defKeywords,cur))isDefKeyword=true;return"keyword";}
if(contains(types,cur))return"variable-3";if(contains(builtin,cur)){if(contains(blockKeywords,cur))curPunc="newstatement";return"builtin";}
if(contains(atoms,cur))return"atom";return"variable";}
function tokenString(quote){return function(stream,state){var escaped=false,next,end=false;while((next=stream.next())!=null){if(next==quote&&!escaped){end=true;break;}
escaped=!escaped&&next=="\\";}
if(end||!(escaped||multiLineStrings))
state.tokenize=null;return"string";};}
function tokenComment(stream,state){var maybeEnd=false,ch;while(ch=stream.next()){if(ch=="/"&&maybeEnd){state.tokenize=null;break;}
maybeEnd=(ch=="*");}
return"comment";}
function maybeEOL(stream,state){if(parserConfig.typeFirstDefinitions&&stream.eol()&&isTopScope(state.context))
state.typeAtEndOfLine=typeBefore(stream,state,stream.pos)} 
return{startState:function(basecolumn){return{tokenize:null,context:new Context((basecolumn||0)-indentUnit,0,"top",null,false),indented:0,startOfLine:true,prevToken:null};},token:function(stream,state){var ctx=state.context;if(stream.sol()){if(ctx.align==null)ctx.align=false;state.indented=stream.indentation();state.startOfLine=true;}
if(stream.eatSpace()){maybeEOL(stream,state);return null;}
curPunc=isDefKeyword=null;var style=(state.tokenize||tokenBase)(stream,state);if(style=="comment"||style=="meta")return style;if(ctx.align==null)ctx.align=true;if(curPunc==";"||curPunc==":"||(curPunc==","&&stream.match(/^\s*(?:\/\/.*)?$/,false)))
while(state.context.type=="statement")popContext(state);else if(curPunc=="{")pushContext(state,stream.column(),"}");else if(curPunc=="[")pushContext(state,stream.column(),"]");else if(curPunc=="(")pushContext(state,stream.column(),")");else if(curPunc=="}"){while(ctx.type=="statement")ctx=popContext(state);if(ctx.type=="}")ctx=popContext(state);while(ctx.type=="statement")ctx=popContext(state);}
else if(curPunc==ctx.type)popContext(state);else if(indentStatements&&(((ctx.type=="}"||ctx.type=="top")&&curPunc!=";")||(ctx.type=="statement"&&curPunc=="newstatement"))){pushContext(state,stream.column(),"statement",stream.current());}
if(style=="variable"&&((state.prevToken=="def"||(parserConfig.typeFirstDefinitions&&typeBefore(stream,state,stream.start)&&isTopScope(state.context)&&stream.match(/^\s*\(/,false)))))
style="def";if(hooks.token){var result=hooks.token(stream,state,style);if(result!==undefined)style=result;}
if(style=="def"&&parserConfig.styleDefs===false)style="variable";state.startOfLine=false;state.prevToken=isDefKeyword?"def":style||curPunc;maybeEOL(stream,state);return style;},indent:function(state,textAfter){if(state.tokenize!=tokenBase&&state.tokenize!=null||state.typeAtEndOfLine)return CodeMirror.Pass;var ctx=state.context,firstChar=textAfter&&textAfter.charAt(0);if(ctx.type=="statement"&&firstChar=="}")ctx=ctx.prev;if(parserConfig.dontIndentStatements)
while(ctx.type=="statement"&&parserConfig.dontIndentStatements.test(ctx.info))
ctx=ctx.prev
if(hooks.indent){var hook=hooks.indent(state,ctx,textAfter);if(typeof hook=="number")return hook}
var closing=firstChar==ctx.type;var switchBlock=ctx.prev&&ctx.prev.info=="switch";if(parserConfig.allmanIndentation&&/[{(]/.test(firstChar)){while(ctx.type!="top"&&ctx.type!="}")ctx=ctx.prev
return ctx.indented}
if(ctx.type=="statement")
return ctx.indented+(firstChar=="{"?0:statementIndentUnit);if(ctx.align&&(!dontAlignCalls||ctx.type!=")"))
return ctx.column+(closing?0:1);if(ctx.type==")"&&!closing)
return ctx.indented+statementIndentUnit;return ctx.indented+(closing?0:indentUnit)+
(!closing&&switchBlock&&!/^(?:case|default)\b/.test(textAfter)?indentUnit:0);},electricInput:indentSwitch?/^\s*(?:case .*?:|default:|\{\}?|\})$/:/^\s*[{}]$/,blockCommentStart:"/*",blockCommentEnd:"*/",lineComment:"//",fold:"brace"};});function words(str){var obj={},words=str.split(" ");for(var i=0;i<words.length;++i)obj[words[i]]=true;return obj;}
function contains(words,word){if(typeof words==="function"){return words(word);}else{return words.propertyIsEnumerable(word);}}
var cKeywords="auto if break case register continue return default do sizeof "+"static else struct switch extern typedef union for goto while enum const volatile";var cTypes="int long char short double float unsigned signed void size_t ptrdiff_t";function cppHook(stream,state){if(!state.startOfLine)return false
for(var ch,next=null;ch=stream.peek();){if(ch=="\\"&&stream.match(/^.$/)){next=cppHook
break}else if(ch=="/"&&stream.match(/^\/[\/\*]/,false)){break}
stream.next()}
state.tokenize=next
return"meta"}
function pointerHook(_stream,state){if(state.prevToken=="variable-3")return"variable-3";return false;}
function cpp14Literal(stream){stream.eatWhile(/[\w\.']/);return"number";}
function cpp11StringHook(stream,state){stream.backUp(1);if(stream.match(/(R|u8R|uR|UR|LR)/)){var match=stream.match(/"([^\s\\()]{0,16})\(/);if(!match){return false;}
state.cpp11RawStringDelim=match[1];state.tokenize=tokenRawString;return tokenRawString(stream,state);}
if(stream.match(/(u8|u|U|L)/)){if(stream.match(/["']/,false)){return"string";}
return false;}
stream.next();return false;}
function cppLooksLikeConstructor(word){var lastTwo=/(\w+)::(\w+)$/.exec(word);return lastTwo&&lastTwo[1]==lastTwo[2];}
function tokenAtString(stream,state){var next;while((next=stream.next())!=null){if(next=='"'&&!stream.eat('"')){state.tokenize=null;break;}}
return"string";}

function tokenRawString(stream,state){var delim=state.cpp11RawStringDelim.replace(/[^\w\s]/g,'\\$&');var match=stream.match(new RegExp(".*?\\)"+delim+'"'));if(match)
state.tokenize=null;else
stream.skipToEnd();return"string";}
function def(mimes,mode){if(typeof mimes=="string")mimes=[mimes];var words=[];function add(obj){if(obj)for(var prop in obj)if(obj.hasOwnProperty(prop))
words.push(prop);}
add(mode.keywords);add(mode.types);add(mode.builtin);add(mode.atoms);if(words.length){mode.helperType=mimes[0];CodeMirror.registerHelper("hintWords",mimes[0],words);}
for(var i=0;i<mimes.length;++i)
CodeMirror.defineMIME(mimes[i],mode);}
def(["text/x-csrc","text/x-c","text/x-chdr"],{name:"clike",keywords:words(cKeywords),types:words(cTypes+" bool _Complex _Bool float_t double_t intptr_t intmax_t "+"int8_t int16_t int32_t int64_t uintptr_t uintmax_t uint8_t uint16_t "+"uint32_t uint64_t"),blockKeywords:words("case do else for if switch while struct"),defKeywords:words("struct"),typeFirstDefinitions:true,atoms:words("null true false"),hooks:{"#":cppHook,"*":pointerHook},modeProps:{fold:["brace","include"]}});def(["text/x-c++src","text/x-c++hdr"],{name:"clike",keywords:words(cKeywords+" asm dynamic_cast namespace reinterpret_cast try explicit new "+"static_cast typeid catch operator template typename class friend private "+"this using const_cast inline public throw virtual delete mutable protected "+"alignas alignof constexpr decltype nullptr noexcept thread_local final "+"static_assert override"),types:words(cTypes+" bool wchar_t"),blockKeywords:words("catch class do else finally for if struct switch try while"),defKeywords:words("class namespace struct enum union"),typeFirstDefinitions:true,atoms:words("true false null"),dontIndentStatements:/^template$/,hooks:{"#":cppHook,"*":pointerHook,"u":cpp11StringHook,"U":cpp11StringHook,"L":cpp11StringHook,"R":cpp11StringHook,"0":cpp14Literal,"1":cpp14Literal,"2":cpp14Literal,"3":cpp14Literal,"4":cpp14Literal,"5":cpp14Literal,"6":cpp14Literal,"7":cpp14Literal,"8":cpp14Literal,"9":cpp14Literal,token:function(stream,state,style){if(style=="variable"&&stream.peek()=="("&&(state.prevToken==";"||state.prevToken==null||state.prevToken=="}")&&cppLooksLikeConstructor(stream.current()))
return"def";}},namespaceSeparator:"::",modeProps:{fold:["brace","include"]}});def("text/x-java",{name:"clike",keywords:words("abstract assert break case catch class const continue default "+"do else enum extends final finally float for goto if implements import "+"instanceof interface native new package private protected public "+"return static strictfp super switch synchronized this throw throws transient "+"try volatile while"),types:words("byte short int long float double boolean char void Boolean Byte Character Double Float "+"Integer Long Number Object Short String StringBuffer StringBuilder Void"),blockKeywords:words("catch class do else finally for if switch try while"),defKeywords:words("class interface package enum"),typeFirstDefinitions:true,atoms:words("true false null"),number:/^(?:0x[a-f\d_]+|0b[01_]+|(?:[\d_]+\.?\d*|\.\d+)(?:e[-+]?[\d_]+)?)(u|ll?|l|f)?/i,hooks:{"@":function(stream){stream.eatWhile(/[\w\$_]/);return"meta";}},modeProps:{fold:["brace","import"]}});def("text/x-csharp",{name:"clike",keywords:words("abstract as async await base break case catch checked class const continue"+" default delegate do else enum event explicit extern finally fixed for"+" foreach goto if implicit in interface internal is lock namespace new"+" operator out override params private protected public readonly ref return sealed"+" sizeof stackalloc static struct switch this throw try typeof unchecked"+" unsafe using virtual void volatile while add alias ascending descending dynamic from get"+" global group into join let orderby partial remove select set value var yield"),types:words("Action Boolean Byte Char DateTime DateTimeOffset Decimal Double Func"+" Guid Int16 Int32 Int64 Object SByte Single String Task TimeSpan UInt16 UInt32"+" UInt64 bool byte char decimal double short int long object"+" sbyte float string ushort uint ulong"),blockKeywords:words("catch class do else finally for foreach if struct switch try while"),defKeywords:words("class interface namespace struct var"),typeFirstDefinitions:true,atoms:words("true false null"),hooks:{"@":function(stream,state){if(stream.eat('"')){state.tokenize=tokenAtString;return tokenAtString(stream,state);}
stream.eatWhile(/[\w\$_]/);return"meta";}}});function tokenTripleString(stream,state){var escaped=false;while(!stream.eol()){if(!escaped&&stream.match('"""')){state.tokenize=null;break;}
escaped=stream.next()=="\\"&&!escaped;}
return"string";}
def("text/x-scala",{name:"clike",keywords:words("abstract case catch class def do else extends final finally for forSome if "+"implicit import lazy match new null object override package private protected return "+"sealed super this throw trait try type val var while with yield _ : = => <- <: "+"<% >: # @ "+
"assert assume require print println printf readLine readBoolean readByte readShort "+"readChar readInt readLong readFloat readDouble "+":: #:: "),types:words("AnyVal App Application Array BufferedIterator BigDecimal BigInt Char Console Either "+"Enumeration Equiv Error Exception Fractional Function IndexedSeq Int Integral Iterable "+"Iterator List Map Numeric Nil NotNull Option Ordered Ordering PartialFunction PartialOrdering "+"Product Proxy Range Responder Seq Serializable Set Specializable Stream StringBuilder "+"StringContext Symbol Throwable Traversable TraversableOnce Tuple Unit Vector "+
"Boolean Byte Character CharSequence Class ClassLoader Cloneable Comparable "+"Compiler Double Exception Float Integer Long Math Number Object Package Pair Process "+"Runtime Runnable SecurityManager Short StackTraceElement StrictMath String "+"StringBuffer System Thread ThreadGroup ThreadLocal Throwable Triple Void"),multiLineStrings:true,blockKeywords:words("catch class do else finally for forSome if match switch try while"),defKeywords:words("class def object package trait type val var"),atoms:words("true false null"),indentStatements:false,indentSwitch:false,hooks:{"@":function(stream){stream.eatWhile(/[\w\$_]/);return"meta";},'"':function(stream,state){if(!stream.match('""'))return false;state.tokenize=tokenTripleString;return state.tokenize(stream,state);},"'":function(stream){stream.eatWhile(/[\w\$_\xa1-\uffff]/);return"atom";},"=":function(stream,state){var cx=state.context
if(cx.type=="}"&&cx.align&&stream.eat(">")){state.context=new Context(cx.indented,cx.column,cx.type,cx.info,null,cx.prev)
return"operator"}else{return false}}},modeProps:{closeBrackets:{triples:'"'}}});function tokenKotlinString(tripleString){return function(stream,state){var escaped=false,next,end=false;while(!stream.eol()){if(!tripleString&&!escaped&&stream.match('"')){end=true;break;}
if(tripleString&&stream.match('"""')){end=true;break;}
next=stream.next();if(!escaped&&next=="$"&&stream.match('{'))
stream.skipTo("}");escaped=!escaped&&next=="\\"&&!tripleString;}
if(end||!tripleString)
state.tokenize=null;return"string";}}
def("text/x-kotlin",{name:"clike",keywords:words("package as typealias class interface this super val "+"var fun for is in This throw return "+"break continue object if else while do try when !in !is as? "+
"file import where by get set abstract enum open inner override private public internal "+"protected catch finally out final vararg reified dynamic companion constructor init "+"sealed field property receiver param sparam lateinit data inline noinline tailrec "+"external annotation crossinline const operator infix"),types:words("Boolean Byte Character CharSequence Class ClassLoader Cloneable Comparable "+"Compiler Double Exception Float Integer Long Math Number Object Package Pair Process "+"Runtime Runnable SecurityManager Short StackTraceElement StrictMath String "+"StringBuffer System Thread ThreadGroup ThreadLocal Throwable Triple Void"),intendSwitch:false,indentStatements:false,multiLineStrings:true,blockKeywords:words("catch class do else finally for if where try while enum"),defKeywords:words("class val var object package interface fun"),atoms:words("true false null this"),hooks:{'"':function(stream,state){state.tokenize=tokenKotlinString(stream.match('""'));return state.tokenize(stream,state);}},modeProps:{closeBrackets:{triples:'"'}}});def(["x-shader/x-vertex","x-shader/x-fragment"],{name:"clike",keywords:words("sampler1D sampler2D sampler3D samplerCube "+"sampler1DShadow sampler2DShadow "+"const attribute uniform varying "+"break continue discard return "+"for while do if else struct "+"in out inout"),types:words("float int bool void "+"vec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4 "+"mat2 mat3 mat4"),blockKeywords:words("for while do if else struct"),builtin:words("radians degrees sin cos tan asin acos atan "+"pow exp log exp2 sqrt inversesqrt "+"abs sign floor ceil fract mod min max clamp mix step smoothstep "+"length distance dot cross normalize ftransform faceforward "+"reflect refract matrixCompMult "+"lessThan lessThanEqual greaterThan greaterThanEqual "+"equal notEqual any all not "+"texture1D texture1DProj texture1DLod texture1DProjLod "+"texture2D texture2DProj texture2DLod texture2DProjLod "+"texture3D texture3DProj texture3DLod texture3DProjLod "+"textureCube textureCubeLod "+"shadow1D shadow2D shadow1DProj shadow2DProj "+"shadow1DLod shadow2DLod shadow1DProjLod shadow2DProjLod "+"dFdx dFdy fwidth "+"noise1 noise2 noise3 noise4"),atoms:words("true false "+"gl_FragColor gl_SecondaryColor gl_Normal gl_Vertex "+"gl_MultiTexCoord0 gl_MultiTexCoord1 gl_MultiTexCoord2 gl_MultiTexCoord3 "+"gl_MultiTexCoord4 gl_MultiTexCoord5 gl_MultiTexCoord6 gl_MultiTexCoord7 "+"gl_FogCoord gl_PointCoord "+"gl_Position gl_PointSize gl_ClipVertex "+"gl_FrontColor gl_BackColor gl_FrontSecondaryColor gl_BackSecondaryColor "+"gl_TexCoord gl_FogFragCoord "+"gl_FragCoord gl_FrontFacing "+"gl_FragData gl_FragDepth "+"gl_ModelViewMatrix gl_ProjectionMatrix gl_ModelViewProjectionMatrix "+"gl_TextureMatrix gl_NormalMatrix gl_ModelViewMatrixInverse "+"gl_ProjectionMatrixInverse gl_ModelViewProjectionMatrixInverse "+"gl_TexureMatrixTranspose gl_ModelViewMatrixInverseTranspose "+"gl_ProjectionMatrixInverseTranspose "+"gl_ModelViewProjectionMatrixInverseTranspose "+"gl_TextureMatrixInverseTranspose "+"gl_NormalScale gl_DepthRange gl_ClipPlane "+"gl_Point gl_FrontMaterial gl_BackMaterial gl_LightSource gl_LightModel "+"gl_FrontLightModelProduct gl_BackLightModelProduct "+"gl_TextureColor gl_EyePlaneS gl_EyePlaneT gl_EyePlaneR gl_EyePlaneQ "+"gl_FogParameters "+"gl_MaxLights gl_MaxClipPlanes gl_MaxTextureUnits gl_MaxTextureCoords "+"gl_MaxVertexAttribs gl_MaxVertexUniformComponents gl_MaxVaryingFloats "+"gl_MaxVertexTextureImageUnits gl_MaxTextureImageUnits "+"gl_MaxFragmentUniformComponents gl_MaxCombineTextureImageUnits "+"gl_MaxDrawBuffers"),indentSwitch:false,hooks:{"#":cppHook},modeProps:{fold:["brace","include"]}});def("text/x-nesc",{name:"clike",keywords:words(cKeywords+"as atomic async call command component components configuration event generic "+"implementation includes interface module new norace nx_struct nx_union post provides "+"signal task uses abstract extends"),types:words(cTypes),blockKeywords:words("case do else for if switch while struct"),atoms:words("null true false"),hooks:{"#":cppHook},modeProps:{fold:["brace","include"]}});def("text/x-objectivec",{name:"clike",keywords:words(cKeywords+"inline restrict _Bool _Complex _Imaginary BOOL Class bycopy byref id IMP in "+"inout nil oneway out Protocol SEL self super atomic nonatomic retain copy readwrite readonly"),types:words(cTypes),atoms:words("YES NO NULL NILL ON OFF true false"),hooks:{"@":function(stream){stream.eatWhile(/[\w\$]/);return"keyword";},"#":cppHook,indent:function(_state,ctx,textAfter){if(ctx.type=="statement"&&/^@\w/.test(textAfter))return ctx.indented}},modeProps:{fold:"brace"}});def("text/x-squirrel",{name:"clike",keywords:words("base break clone continue const default delete enum extends function in class"+" foreach local resume return this throw typeof yield constructor instanceof static"),types:words(cTypes),blockKeywords:words("case catch class else for foreach if switch try while"),defKeywords:words("function local class"),typeFirstDefinitions:true,atoms:words("true false null"),hooks:{"#":cppHook},modeProps:{fold:["brace","include"]}}); var stringTokenizer=null;function tokenCeylonString(type){return function(stream,state){var escaped=false,next,end=false;while(!stream.eol()){if(!escaped&&stream.match('"')&&(type=="single"||stream.match('""'))){end=true;break;}
if(!escaped&&stream.match('``')){stringTokenizer=tokenCeylonString(type);end=true;break;}
next=stream.next();escaped=type=="single"&&!escaped&&next=="\\";}
if(end)
state.tokenize=null;return"string";}}
def("text/x-ceylon",{name:"clike",keywords:words("abstracts alias assembly assert assign break case catch class continue dynamic else"+" exists extends finally for function given if import in interface is let module new"+" nonempty object of out outer package return satisfies super switch then this throw"+" try value void while"),types:function(word){ var first=word.charAt(0);return(first===first.toUpperCase()&&first!==first.toLowerCase());},blockKeywords:words("case catch class dynamic else finally for function if interface module new object switch try while"),defKeywords:words("class dynamic function interface module object package value"),builtin:words("abstract actual aliased annotation by default deprecated doc final formal late license"+" native optional sealed see serializable shared suppressWarnings tagged throws variable"),isPunctuationChar:/[\[\]{}\(\),;\:\.`]/,isOperatorChar:/[+\-*&%=<>!?|^~:\/]/,numberStart:/[\d#$]/,number:/^(?:#[\da-fA-F_]+|\$[01_]+|[\d_]+[kMGTPmunpf]?|[\d_]+\.[\d_]+(?:[eE][-+]?\d+|[kMGTPmunpf]|)|)/i,multiLineStrings:true,typeFirstDefinitions:true,atoms:words("true false null larger smaller equal empty finished"),indentSwitch:false,styleDefs:false,hooks:{"@":function(stream){stream.eatWhile(/[\w\$_]/);return"meta";},'"':function(stream,state){state.tokenize=tokenCeylonString(stream.match('""')?"triple":"single");return state.tokenize(stream,state);},'`':function(stream,state){if(!stringTokenizer||!stream.match('`'))return false;state.tokenize=stringTokenizer;stringTokenizer=null;return state.tokenize(stream,state);},"'":function(stream){stream.eatWhile(/[\w\$_\xa1-\uffff]/);return"atom";},token:function(_stream,state,style){if((style=="variable"||style=="variable-3")&&state.prevToken=="."){return"variable-2";}}},modeProps:{fold:["brace","import"],closeBrackets:{triples:'"'}}});});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";CodeMirror.defineMode("clojure",function(options){var BUILTIN="builtin",COMMENT="comment",STRING="string",CHARACTER="string-2",ATOM="atom",NUMBER="number",BRACKET="bracket",KEYWORD="keyword",VAR="variable";var INDENT_WORD_SKIP=options.indentUnit||2;var NORMAL_INDENT_UNIT=options.indentUnit||2;function makeKeywords(str){var obj={},words=str.split(" ");for(var i=0;i<words.length;++i)obj[words[i]]=true;return obj;}
var atoms=makeKeywords("true false nil");var keywords=makeKeywords("defn defn- def def- defonce defmulti defmethod defmacro defstruct deftype defprotocol defrecord defproject deftest "+"slice defalias defhinted defmacro- defn-memo defnk defnk defonce- defunbound defunbound- defvar defvar- let letfn "+"do case cond condp for loop recur when when-not when-let when-first if if-let if-not . .. -> ->> doto and or dosync "+"doseq dotimes dorun doall load import unimport ns in-ns refer try catch finally throw with-open with-local-vars "+"binding gen-class gen-and-load-class gen-and-save-class handler-case handle");var builtins=makeKeywords("* *' *1 *2 *3 *agent* *allow-unresolved-vars* *assert* *clojure-version* *command-line-args* *compile-files* "+"*compile-path* *compiler-options* *data-readers* *e *err* *file* *flush-on-newline* *fn-loader* *in* "+"*math-context* *ns* *out* *print-dup* *print-length* *print-level* *print-meta* *print-readably* *read-eval* "+"*source-path* *unchecked-math* *use-context-classloader* *verbose-defrecords* *warn-on-reflection* + +' - -' -> "+"->> ->ArrayChunk ->Vec ->VecNode ->VecSeq -cache-protocol-fn -reset-methods .. / < <= = == > >= EMPTY-NODE accessor "+"aclone add-classpath add-watch agent agent-error agent-errors aget alength alias all-ns alter alter-meta! "+"alter-var-root amap ancestors and apply areduce array-map aset aset-boolean aset-byte aset-char aset-double "+"aset-float aset-int aset-long aset-short assert assoc assoc! assoc-in associative? atom await await-for await1 "+"bases bean bigdec bigint biginteger binding bit-and bit-and-not bit-clear bit-flip bit-not bit-or bit-set "+"bit-shift-left bit-shift-right bit-test bit-xor boolean boolean-array booleans bound-fn bound-fn* bound? butlast "+"byte byte-array bytes case cat cast char char-array char-escape-string char-name-string char? chars chunk chunk-append "+"chunk-buffer chunk-cons chunk-first chunk-next chunk-rest chunked-seq? class class? clear-agent-errors "+"clojure-version coll? comment commute comp comparator compare compare-and-set! compile complement completing concat cond condp "+"conj conj! cons constantly construct-proxy contains? count counted? create-ns create-struct cycle dec dec' decimal? "+"declare dedupe default-data-readers definline definterface defmacro defmethod defmulti defn defn- defonce defprotocol "+"defrecord defstruct deftype delay delay? deliver denominator deref derive descendants destructure disj disj! dissoc "+"dissoc! distinct distinct? doall dorun doseq dosync dotimes doto double double-array doubles drop drop-last "+"drop-while eduction empty empty? ensure enumeration-seq error-handler error-mode eval even? every-pred every? ex-data ex-info "+"extend extend-protocol extend-type extenders extends? false? ffirst file-seq filter filterv find find-keyword "+"find-ns find-protocol-impl find-protocol-method find-var first flatten float float-array float? floats flush fn fn? "+"fnext fnil for force format frequencies future future-call future-cancel future-cancelled? future-done? future? "+"gen-class gen-interface gensym get get-in get-method get-proxy-class get-thread-bindings get-validator group-by hash "+"hash-combine hash-map hash-set identical? identity if-let if-not ifn? import in-ns inc inc' init-proxy instance? "+"int int-array integer? interleave intern interpose into into-array ints io! isa? iterate iterator-seq juxt keep "+"keep-indexed key keys keyword keyword? last lazy-cat lazy-seq let letfn line-seq list list* list? load load-file "+"load-reader load-string loaded-libs locking long long-array longs loop macroexpand macroexpand-1 make-array "+"make-hierarchy map map-indexed map? mapcat mapv max max-key memfn memoize merge merge-with meta method-sig methods "+"min min-key mod munge name namespace namespace-munge neg? newline next nfirst nil? nnext not not-any? not-empty "+"not-every? not= ns ns-aliases ns-imports ns-interns ns-map ns-name ns-publics ns-refers ns-resolve ns-unalias "+"ns-unmap nth nthnext nthrest num number? numerator object-array odd? or parents partial partition partition-all "+"partition-by pcalls peek persistent! pmap pop pop! pop-thread-bindings pos? pr pr-str prefer-method prefers "+"primitives-classnames print print-ctor print-dup print-method print-simple print-str printf println println-str "+"prn prn-str promise proxy proxy-call-with-super proxy-mappings proxy-name proxy-super push-thread-bindings pvalues "+"quot rand rand-int rand-nth random-sample range ratio? rational? rationalize re-find re-groups re-matcher re-matches re-pattern "+"re-seq read read-line read-string realized? reduce reduce-kv reductions ref ref-history-count ref-max-history "+"ref-min-history ref-set refer refer-clojure reify release-pending-sends rem remove remove-all-methods "+"remove-method remove-ns remove-watch repeat repeatedly replace replicate require reset! reset-meta! resolve rest "+"restart-agent resultset-seq reverse reversible? rseq rsubseq satisfies? second select-keys send send-off seq seq? "+"seque sequence sequential? set set-error-handler! set-error-mode! set-validator! set? short short-array shorts "+"shuffle shutdown-agents slurp some some-fn sort sort-by sorted-map sorted-map-by sorted-set sorted-set-by sorted? "+"special-symbol? spit split-at split-with str string? struct struct-map subs subseq subvec supers swap! symbol "+"symbol? sync take take-last take-nth take-while test the-ns thread-bound? time to-array to-array-2d trampoline transduce "+"transient tree-seq true? type unchecked-add unchecked-add-int unchecked-byte unchecked-char unchecked-dec "+"unchecked-dec-int unchecked-divide-int unchecked-double unchecked-float unchecked-inc unchecked-inc-int "+"unchecked-int unchecked-long unchecked-multiply unchecked-multiply-int unchecked-negate unchecked-negate-int "+"unchecked-remainder-int unchecked-short unchecked-subtract unchecked-subtract-int underive unquote "+"unquote-splicing update update-in update-proxy use val vals var-get var-set var? vary-meta vec vector vector-of "+"vector? volatile! volatile? vreset! vswap! when when-first when-let when-not while with-bindings with-bindings* with-in-str with-loading-context "+"with-local-vars with-meta with-open with-out-str with-precision with-redefs with-redefs-fn xml-seq zero? zipmap "+"*default-data-reader-fn* as-> cond-> cond->> reduced reduced? send-via set-agent-send-executor! "+"set-agent-send-off-executor! some-> some->>");var indentKeys=makeKeywords("ns fn def defn defmethod bound-fn if if-not case condp when while when-not when-first do future comment doto "+"locking proxy with-open with-precision reify deftype defrecord defprotocol extend extend-protocol extend-type "+"try catch "+
"let letfn binding loop for doseq dotimes when-let if-let "+
"defstruct struct-map assoc "+
"testing deftest "+
"handler-case handle dotrace deftrace");var tests={digit:/\d/,digit_or_colon:/[\d:]/,hex:/[0-9a-f]/i,sign:/[+-]/,exponent:/e/i,keyword_char:/[^\s\(\[\;\)\]]/,symbol:/[\w*+!\-\._?:<>\/\xa1-\uffff]/,block_indent:/^(?:def|with)[^\/]+$|\/(?:def|with)/};function stateStack(indent,type,prev){ this.indent=indent;this.type=type;this.prev=prev;}
function pushStack(state,indent,type){state.indentStack=new stateStack(indent,type,state.indentStack);}
function popStack(state){state.indentStack=state.indentStack.prev;}
function isNumber(ch,stream){ if(ch==='0'&&stream.eat(/x/i)){stream.eatWhile(tests.hex);return true;} 
if((ch=='+'||ch=='-')&&(tests.digit.test(stream.peek()))){stream.eat(tests.sign);ch=stream.next();}
if(tests.digit.test(ch)){stream.eat(ch);stream.eatWhile(tests.digit);if('.'==stream.peek()){stream.eat('.');stream.eatWhile(tests.digit);}else if('/'==stream.peek()){stream.eat('/');stream.eatWhile(tests.digit);}
if(stream.eat(tests.exponent)){stream.eat(tests.sign);stream.eatWhile(tests.digit);}
return true;}
return false;} 
function eatCharacter(stream){var first=stream.next();if(first&&first.match(/[a-z]/)&&stream.match(/[a-z]+/,true)){return;} 
if(first==="u"){stream.match(/[0-9a-z]{4}/i,true);}}
return{startState:function(){return{indentStack:null,indentation:0,mode:false};},token:function(stream,state){if(state.indentStack==null&&stream.sol()){ state.indentation=stream.indentation();} 
if(state.mode!="string"&&stream.eatSpace()){return null;}
var returnType=null;switch(state.mode){case"string": var next,escaped=false;while((next=stream.next())!=null){if(next=="\""&&!escaped){state.mode=false;break;}
escaped=!escaped&&next=="\\";}
returnType=STRING; break;default: var ch=stream.next();if(ch=="\""){state.mode="string";returnType=STRING;}else if(ch=="\\"){eatCharacter(stream);returnType=CHARACTER;}else if(ch=="'"&&!(tests.digit_or_colon.test(stream.peek()))){returnType=ATOM;}else if(ch==";"){ stream.skipToEnd(); returnType=COMMENT;}else if(isNumber(ch,stream)){returnType=NUMBER;}else if(ch=="("||ch=="["||ch=="{"){var keyWord='',indentTemp=stream.column(),letter;if(ch=="(")while((letter=stream.eat(tests.keyword_char))!=null){keyWord+=letter;}
if(keyWord.length>0&&(indentKeys.propertyIsEnumerable(keyWord)||tests.block_indent.test(keyWord))){ pushStack(state,indentTemp+INDENT_WORD_SKIP,ch);}else{
 stream.eatSpace();if(stream.eol()||stream.peek()==";"){
 pushStack(state,indentTemp+NORMAL_INDENT_UNIT,ch);}else{pushStack(state,indentTemp+stream.current().length,ch);}}
stream.backUp(stream.current().length-1); returnType=BRACKET;}else if(ch==")"||ch=="]"||ch=="}"){returnType=BRACKET;if(state.indentStack!=null&&state.indentStack.type==(ch==")"?"(":(ch=="]"?"[":"{"))){popStack(state);}}else if(ch==":"){stream.eatWhile(tests.symbol);return ATOM;}else{stream.eatWhile(tests.symbol);if(keywords&&keywords.propertyIsEnumerable(stream.current())){returnType=KEYWORD;}else if(builtins&&builtins.propertyIsEnumerable(stream.current())){returnType=BUILTIN;}else if(atoms&&atoms.propertyIsEnumerable(stream.current())){returnType=ATOM;}else{returnType=VAR;}}}
return returnType;},indent:function(state){if(state.indentStack==null)return state.indentation;return state.indentStack.indent;},closeBrackets:{pairs:"()[]{}\"\""},lineComment:";;"};});CodeMirror.defineMIME("text/x-clojure","clojure");CodeMirror.defineMIME("text/x-clojurescript","clojure");CodeMirror.defineMIME("application/edn","clojure");});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){var defaults={pairs:"()[]{}''\"\"",triples:"",explode:"[]{}"};var Pos=CodeMirror.Pos;CodeMirror.defineOption("autoCloseBrackets",false,function(cm,val,old){if(old&&old!=CodeMirror.Init){cm.removeKeyMap(keyMap);cm.state.closeBrackets=null;}
if(val){cm.state.closeBrackets=val;cm.addKeyMap(keyMap);}});function getOption(conf,name){if(name=="pairs"&&typeof conf=="string")return conf;if(typeof conf=="object"&&conf[name]!=null)return conf[name];return defaults[name];}
var bind=defaults.pairs+"`";var keyMap={Backspace:handleBackspace,Enter:handleEnter};for(var i=0;i<bind.length;i++)
keyMap["'"+bind.charAt(i)+"'"]=handler(bind.charAt(i));function handler(ch){return function(cm){return handleChar(cm,ch);};}
function getConfig(cm){var deflt=cm.state.closeBrackets;if(!deflt)return null;var mode=cm.getModeAt(cm.getCursor());return mode.closeBrackets||deflt;}
function handleBackspace(cm){var conf=getConfig(cm);if(!conf||cm.getOption("disableInput"))return CodeMirror.Pass;var pairs=getOption(conf,"pairs");var ranges=cm.listSelections();for(var i=0;i<ranges.length;i++){if(!ranges[i].empty())return CodeMirror.Pass;var around=charsAround(cm,ranges[i].head);if(!around||pairs.indexOf(around)%2!=0)return CodeMirror.Pass;}
for(var i=ranges.length-1;i>=0;i--){var cur=ranges[i].head;cm.replaceRange("",Pos(cur.line,cur.ch-1),Pos(cur.line,cur.ch+1),"+delete");}}
function handleEnter(cm){var conf=getConfig(cm);var explode=conf&&getOption(conf,"explode");if(!explode||cm.getOption("disableInput"))return CodeMirror.Pass;var ranges=cm.listSelections();for(var i=0;i<ranges.length;i++){if(!ranges[i].empty())return CodeMirror.Pass;var around=charsAround(cm,ranges[i].head);if(!around||explode.indexOf(around)%2!=0)return CodeMirror.Pass;}
cm.operation(function(){cm.replaceSelection("\n\n",null);cm.execCommand("goCharLeft");ranges=cm.listSelections();for(var i=0;i<ranges.length;i++){var line=ranges[i].head.line;cm.indentLine(line,null,true);cm.indentLine(line+1,null,true);}});}
function contractSelection(sel){var inverted=CodeMirror.cmpPos(sel.anchor,sel.head)>0;return{anchor:new Pos(sel.anchor.line,sel.anchor.ch+(inverted?-1:1)),head:new Pos(sel.head.line,sel.head.ch+(inverted?1:-1))};}
function handleChar(cm,ch){var conf=getConfig(cm);if(!conf||cm.getOption("disableInput"))return CodeMirror.Pass;var pairs=getOption(conf,"pairs");var pos=pairs.indexOf(ch);if(pos==-1)return CodeMirror.Pass;var triples=getOption(conf,"triples");var identical=pairs.charAt(pos+1)==ch;var ranges=cm.listSelections();var opening=pos%2==0;var type;for(var i=0;i<ranges.length;i++){var range=ranges[i],cur=range.head,curType;var next=cm.getRange(cur,Pos(cur.line,cur.ch+1));if(opening&&!range.empty()){curType="surround";}else if((identical||!opening)&&next==ch){if(identical&&stringStartsAfter(cm,cur))
curType="both";else if(triples.indexOf(ch)>=0&&cm.getRange(cur,Pos(cur.line,cur.ch+3))==ch+ch+ch)
curType="skipThree";else
curType="skip";}else if(identical&&cur.ch>1&&triples.indexOf(ch)>=0&&cm.getRange(Pos(cur.line,cur.ch-2),cur)==ch+ch&&(cur.ch<=2||cm.getRange(Pos(cur.line,cur.ch-3),Pos(cur.line,cur.ch-2))!=ch)){curType="addFour";}else if(identical){if(!CodeMirror.isWordChar(next)&&enteringString(cm,cur,ch))curType="both";else return CodeMirror.Pass;}else if(opening&&(cm.getLine(cur.line).length==cur.ch||isClosingBracket(next,pairs)||/\s/.test(next))){curType="both";}else{return CodeMirror.Pass;}
if(!type)type=curType;else if(type!=curType)return CodeMirror.Pass;}
var left=pos%2?pairs.charAt(pos-1):ch;var right=pos%2?ch:pairs.charAt(pos+1);cm.operation(function(){if(type=="skip"){cm.execCommand("goCharRight");}else if(type=="skipThree"){for(var i=0;i<3;i++)
cm.execCommand("goCharRight");}else if(type=="surround"){var sels=cm.getSelections();for(var i=0;i<sels.length;i++)
sels[i]=left+sels[i]+right;cm.replaceSelections(sels,"around");sels=cm.listSelections().slice();for(var i=0;i<sels.length;i++)
sels[i]=contractSelection(sels[i]);cm.setSelections(sels);}else if(type=="both"){cm.replaceSelection(left+right,null);cm.triggerElectric(left+right);cm.execCommand("goCharLeft");}else if(type=="addFour"){cm.replaceSelection(left+left+left+left,"before");cm.execCommand("goCharRight");}});}
function isClosingBracket(ch,pairs){var pos=pairs.lastIndexOf(ch);return pos>-1&&pos%2==1;}
function charsAround(cm,pos){var str=cm.getRange(Pos(pos.line,pos.ch-1),Pos(pos.line,pos.ch+1));return str.length==2?str:null;}


function enteringString(cm,pos,ch){var line=cm.getLine(pos.line);var token=cm.getTokenAt(pos);if(/\bstring2?\b/.test(token.type))return false;var stream=new CodeMirror.StringStream(line.slice(0,pos.ch)+ch+line.slice(pos.ch),4);stream.pos=stream.start=token.start;for(;;){var type1=cm.getMode().token(stream,token.state);if(stream.pos>=pos.ch+1)return/\bstring2?\b/.test(type1);stream.start=stream.pos;}}
function stringStartsAfter(cm,pos){var token=cm.getTokenAt(Pos(pos.line,pos.ch+1))
return/\bstring/.test(token.type)&&token.start==pos.ch}});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";CodeMirror.defineMode("coffeescript",function(conf,parserConf){var ERRORCLASS="error";function wordRegexp(words){return new RegExp("^(("+words.join(")|(")+"))\\b");}
var operators=/^(?:->|=>|\+[+=]?|-[\-=]?|\*[\*=]?|\/[\/=]?|[=!]=|<[><]?=?|>>?=?|%=?|&=?|\|=?|\^=?|\~|!|\?|(or|and|\|\||&&|\?)=)/;var delimiters=/^(?:[()\[\]{},:`=;]|\.\.?\.?)/;var identifiers=/^[_A-Za-z$][_A-Za-z$0-9]*/;var atProp=/^@[_A-Za-z$][_A-Za-z$0-9]*/;var wordOperators=wordRegexp(["and","or","not","is","isnt","in","instanceof","typeof"]);var indentKeywords=["for","while","loop","if","unless","else","switch","try","catch","finally","class"];var commonKeywords=["break","by","continue","debugger","delete","do","in","of","new","return","then","this","@","throw","when","until","extends"];var keywords=wordRegexp(indentKeywords.concat(commonKeywords));indentKeywords=wordRegexp(indentKeywords);var stringPrefixes=/^('{3}|\"{3}|['\"])/;var regexPrefixes=/^(\/{3}|\/)/;var commonConstants=["Infinity","NaN","undefined","null","true","false","on","off","yes","no"];var constants=wordRegexp(commonConstants); function tokenBase(stream,state){ if(stream.sol()){if(state.scope.align===null)state.scope.align=false;var scopeOffset=state.scope.offset;if(stream.eatSpace()){var lineOffset=stream.indentation();if(lineOffset>scopeOffset&&state.scope.type=="coffee"){return"indent";}else if(lineOffset<scopeOffset){return"dedent";}
return null;}else{if(scopeOffset>0){dedent(stream,state);}}}
if(stream.eatSpace()){return null;}
var ch=stream.peek();if(stream.match("####")){stream.skipToEnd();return"comment";} 
if(stream.match("###")){state.tokenize=longComment;return state.tokenize(stream,state);} 
if(ch==="#"){stream.skipToEnd();return"comment";} 
if(stream.match(/^-?[0-9\.]/,false)){var floatLiteral=false; if(stream.match(/^-?\d*\.\d+(e[\+\-]?\d+)?/i)){floatLiteral=true;}
if(stream.match(/^-?\d+\.\d*/)){floatLiteral=true;}
if(stream.match(/^-?\.\d+/)){floatLiteral=true;}
if(floatLiteral){if(stream.peek()=="."){stream.backUp(1);}
return"number";} 
var intLiteral=false; if(stream.match(/^-?0x[0-9a-f]+/i)){intLiteral=true;} 
if(stream.match(/^-?[1-9]\d*(e[\+\-]?\d+)?/)){intLiteral=true;}
if(stream.match(/^-?0(?![\dx])/i)){intLiteral=true;}
if(intLiteral){return"number";}} 
if(stream.match(stringPrefixes)){state.tokenize=tokenFactory(stream.current(),false,"string");return state.tokenize(stream,state);} 
if(stream.match(regexPrefixes)){if(stream.current()!="/"||stream.match(/^.*\//,false)){ state.tokenize=tokenFactory(stream.current(),true,"string-2");return state.tokenize(stream,state);}else{stream.backUp(1);}} 
if(stream.match(operators)||stream.match(wordOperators)){return"operator";}
if(stream.match(delimiters)){return"punctuation";}
if(stream.match(constants)){return"atom";}
if(stream.match(atProp)||state.prop&&stream.match(identifiers)){return"property";}
if(stream.match(keywords)){return"keyword";}
if(stream.match(identifiers)){return"variable";} 
stream.next();return ERRORCLASS;}
function tokenFactory(delimiter,singleline,outclass){return function(stream,state){while(!stream.eol()){stream.eatWhile(/[^'"\/\\]/);if(stream.eat("\\")){stream.next();if(singleline&&stream.eol()){return outclass;}}else if(stream.match(delimiter)){state.tokenize=tokenBase;return outclass;}else{stream.eat(/['"\/]/);}}
if(singleline){if(parserConf.singleLineStringErrors){outclass=ERRORCLASS;}else{state.tokenize=tokenBase;}}
return outclass;};}
function longComment(stream,state){while(!stream.eol()){stream.eatWhile(/[^#]/);if(stream.match("###")){state.tokenize=tokenBase;break;}
stream.eatWhile("#");}
return"comment";}
function indent(stream,state,type){type=type||"coffee";var offset=0,align=false,alignOffset=null;for(var scope=state.scope;scope;scope=scope.prev){if(scope.type==="coffee"||scope.type=="}"){offset=scope.offset+conf.indentUnit;break;}}
if(type!=="coffee"){align=null;alignOffset=stream.column()+stream.current().length;}else if(state.scope.align){state.scope.align=false;}
state.scope={offset:offset,type:type,prev:state.scope,align:align,alignOffset:alignOffset};}
function dedent(stream,state){if(!state.scope.prev)return;if(state.scope.type==="coffee"){var _indent=stream.indentation();var matched=false;for(var scope=state.scope;scope;scope=scope.prev){if(_indent===scope.offset){matched=true;break;}}
if(!matched){return true;}
while(state.scope.prev&&state.scope.offset!==_indent){state.scope=state.scope.prev;}
return false;}else{state.scope=state.scope.prev;return false;}}
function tokenLexer(stream,state){var style=state.tokenize(stream,state);var current=stream.current();if(current==="return"){state.dedent=true;}
if(((current==="->"||current==="=>")&&stream.eol())||style==="indent"){indent(stream,state);}
var delimiter_index="[({".indexOf(current);if(delimiter_index!==-1){indent(stream,state,"])}".slice(delimiter_index,delimiter_index+1));}
if(indentKeywords.exec(current)){indent(stream,state);}
if(current=="then"){dedent(stream,state);}
if(style==="dedent"){if(dedent(stream,state)){return ERRORCLASS;}}
delimiter_index="])}".indexOf(current);if(delimiter_index!==-1){while(state.scope.type=="coffee"&&state.scope.prev)
state.scope=state.scope.prev;if(state.scope.type==current)
state.scope=state.scope.prev;}
if(state.dedent&&stream.eol()){if(state.scope.type=="coffee"&&state.scope.prev)
state.scope=state.scope.prev;state.dedent=false;}
return style;}
var external={startState:function(basecolumn){return{tokenize:tokenBase,scope:{offset:basecolumn||0,type:"coffee",prev:null,align:false},prop:false,dedent:0};},token:function(stream,state){var fillAlign=state.scope.align===null&&state.scope;if(fillAlign&&stream.sol())fillAlign.align=false;var style=tokenLexer(stream,state);if(style&&style!="comment"){if(fillAlign)fillAlign.align=true;state.prop=style=="punctuation"&&stream.current()=="."}
return style;},indent:function(state,text){if(state.tokenize!=tokenBase)return 0;var scope=state.scope;var closer=text&&"])}".indexOf(text.charAt(0))>-1;if(closer)while(scope.type=="coffee"&&scope.prev)scope=scope.prev;var closes=closer&&scope.type===text.charAt(0);if(scope.align)
return scope.alignOffset-(closes?1:0);else
return(closes?scope.prev:scope).offset;},lineComment:"#",fold:"indent"};return external;});CodeMirror.defineMIME("text/x-coffeescript","coffeescript");CodeMirror.defineMIME("text/coffeescript","coffeescript");});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";var noOptions={};var nonWS=/[^\s\u00a0]/;var Pos=CodeMirror.Pos;function firstNonWS(str){var found=str.search(nonWS);return found==-1?0:found;}
CodeMirror.commands.toggleComment=function(cm){cm.toggleComment();};CodeMirror.defineExtension("toggleComment",function(options){if(!options)options=noOptions;var cm=this;var minLine=Infinity,ranges=this.listSelections(),mode=null;for(var i=ranges.length-1;i>=0;i--){var from=ranges[i].from(),to=ranges[i].to();if(from.line>=minLine)continue;if(to.line>=minLine)to=Pos(minLine,0);minLine=from.line;if(mode==null){if(cm.uncomment(from,to,options))mode="un";else{cm.lineComment(from,to,options);mode="line";}}else if(mode=="un"){cm.uncomment(from,to,options);}else{cm.lineComment(from,to,options);}}}); function probablyInsideString(cm,pos,line){return/\bstring\b/.test(cm.getTokenTypeAt(Pos(pos.line,0)))&&!/^[\'\"`]/.test(line)}
CodeMirror.defineExtension("lineComment",function(from,to,options){if(!options)options=noOptions;var self=this,mode=self.getModeAt(from);var firstLine=self.getLine(from.line);if(firstLine==null||probablyInsideString(self,from,firstLine))return;var commentString=options.lineComment||mode.lineComment;if(!commentString){if(options.blockCommentStart||mode.blockCommentStart){options.fullLines=true;self.blockComment(from,to,options);}
return;}
var end=Math.min(to.ch!=0||to.line==from.line?to.line+1:to.line,self.lastLine()+1);var pad=options.padding==null?" ":options.padding;var blankLines=options.commentBlankLines||from.line==to.line;self.operation(function(){if(options.indent){var baseString=null;for(var i=from.line;i<end;++i){var line=self.getLine(i);var whitespace=line.slice(0,firstNonWS(line));if(baseString==null||baseString.length>whitespace.length){baseString=whitespace;}}
for(var i=from.line;i<end;++i){var line=self.getLine(i),cut=baseString.length;if(!blankLines&&!nonWS.test(line))continue;if(line.slice(0,cut)!=baseString)cut=firstNonWS(line);self.replaceRange(baseString+commentString+pad,Pos(i,0),Pos(i,cut));}}else{for(var i=from.line;i<end;++i){if(blankLines||nonWS.test(self.getLine(i)))
self.replaceRange(commentString+pad,Pos(i,0));}}});});CodeMirror.defineExtension("blockComment",function(from,to,options){if(!options)options=noOptions;var self=this,mode=self.getModeAt(from);var startString=options.blockCommentStart||mode.blockCommentStart;var endString=options.blockCommentEnd||mode.blockCommentEnd;if(!startString||!endString){if((options.lineComment||mode.lineComment)&&options.fullLines!=false)
self.lineComment(from,to,options);return;}
if(/\bcomment\b/.test(self.getTokenTypeAt(Pos(from.line,0))))return
var end=Math.min(to.line,self.lastLine());if(end!=from.line&&to.ch==0&&nonWS.test(self.getLine(end)))--end;var pad=options.padding==null?" ":options.padding;if(from.line>end)return;self.operation(function(){if(options.fullLines!=false){var lastLineHasText=nonWS.test(self.getLine(end));self.replaceRange(pad+endString,Pos(end));self.replaceRange(startString+pad,Pos(from.line,0));var lead=options.blockCommentLead||mode.blockCommentLead;if(lead!=null)for(var i=from.line+1;i<=end;++i)
if(i!=end||lastLineHasText)
self.replaceRange(lead+pad,Pos(i,0));}else{self.replaceRange(endString,to);self.replaceRange(startString,from);}});});CodeMirror.defineExtension("uncomment",function(from,to,options){if(!options)options=noOptions;var self=this,mode=self.getModeAt(from);var end=Math.min(to.ch!=0||to.line==from.line?to.line:to.line-1,self.lastLine()),start=Math.min(from.line,end); var lineString=options.lineComment||mode.lineComment,lines=[];var pad=options.padding==null?" ":options.padding,didSomething;lineComment:{if(!lineString)break lineComment;for(var i=start;i<=end;++i){var line=self.getLine(i);var found=line.indexOf(lineString);if(found>-1&&!/comment/.test(self.getTokenTypeAt(Pos(i,found+1))))found=-1;if(found==-1&&nonWS.test(line))break lineComment;if(found>-1&&nonWS.test(line.slice(0,found)))break lineComment;lines.push(line);}
self.operation(function(){for(var i=start;i<=end;++i){var line=lines[i-start];var pos=line.indexOf(lineString),endPos=pos+lineString.length;if(pos<0)continue;if(line.slice(endPos,endPos+pad.length)==pad)endPos+=pad.length;didSomething=true;self.replaceRange("",Pos(i,pos),Pos(i,endPos));}});if(didSomething)return true;} 
var startString=options.blockCommentStart||mode.blockCommentStart;var endString=options.blockCommentEnd||mode.blockCommentEnd;if(!startString||!endString)return false;var lead=options.blockCommentLead||mode.blockCommentLead;var startLine=self.getLine(start),open=startLine.indexOf(startString)
if(open==-1)return false
var endLine=end==start?startLine:self.getLine(end)
var close=endLine.indexOf(endString,end==start?open+startString.length:0);if(close==-1&&start!=end){endLine=self.getLine(--end);close=endLine.indexOf(endString);}
if(close==-1||!/comment/.test(self.getTokenTypeAt(Pos(start,open+1)))||!/comment/.test(self.getTokenTypeAt(Pos(end,close+1))))
return false;var lastStart=startLine.lastIndexOf(startString,from.ch);var firstEnd=lastStart==-1?-1:startLine.slice(0,from.ch).indexOf(endString,lastStart+startString.length);if(lastStart!=-1&&firstEnd!=-1&&firstEnd+endString.length!=from.ch)return false;firstEnd=endLine.indexOf(endString,to.ch);var almostLastStart=endLine.slice(to.ch).lastIndexOf(startString,firstEnd-to.ch);lastStart=(firstEnd==-1||almostLastStart==-1)?-1:to.ch+almostLastStart;if(firstEnd!=-1&&lastStart!=-1&&lastStart!=to.ch)return false;self.operation(function(){self.replaceRange("",Pos(end,close-(pad&&endLine.slice(close-pad.length,close)==pad?pad.length:0)),Pos(end,close+endString.length));var openEnd=open+startString.length;if(pad&&startLine.slice(openEnd,openEnd+pad.length)==pad)openEnd+=pad.length;self.replaceRange("",Pos(start,open),Pos(start,openEnd));if(lead)for(var i=start+1;i<=end;++i){var line=self.getLine(i),found=line.indexOf(lead);if(found==-1||nonWS.test(line.slice(0,found)))continue;var foundEnd=found+lead.length;if(pad&&line.slice(foundEnd,foundEnd+pad.length)==pad)foundEnd+=pad.length;self.replaceRange("",Pos(i,found),Pos(i,foundEnd));}});return true;});});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";CodeMirror.defineMode("css",function(config,parserConfig){var inline=parserConfig.inline
if(!parserConfig.propertyKeywords)parserConfig=CodeMirror.resolveMode("text/css");var indentUnit=config.indentUnit,tokenHooks=parserConfig.tokenHooks,documentTypes=parserConfig.documentTypes||{},mediaTypes=parserConfig.mediaTypes||{},mediaFeatures=parserConfig.mediaFeatures||{},mediaValueKeywords=parserConfig.mediaValueKeywords||{},propertyKeywords=parserConfig.propertyKeywords||{},nonStandardPropertyKeywords=parserConfig.nonStandardPropertyKeywords||{},fontProperties=parserConfig.fontProperties||{},counterDescriptors=parserConfig.counterDescriptors||{},colorKeywords=parserConfig.colorKeywords||{},valueKeywords=parserConfig.valueKeywords||{},allowNested=parserConfig.allowNested,supportsAtComponent=parserConfig.supportsAtComponent===true;var type,override;function ret(style,tp){type=tp;return style;} 
function tokenBase(stream,state){var ch=stream.next();if(tokenHooks[ch]){var result=tokenHooks[ch](stream,state);if(result!==false)return result;}
if(ch=="@"){stream.eatWhile(/[\w\\\-]/);return ret("def",stream.current());}else if(ch=="="||(ch=="~"||ch=="|")&&stream.eat("=")){return ret(null,"compare");}else if(ch=="\""||ch=="'"){state.tokenize=tokenString(ch);return state.tokenize(stream,state);}else if(ch=="#"){stream.eatWhile(/[\w\\\-]/);return ret("atom","hash");}else if(ch=="!"){stream.match(/^\s*\w*/);return ret("keyword","important");}else if(/\d/.test(ch)||ch=="."&&stream.eat(/\d/)){stream.eatWhile(/[\w.%]/);return ret("number","unit");}else if(ch==="-"){if(/[\d.]/.test(stream.peek())){stream.eatWhile(/[\w.%]/);return ret("number","unit");}else if(stream.match(/^-[\w\\\-]+/)){stream.eatWhile(/[\w\\\-]/);if(stream.match(/^\s*:/,false))
return ret("variable-2","variable-definition");return ret("variable-2","variable");}else if(stream.match(/^\w+-/)){return ret("meta","meta");}}else if(/[,+>*\/]/.test(ch)){return ret(null,"select-op");}else if(ch=="."&&stream.match(/^-?[_a-z][_a-z0-9-]*/i)){return ret("qualifier","qualifier");}else if(/[:;{}\[\]\(\)]/.test(ch)){return ret(null,ch);}else if((ch=="u"&&stream.match(/rl(-prefix)?\(/))||(ch=="d"&&stream.match("omain("))||(ch=="r"&&stream.match("egexp("))){stream.backUp(1);state.tokenize=tokenParenthesized;return ret("property","word");}else if(/[\w\\\-]/.test(ch)){stream.eatWhile(/[\w\\\-]/);return ret("property","word");}else{return ret(null,null);}}
function tokenString(quote){return function(stream,state){var escaped=false,ch;while((ch=stream.next())!=null){if(ch==quote&&!escaped){if(quote==")")stream.backUp(1);break;}
escaped=!escaped&&ch=="\\";}
if(ch==quote||!escaped&&quote!=")")state.tokenize=null;return ret("string","string");};}
function tokenParenthesized(stream,state){stream.next();if(!stream.match(/\s*[\"\')]/,false))
state.tokenize=tokenString(")");else
state.tokenize=null;return ret(null,"(");} 
function Context(type,indent,prev){this.type=type;this.indent=indent;this.prev=prev;}
function pushContext(state,stream,type,indent){state.context=new Context(type,stream.indentation()+(indent===false?0:indentUnit),state.context);return type;}
function popContext(state){if(state.context.prev)
state.context=state.context.prev;return state.context.type;}
function pass(type,stream,state){return states[state.context.type](type,stream,state);}
function popAndPass(type,stream,state,n){for(var i=n||1;i>0;i--)
state.context=state.context.prev;return pass(type,stream,state);} 
function wordAsValue(stream){var word=stream.current().toLowerCase();if(valueKeywords.hasOwnProperty(word))
override="atom";else if(colorKeywords.hasOwnProperty(word))
override="keyword";else
override="variable";}
var states={};states.top=function(type,stream,state){if(type=="{"){return pushContext(state,stream,"block");}else if(type=="}"&&state.context.prev){return popContext(state);}else if(supportsAtComponent&&/@component/.test(type)){return pushContext(state,stream,"atComponentBlock");}else if(/^@(-moz-)?document$/.test(type)){return pushContext(state,stream,"documentTypes");}else if(/^@(media|supports|(-moz-)?document|import)$/.test(type)){return pushContext(state,stream,"atBlock");}else if(/^@(font-face|counter-style)/.test(type)){state.stateArg=type;return"restricted_atBlock_before";}else if(/^@(-(moz|ms|o|webkit)-)?keyframes$/.test(type)){return"keyframes";}else if(type&&type.charAt(0)=="@"){return pushContext(state,stream,"at");}else if(type=="hash"){override="builtin";}else if(type=="word"){override="tag";}else if(type=="variable-definition"){return"maybeprop";}else if(type=="interpolation"){return pushContext(state,stream,"interpolation");}else if(type==":"){return"pseudo";}else if(allowNested&&type=="("){return pushContext(state,stream,"parens");}
return state.context.type;};states.block=function(type,stream,state){if(type=="word"){var word=stream.current().toLowerCase();if(propertyKeywords.hasOwnProperty(word)){override="property";return"maybeprop";}else if(nonStandardPropertyKeywords.hasOwnProperty(word)){override="string-2";return"maybeprop";}else if(allowNested){override=stream.match(/^\s*:(?:\s|$)/,false)?"property":"tag";return"block";}else{override+=" error";return"maybeprop";}}else if(type=="meta"){return"block";}else if(!allowNested&&(type=="hash"||type=="qualifier")){override="error";return"block";}else{return states.top(type,stream,state);}};states.maybeprop=function(type,stream,state){if(type==":")return pushContext(state,stream,"prop");return pass(type,stream,state);};states.prop=function(type,stream,state){if(type==";")return popContext(state);if(type=="{"&&allowNested)return pushContext(state,stream,"propBlock");if(type=="}"||type=="{")return popAndPass(type,stream,state);if(type=="(")return pushContext(state,stream,"parens");if(type=="hash"&&!/^#([0-9a-fA-f]{3,4}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/.test(stream.current())){override+=" error";}else if(type=="word"){wordAsValue(stream);}else if(type=="interpolation"){return pushContext(state,stream,"interpolation");}
return"prop";};states.propBlock=function(type,_stream,state){if(type=="}")return popContext(state);if(type=="word"){override="property";return"maybeprop";}
return state.context.type;};states.parens=function(type,stream,state){if(type=="{"||type=="}")return popAndPass(type,stream,state);if(type==")")return popContext(state);if(type=="(")return pushContext(state,stream,"parens");if(type=="interpolation")return pushContext(state,stream,"interpolation");if(type=="word")wordAsValue(stream);return"parens";};states.pseudo=function(type,stream,state){if(type=="word"){override="variable-3";return state.context.type;}
return pass(type,stream,state);};states.documentTypes=function(type,stream,state){if(type=="word"&&documentTypes.hasOwnProperty(stream.current())){override="tag";return state.context.type;}else{return states.atBlock(type,stream,state);}};states.atBlock=function(type,stream,state){if(type=="(")return pushContext(state,stream,"atBlock_parens");if(type=="}"||type==";")return popAndPass(type,stream,state);if(type=="{")return popContext(state)&&pushContext(state,stream,allowNested?"block":"top");if(type=="interpolation")return pushContext(state,stream,"interpolation");if(type=="word"){var word=stream.current().toLowerCase();if(word=="only"||word=="not"||word=="and"||word=="or")
override="keyword";else if(mediaTypes.hasOwnProperty(word))
override="attribute";else if(mediaFeatures.hasOwnProperty(word))
override="property";else if(mediaValueKeywords.hasOwnProperty(word))
override="keyword";else if(propertyKeywords.hasOwnProperty(word))
override="property";else if(nonStandardPropertyKeywords.hasOwnProperty(word))
override="string-2";else if(valueKeywords.hasOwnProperty(word))
override="atom";else if(colorKeywords.hasOwnProperty(word))
override="keyword";else
override="error";}
return state.context.type;};states.atComponentBlock=function(type,stream,state){if(type=="}")
return popAndPass(type,stream,state);if(type=="{")
return popContext(state)&&pushContext(state,stream,allowNested?"block":"top",false);if(type=="word")
override="error";return state.context.type;};states.atBlock_parens=function(type,stream,state){if(type==")")return popContext(state);if(type=="{"||type=="}")return popAndPass(type,stream,state,2);return states.atBlock(type,stream,state);};states.restricted_atBlock_before=function(type,stream,state){if(type=="{")
return pushContext(state,stream,"restricted_atBlock");if(type=="word"&&state.stateArg=="@counter-style"){override="variable";return"restricted_atBlock_before";}
return pass(type,stream,state);};states.restricted_atBlock=function(type,stream,state){if(type=="}"){state.stateArg=null;return popContext(state);}
if(type=="word"){if((state.stateArg=="@font-face"&&!fontProperties.hasOwnProperty(stream.current().toLowerCase()))||(state.stateArg=="@counter-style"&&!counterDescriptors.hasOwnProperty(stream.current().toLowerCase())))
override="error";else
override="property";return"maybeprop";}
return"restricted_atBlock";};states.keyframes=function(type,stream,state){if(type=="word"){override="variable";return"keyframes";}
if(type=="{")return pushContext(state,stream,"top");return pass(type,stream,state);};states.at=function(type,stream,state){if(type==";")return popContext(state);if(type=="{"||type=="}")return popAndPass(type,stream,state);if(type=="word")override="tag";else if(type=="hash")override="builtin";return"at";};states.interpolation=function(type,stream,state){if(type=="}")return popContext(state);if(type=="{"||type==";")return popAndPass(type,stream,state);if(type=="word")override="variable";else if(type!="variable"&&type!="("&&type!=")")override="error";return"interpolation";};return{startState:function(base){return{tokenize:null,state:inline?"block":"top",stateArg:null,context:new Context(inline?"block":"top",base||0,null)};},token:function(stream,state){if(!state.tokenize&&stream.eatSpace())return null;var style=(state.tokenize||tokenBase)(stream,state);if(style&&typeof style=="object"){type=style[1];style=style[0];}
override=style;state.state=states[state.state](type,stream,state);return override;},indent:function(state,textAfter){var cx=state.context,ch=textAfter&&textAfter.charAt(0);var indent=cx.indent;if(cx.type=="prop"&&(ch=="}"||ch==")"))cx=cx.prev;if(cx.prev){if(ch=="}"&&(cx.type=="block"||cx.type=="top"||cx.type=="interpolation"||cx.type=="restricted_atBlock")){cx=cx.prev;indent=cx.indent;}else if(ch==")"&&(cx.type=="parens"||cx.type=="atBlock_parens")||ch=="{"&&(cx.type=="at"||cx.type=="atBlock")){indent=Math.max(0,cx.indent-indentUnit);cx=cx.prev;}}
return indent;},electricChars:"}",blockCommentStart:"/*",blockCommentEnd:"*/",fold:"brace"};});function keySet(array){var keys={};for(var i=0;i<array.length;++i){keys[array[i].toLowerCase()]=true;}
return keys;}
var documentTypes_=["domain","regexp","url","url-prefix"],documentTypes=keySet(documentTypes_);var mediaTypes_=["all","aural","braille","handheld","print","projection","screen","tty","tv","embossed"],mediaTypes=keySet(mediaTypes_);var mediaFeatures_=["width","min-width","max-width","height","min-height","max-height","device-width","min-device-width","max-device-width","device-height","min-device-height","max-device-height","aspect-ratio","min-aspect-ratio","max-aspect-ratio","device-aspect-ratio","min-device-aspect-ratio","max-device-aspect-ratio","color","min-color","max-color","color-index","min-color-index","max-color-index","monochrome","min-monochrome","max-monochrome","resolution","min-resolution","max-resolution","scan","grid","orientation","device-pixel-ratio","min-device-pixel-ratio","max-device-pixel-ratio","pointer","any-pointer","hover","any-hover"],mediaFeatures=keySet(mediaFeatures_);var mediaValueKeywords_=["landscape","portrait","none","coarse","fine","on-demand","hover","interlace","progressive"],mediaValueKeywords=keySet(mediaValueKeywords_);var propertyKeywords_=["align-content","align-items","align-self","alignment-adjust","alignment-baseline","anchor-point","animation","animation-delay","animation-direction","animation-duration","animation-fill-mode","animation-iteration-count","animation-name","animation-play-state","animation-timing-function","appearance","azimuth","backface-visibility","background","background-attachment","background-blend-mode","background-clip","background-color","background-image","background-origin","background-position","background-repeat","background-size","baseline-shift","binding","bleed","bookmark-label","bookmark-level","bookmark-state","bookmark-target","border","border-bottom","border-bottom-color","border-bottom-left-radius","border-bottom-right-radius","border-bottom-style","border-bottom-width","border-collapse","border-color","border-image","border-image-outset","border-image-repeat","border-image-slice","border-image-source","border-image-width","border-left","border-left-color","border-left-style","border-left-width","border-radius","border-right","border-right-color","border-right-style","border-right-width","border-spacing","border-style","border-top","border-top-color","border-top-left-radius","border-top-right-radius","border-top-style","border-top-width","border-width","bottom","box-decoration-break","box-shadow","box-sizing","break-after","break-before","break-inside","caption-side","clear","clip","color","color-profile","column-count","column-fill","column-gap","column-rule","column-rule-color","column-rule-style","column-rule-width","column-span","column-width","columns","content","counter-increment","counter-reset","crop","cue","cue-after","cue-before","cursor","direction","display","dominant-baseline","drop-initial-after-adjust","drop-initial-after-align","drop-initial-before-adjust","drop-initial-before-align","drop-initial-size","drop-initial-value","elevation","empty-cells","fit","fit-position","flex","flex-basis","flex-direction","flex-flow","flex-grow","flex-shrink","flex-wrap","float","float-offset","flow-from","flow-into","font","font-feature-settings","font-family","font-kerning","font-language-override","font-size","font-size-adjust","font-stretch","font-style","font-synthesis","font-variant","font-variant-alternates","font-variant-caps","font-variant-east-asian","font-variant-ligatures","font-variant-numeric","font-variant-position","font-weight","grid","grid-area","grid-auto-columns","grid-auto-flow","grid-auto-rows","grid-column","grid-column-end","grid-column-gap","grid-column-start","grid-gap","grid-row","grid-row-end","grid-row-gap","grid-row-start","grid-template","grid-template-areas","grid-template-columns","grid-template-rows","hanging-punctuation","height","hyphens","icon","image-orientation","image-rendering","image-resolution","inline-box-align","justify-content","left","letter-spacing","line-break","line-height","line-stacking","line-stacking-ruby","line-stacking-shift","line-stacking-strategy","list-style","list-style-image","list-style-position","list-style-type","margin","margin-bottom","margin-left","margin-right","margin-top","marks","marquee-direction","marquee-loop","marquee-play-count","marquee-speed","marquee-style","max-height","max-width","min-height","min-width","move-to","nav-down","nav-index","nav-left","nav-right","nav-up","object-fit","object-position","opacity","order","orphans","outline","outline-color","outline-offset","outline-style","outline-width","overflow","overflow-style","overflow-wrap","overflow-x","overflow-y","padding","padding-bottom","padding-left","padding-right","padding-top","page","page-break-after","page-break-before","page-break-inside","page-policy","pause","pause-after","pause-before","perspective","perspective-origin","pitch","pitch-range","play-during","position","presentation-level","punctuation-trim","quotes","region-break-after","region-break-before","region-break-inside","region-fragment","rendering-intent","resize","rest","rest-after","rest-before","richness","right","rotation","rotation-point","ruby-align","ruby-overhang","ruby-position","ruby-span","shape-image-threshold","shape-inside","shape-margin","shape-outside","size","speak","speak-as","speak-header","speak-numeral","speak-punctuation","speech-rate","stress","string-set","tab-size","table-layout","target","target-name","target-new","target-position","text-align","text-align-last","text-decoration","text-decoration-color","text-decoration-line","text-decoration-skip","text-decoration-style","text-emphasis","text-emphasis-color","text-emphasis-position","text-emphasis-style","text-height","text-indent","text-justify","text-outline","text-overflow","text-shadow","text-size-adjust","text-space-collapse","text-transform","text-underline-position","text-wrap","top","transform","transform-box","transform-origin","transform-style","transition","transition-delay","transition-duration","transition-property","transition-timing-function","unicode-bidi","user-select","vertical-align","visibility","voice-balance","voice-duration","voice-family","voice-pitch","voice-range","voice-rate","voice-stress","voice-volume","volume","white-space","widows","width","will-change","word-break","word-spacing","word-wrap","z-index","clip-path","clip-rule","mask","enable-background","filter","flood-color","flood-opacity","lighting-color","stop-color","stop-opacity","pointer-events","color-interpolation","color-interpolation-filters","color-rendering","fill","fill-opacity","fill-rule","image-rendering","marker","marker-end","marker-mid","marker-start","shape-rendering","stroke","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke-width","text-rendering","baseline-shift","dominant-baseline","glyph-orientation-horizontal","glyph-orientation-vertical","text-anchor","writing-mode"],propertyKeywords=keySet(propertyKeywords_);var nonStandardPropertyKeywords_=["scrollbar-arrow-color","scrollbar-base-color","scrollbar-dark-shadow-color","scrollbar-face-color","scrollbar-highlight-color","scrollbar-shadow-color","scrollbar-3d-light-color","scrollbar-track-color","shape-inside","searchfield-cancel-button","searchfield-decoration","searchfield-results-button","searchfield-results-decoration","zoom"],nonStandardPropertyKeywords=keySet(nonStandardPropertyKeywords_);var fontProperties_=["font-family","src","unicode-range","font-variant","font-feature-settings","font-stretch","font-weight","font-style"],fontProperties=keySet(fontProperties_);var counterDescriptors_=["additive-symbols","fallback","negative","pad","prefix","range","speak-as","suffix","symbols","system"],counterDescriptors=keySet(counterDescriptors_);var colorKeywords_=["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","grey","green","greenyellow","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","rebeccapurple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"],colorKeywords=keySet(colorKeywords_);var valueKeywords_=["above","absolute","activeborder","additive","activecaption","afar","after-white-space","ahead","alias","all","all-scroll","alphabetic","alternate","always","amharic","amharic-abegede","antialiased","appworkspace","arabic-indic","armenian","asterisks","attr","auto","avoid","avoid-column","avoid-page","avoid-region","background","backwards","baseline","below","bidi-override","binary","bengali","blink","block","block-axis","bold","bolder","border","border-box","both","bottom","break","break-all","break-word","bullets","button","button-bevel","buttonface","buttonhighlight","buttonshadow","buttontext","calc","cambodian","capitalize","caps-lock-indicator","caption","captiontext","caret","cell","center","checkbox","circle","cjk-decimal","cjk-earthly-branch","cjk-heavenly-stem","cjk-ideographic","clear","clip","close-quote","col-resize","collapse","color","color-burn","color-dodge","color-well","column","column-reverse","compact","condensed","contain","content","contents","content-box","context-menu","continuous","copy","counter","counters","cover","crop","cross","crosshair","currentcolor","cursive","cyclic","darken","dashed","decimal","decimal-leading-zero","default","default-button","dense","destination-atop","destination-in","destination-out","destination-over","devanagari","difference","disc","discard","disclosure-closed","disclosure-open","document","dot-dash","dot-dot-dash","dotted","double","down","e-resize","ease","ease-in","ease-in-out","ease-out","element","ellipse","ellipsis","embed","end","ethiopic","ethiopic-abegede","ethiopic-abegede-am-et","ethiopic-abegede-gez","ethiopic-abegede-ti-er","ethiopic-abegede-ti-et","ethiopic-halehame-aa-er","ethiopic-halehame-aa-et","ethiopic-halehame-am-et","ethiopic-halehame-gez","ethiopic-halehame-om-et","ethiopic-halehame-sid-et","ethiopic-halehame-so-et","ethiopic-halehame-ti-er","ethiopic-halehame-ti-et","ethiopic-halehame-tig","ethiopic-numeric","ew-resize","exclusion","expanded","extends","extra-condensed","extra-expanded","fantasy","fast","fill","fixed","flat","flex","flex-end","flex-start","flow-root","footnotes","forwards","from","geometricPrecision","georgian","graytext","grid","groove","gujarati","gurmukhi","hand","hangul","hangul-consonant","hard-light","hebrew","help","hidden","hide","higher","highlight","highlighttext","hiragana","hiragana-iroha","horizontal","hsl","hsla","hue","icon","ignore","inactiveborder","inactivecaption","inactivecaptiontext","infinite","infobackground","infotext","inherit","initial","inline","inline-axis","inline-block","inline-flex","inline-grid","inline-table","inset","inside","intrinsic","invert","italic","japanese-formal","japanese-informal","justify","kannada","katakana","katakana-iroha","keep-all","khmer","korean-hangul-formal","korean-hanja-formal","korean-hanja-informal","landscape","lao","large","larger","left","level","lighter","lighten","line-through","linear","linear-gradient","lines","list-item","listbox","list-button","listitem","local","logical","loud","lower","lower-alpha","lower-armenian","lower-greek","lower-hexadecimal","lower-latin","lower-norwegian","lower-roman","lowercase","ltr","luminosity","malayalam","match","matrix","matrix3d","media-controls-background","media-current-time-display","media-fullscreen-button","media-mute-button","media-play-button","media-return-to-realtime-button","media-rewind-button","media-seek-back-button","media-seek-forward-button","media-slider","media-sliderthumb","media-time-remaining-display","media-volume-slider","media-volume-slider-container","media-volume-sliderthumb","medium","menu","menulist","menulist-button","menulist-text","menulist-textfield","menutext","message-box","middle","min-intrinsic","mix","mongolian","monospace","move","multiple","multiply","myanmar","n-resize","narrower","ne-resize","nesw-resize","no-close-quote","no-drop","no-open-quote","no-repeat","none","normal","not-allowed","nowrap","ns-resize","numbers","numeric","nw-resize","nwse-resize","oblique","octal","opacity","open-quote","optimizeLegibility","optimizeSpeed","oriya","oromo","outset","outside","outside-shape","overlay","overline","padding","padding-box","painted","page","paused","persian","perspective","plus-darker","plus-lighter","pointer","polygon","portrait","pre","pre-line","pre-wrap","preserve-3d","progress","push-button","radial-gradient","radio","read-only","read-write","read-write-plaintext-only","rectangle","region","relative","repeat","repeating-linear-gradient","repeating-radial-gradient","repeat-x","repeat-y","reset","reverse","rgb","rgba","ridge","right","rotate","rotate3d","rotateX","rotateY","rotateZ","round","row","row-resize","row-reverse","rtl","run-in","running","s-resize","sans-serif","saturation","scale","scale3d","scaleX","scaleY","scaleZ","screen","scroll","scrollbar","scroll-position","se-resize","searchfield","searchfield-cancel-button","searchfield-decoration","searchfield-results-button","searchfield-results-decoration","semi-condensed","semi-expanded","separate","serif","show","sidama","simp-chinese-formal","simp-chinese-informal","single","skew","skewX","skewY","skip-white-space","slide","slider-horizontal","slider-vertical","sliderthumb-horizontal","sliderthumb-vertical","slow","small","small-caps","small-caption","smaller","soft-light","solid","somali","source-atop","source-in","source-out","source-over","space","space-around","space-between","spell-out","square","square-button","start","static","status-bar","stretch","stroke","sub","subpixel-antialiased","super","sw-resize","symbolic","symbols","table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row","table-row-group","tamil","telugu","text","text-bottom","text-top","textarea","textfield","thai","thick","thin","threeddarkshadow","threedface","threedhighlight","threedlightshadow","threedshadow","tibetan","tigre","tigrinya-er","tigrinya-er-abegede","tigrinya-et","tigrinya-et-abegede","to","top","trad-chinese-formal","trad-chinese-informal","transform","translate","translate3d","translateX","translateY","translateZ","transparent","ultra-condensed","ultra-expanded","underline","unset","up","upper-alpha","upper-armenian","upper-greek","upper-hexadecimal","upper-latin","upper-norwegian","upper-roman","uppercase","urdu","url","var","vertical","vertical-text","visible","visibleFill","visiblePainted","visibleStroke","visual","w-resize","wait","wave","wider","window","windowframe","windowtext","words","wrap","wrap-reverse","x-large","x-small","xor","xx-large","xx-small"],valueKeywords=keySet(valueKeywords_);var allWords=documentTypes_.concat(mediaTypes_).concat(mediaFeatures_).concat(mediaValueKeywords_).concat(propertyKeywords_).concat(nonStandardPropertyKeywords_).concat(colorKeywords_).concat(valueKeywords_);CodeMirror.registerHelper("hintWords","css",allWords);function tokenCComment(stream,state){var maybeEnd=false,ch;while((ch=stream.next())!=null){if(maybeEnd&&ch=="/"){state.tokenize=null;break;}
maybeEnd=(ch=="*");}
return["comment","comment"];}
CodeMirror.defineMIME("text/css",{documentTypes:documentTypes,mediaTypes:mediaTypes,mediaFeatures:mediaFeatures,mediaValueKeywords:mediaValueKeywords,propertyKeywords:propertyKeywords,nonStandardPropertyKeywords:nonStandardPropertyKeywords,fontProperties:fontProperties,counterDescriptors:counterDescriptors,colorKeywords:colorKeywords,valueKeywords:valueKeywords,tokenHooks:{"/":function(stream,state){if(!stream.eat("*"))return false;state.tokenize=tokenCComment;return tokenCComment(stream,state);}},name:"css"});CodeMirror.defineMIME("text/x-scss",{mediaTypes:mediaTypes,mediaFeatures:mediaFeatures,mediaValueKeywords:mediaValueKeywords,propertyKeywords:propertyKeywords,nonStandardPropertyKeywords:nonStandardPropertyKeywords,colorKeywords:colorKeywords,valueKeywords:valueKeywords,fontProperties:fontProperties,allowNested:true,tokenHooks:{"/":function(stream,state){if(stream.eat("/")){stream.skipToEnd();return["comment","comment"];}else if(stream.eat("*")){state.tokenize=tokenCComment;return tokenCComment(stream,state);}else{return["operator","operator"];}},":":function(stream){if(stream.match(/\s*\{/))
return[null,"{"];return false;},"$":function(stream){stream.match(/^[\w-]+/);if(stream.match(/^\s*:/,false))
return["variable-2","variable-definition"];return["variable-2","variable"];},"#":function(stream){if(!stream.eat("{"))return false;return[null,"interpolation"];}},name:"css",helperType:"scss"});CodeMirror.defineMIME("text/x-less",{mediaTypes:mediaTypes,mediaFeatures:mediaFeatures,mediaValueKeywords:mediaValueKeywords,propertyKeywords:propertyKeywords,nonStandardPropertyKeywords:nonStandardPropertyKeywords,colorKeywords:colorKeywords,valueKeywords:valueKeywords,fontProperties:fontProperties,allowNested:true,tokenHooks:{"/":function(stream,state){if(stream.eat("/")){stream.skipToEnd();return["comment","comment"];}else if(stream.eat("*")){state.tokenize=tokenCComment;return tokenCComment(stream,state);}else{return["operator","operator"];}},"@":function(stream){if(stream.eat("{"))return[null,"interpolation"];if(stream.match(/^(charset|document|font-face|import|(-(moz|ms|o|webkit)-)?keyframes|media|namespace|page|supports)\b/,false))return false;stream.eatWhile(/[\w\\\-]/);if(stream.match(/^\s*:/,false))
return["variable-2","variable-definition"];return["variable-2","variable"];},"&":function(){return["atom","atom"];}},name:"css",helperType:"less"});CodeMirror.defineMIME("text/x-gss",{documentTypes:documentTypes,mediaTypes:mediaTypes,mediaFeatures:mediaFeatures,propertyKeywords:propertyKeywords,nonStandardPropertyKeywords:nonStandardPropertyKeywords,fontProperties:fontProperties,counterDescriptors:counterDescriptors,colorKeywords:colorKeywords,valueKeywords:valueKeywords,supportsAtComponent:true,tokenHooks:{"/":function(stream,state){if(!stream.eat("*"))return false;state.tokenize=tokenCComment;return tokenCComment(stream,state);}},name:"css",helperType:"gss"});});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"),require("../xml/xml"),require("../javascript/javascript"),require("../css/css"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror","../xml/xml","../javascript/javascript","../css/css"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";var defaultTags={script:[["lang",/(javascript|babel)/i,"javascript"],["type",/^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^$/i,"javascript"],["type",/./,"text/plain"],[null,null,"javascript"]],style:[["lang",/^css$/i,"css"],["type",/^(text\/)?(x-)?(stylesheet|css)$/i,"css"],["type",/./,"text/plain"],[null,null,"css"]]};function maybeBackup(stream,pat,style){var cur=stream.current(),close=cur.search(pat);if(close>-1){stream.backUp(cur.length-close);}else if(cur.match(/<\/?$/)){stream.backUp(cur.length);if(!stream.match(pat,false))stream.match(cur);}
return style;}
var attrRegexpCache={};function getAttrRegexp(attr){var regexp=attrRegexpCache[attr];if(regexp)return regexp;return attrRegexpCache[attr]=new RegExp("\\s+"+attr+"\\s*=\\s*('|\")?([^'\"]+)('|\")?\\s*");}
function getAttrValue(text,attr){var match=text.match(getAttrRegexp(attr))
return match?/^\s*(.*?)\s*$/.exec(match[2])[1]:""}
function getTagRegexp(tagName,anchored){return new RegExp((anchored?"^":"")+"<\/\s*"+tagName+"\s*>","i");}
function addTags(from,to){for(var tag in from){var dest=to[tag]||(to[tag]=[]);var source=from[tag];for(var i=source.length-1;i>=0;i--)
dest.unshift(source[i])}}
function findMatchingMode(tagInfo,tagText){for(var i=0;i<tagInfo.length;i++){var spec=tagInfo[i];if(!spec[0]||spec[1].test(getAttrValue(tagText,spec[0])))return spec[2];}}
CodeMirror.defineMode("htmlmixed",function(config,parserConfig){var htmlMode=CodeMirror.getMode(config,{name:"xml",htmlMode:true,multilineTagIndentFactor:parserConfig.multilineTagIndentFactor,multilineTagIndentPastTag:parserConfig.multilineTagIndentPastTag});var tags={};var configTags=parserConfig&&parserConfig.tags,configScript=parserConfig&&parserConfig.scriptTypes;addTags(defaultTags,tags);if(configTags)addTags(configTags,tags);if(configScript)for(var i=configScript.length-1;i>=0;i--)
tags.script.unshift(["type",configScript[i].matches,configScript[i].mode])
function html(stream,state){var style=htmlMode.token(stream,state.htmlState),tag=/\btag\b/.test(style),tagName
if(tag&&!/[<>\s\/]/.test(stream.current())&&(tagName=state.htmlState.tagName&&state.htmlState.tagName.toLowerCase())&&tags.hasOwnProperty(tagName)){state.inTag=tagName+" "}else if(state.inTag&&tag&&/>$/.test(stream.current())){var inTag=/^([\S]+) (.*)/.exec(state.inTag)
state.inTag=null
var modeSpec=stream.current()==">"&&findMatchingMode(tags[inTag[1]],inTag[2])
var mode=CodeMirror.getMode(config,modeSpec)
var endTagA=getTagRegexp(inTag[1],true),endTag=getTagRegexp(inTag[1],false);state.token=function(stream,state){if(stream.match(endTagA,false)){state.token=html;state.localState=state.localMode=null;return null;}
return maybeBackup(stream,endTag,state.localMode.token(stream,state.localState));};state.localMode=mode;state.localState=CodeMirror.startState(mode,htmlMode.indent(state.htmlState,""));}else if(state.inTag){state.inTag+=stream.current()
if(stream.eol())state.inTag+=" "}
return style;};return{startState:function(){var state=CodeMirror.startState(htmlMode);return{token:html,inTag:null,localMode:null,localState:null,htmlState:state};},copyState:function(state){var local;if(state.localState){local=CodeMirror.copyState(state.localMode,state.localState);}
return{token:state.token,inTag:state.inTag,localMode:state.localMode,localState:local,htmlState:CodeMirror.copyState(htmlMode,state.htmlState)};},token:function(stream,state){return state.token(stream,state);},indent:function(state,textAfter){if(!state.localMode||/^\s*<\//.test(textAfter))
return htmlMode.indent(state.htmlState,textAfter);else if(state.localMode.indent)
return state.localMode.indent(state.localState,textAfter);else
return CodeMirror.Pass;},innerMode:function(state){return{state:state.localState||state.htmlState,mode:state.localMode||htmlMode};}};},"xml","javascript","css");CodeMirror.defineMIME("text/html","htmlmixed");});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";function expressionAllowed(stream,state,backUp){return/^(?:operator|sof|keyword c|case|new|[\[{}\(,;:]|=>)$/.test(state.lastType)||(state.lastType=="quasi"&&/\{\s*$/.test(stream.string.slice(0,stream.pos-(backUp||0))))}
CodeMirror.defineMode("javascript",function(config,parserConfig){var indentUnit=config.indentUnit;var statementIndent=parserConfig.statementIndent;var jsonldMode=parserConfig.jsonld;var jsonMode=parserConfig.json||jsonldMode;var isTS=parserConfig.typescript;var wordRE=parserConfig.wordCharacters||/[\w$\xa1-\uffff]/; var keywords=function(){function kw(type){return{type:type,style:"keyword"};}
var A=kw("keyword a"),B=kw("keyword b"),C=kw("keyword c");var operator=kw("operator"),atom={type:"atom",style:"atom"};var jsKeywords={"if":kw("if"),"while":A,"with":A,"else":B,"do":B,"try":B,"finally":B,"return":C,"break":C,"continue":C,"new":kw("new"),"delete":C,"throw":C,"debugger":C,"var":kw("var"),"const":kw("var"),"let":kw("var"),"function":kw("function"),"catch":kw("catch"),"for":kw("for"),"switch":kw("switch"),"case":kw("case"),"default":kw("default"),"in":operator,"typeof":operator,"instanceof":operator,"true":atom,"false":atom,"null":atom,"undefined":atom,"NaN":atom,"Infinity":atom,"this":kw("this"),"class":kw("class"),"super":kw("atom"),"yield":C,"export":kw("export"),"import":kw("import"),"extends":C,"await":C,"async":kw("async")}; if(isTS){var type={type:"variable",style:"variable-3"};var tsKeywords={"interface":kw("class"),"implements":C,"namespace":C,"module":kw("module"),"enum":kw("module"),"type":kw("type"),"public":kw("modifier"),"private":kw("modifier"),"protected":kw("modifier"),"abstract":kw("modifier"),"as":operator,"string":type,"number":type,"boolean":type,"any":type};for(var attr in tsKeywords){jsKeywords[attr]=tsKeywords[attr];}}
return jsKeywords;}();var isOperatorChar=/[+\-*&%=<>!?|~^]/;var isJsonldKeyword=/^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;function readRegexp(stream){var escaped=false,next,inSet=false;while((next=stream.next())!=null){if(!escaped){if(next=="/"&&!inSet)return;if(next=="[")inSet=true;else if(inSet&&next=="]")inSet=false;}
escaped=!escaped&&next=="\\";}}

var type,content;function ret(tp,style,cont){type=tp;content=cont;return style;}
function tokenBase(stream,state){var ch=stream.next();if(ch=='"'||ch=="'"){state.tokenize=tokenString(ch);return state.tokenize(stream,state);}else if(ch=="."&&stream.match(/^\d[\d_]*(?:[eE][+\-]?[\d_]+)?/)){return ret("number","number");}else if(ch=="."&&stream.match("..")){return ret("spread","meta");}else if(/[\[\]{}\(\),;\:\.]/.test(ch)){return ret(ch);}else if(ch=="="&&stream.eat(">")){return ret("=>","operator");}else if(ch=="0"&&stream.match(/^(?:x[\dA-Fa-f_]+|o[0-7_]+|b[01_]+)n?/)){return ret("number","number");}else if(/\d/.test(ch)){stream.match(/^[\d_]*(?:n|(?:\.[\d_]*)?(?:[eE][+\-]?[\d_]+)?)?/);return ret("number","number");}else if(ch=="/"){if(stream.eat("*")){state.tokenize=tokenComment;return tokenComment(stream,state);}else if(stream.eat("/")){stream.skipToEnd();return ret("comment","comment");}else if(expressionAllowed(stream,state,1)){readRegexp(stream);stream.match(/^\b(([gimyu])(?![gimyu]*\2))+\b/);return ret("regexp","string-2");}else{stream.eatWhile(isOperatorChar);return ret("operator","operator",stream.current());}}else if(ch=="`"){state.tokenize=tokenQuasi;return tokenQuasi(stream,state);}else if(ch=="#"){stream.skipToEnd();return ret("error","error");}else if(isOperatorChar.test(ch)){if(ch!=">"||!state.lexical||state.lexical.type!=">")
stream.eatWhile(isOperatorChar);return ret("operator","operator",stream.current());}else if(wordRE.test(ch)){stream.eatWhile(wordRE);var word=stream.current(),known=keywords.propertyIsEnumerable(word)&&keywords[word];return(known&&state.lastType!=".")?ret(known.type,known.style,word):ret("variable","variable",word);}}
function tokenString(quote){return function(stream,state){var escaped=false,next;if(jsonldMode&&stream.peek()=="@"&&stream.match(isJsonldKeyword)){state.tokenize=tokenBase;return ret("jsonld-keyword","meta");}
while((next=stream.next())!=null){if(next==quote&&!escaped)break;escaped=!escaped&&next=="\\";}
if(!escaped)state.tokenize=tokenBase;return ret("string","string");};}
function tokenComment(stream,state){var maybeEnd=false,ch;while(ch=stream.next()){if(ch=="/"&&maybeEnd){state.tokenize=tokenBase;break;}
maybeEnd=(ch=="*");}
return ret("comment","comment");}
function tokenQuasi(stream,state){var escaped=false,next;while((next=stream.next())!=null){if(!escaped&&(next=="`"||next=="$"&&stream.eat("{"))){state.tokenize=tokenBase;break;}
escaped=!escaped&&next=="\\";}
return ret("quasi","string-2",stream.current());}
var brackets="([{}])";





function findFatArrow(stream,state){if(state.fatArrowAt)state.fatArrowAt=null;var arrow=stream.string.indexOf("=>",stream.start);if(arrow<0)return;if(isTS){ var m=/:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(stream.string.slice(stream.start,arrow))
if(m)arrow=m.index}
var depth=0,sawSomething=false;for(var pos=arrow-1;pos>=0;--pos){var ch=stream.string.charAt(pos);var bracket=brackets.indexOf(ch);if(bracket>=0&&bracket<3){if(!depth){++pos;break;}
if(--depth==0){if(ch=="(")sawSomething=true;break;}}else if(bracket>=3&&bracket<6){++depth;}else if(wordRE.test(ch)){sawSomething=true;}else if(/["'\/]/.test(ch)){return;}else if(sawSomething&&!depth){++pos;break;}}
if(sawSomething&&!depth)state.fatArrowAt=pos;} 
var atomicTypes={"atom":true,"number":true,"variable":true,"string":true,"regexp":true,"this":true,"jsonld-keyword":true};function JSLexical(indented,column,type,align,prev,info){this.indented=indented;this.column=column;this.type=type;this.prev=prev;this.info=info;if(align!=null)this.align=align;}
function inScope(state,varname){for(var v=state.localVars;v;v=v.next)
if(v.name==varname)return true;for(var cx=state.context;cx;cx=cx.prev){for(var v=cx.vars;v;v=v.next)
if(v.name==varname)return true;}}
function parseJS(state,style,type,content,stream){var cc=state.cc;cx.state=state;cx.stream=stream;cx.marked=null,cx.cc=cc;cx.style=style;if(!state.lexical.hasOwnProperty("align"))
state.lexical.align=true;while(true){var combinator=cc.length?cc.pop():jsonMode?expression:statement;if(combinator(type,content)){while(cc.length&&cc[cc.length-1].lex)
cc.pop()();if(cx.marked)return cx.marked;if(type=="variable"&&inScope(state,content))return"variable-2";return style;}}} 
var cx={state:null,column:null,marked:null,cc:null};function pass(){for(var i=arguments.length-1;i>=0;i--)cx.cc.push(arguments[i]);}
function cont(){pass.apply(null,arguments);return true;}
function register(varname){function inList(list){for(var v=list;v;v=v.next)
if(v.name==varname)return true;return false;}
var state=cx.state;cx.marked="def";if(state.context){if(inList(state.localVars))return;state.localVars={name:varname,next:state.localVars};}else{if(inList(state.globalVars))return;if(parserConfig.globalVars)
state.globalVars={name:varname,next:state.globalVars};}} 
var defaultVars={name:"this",next:{name:"arguments"}};function pushcontext(){cx.state.context={prev:cx.state.context,vars:cx.state.localVars};cx.state.localVars=defaultVars;}
function popcontext(){cx.state.localVars=cx.state.context.vars;cx.state.context=cx.state.context.prev;}
function pushlex(type,info){var result=function(){var state=cx.state,indent=state.indented;if(state.lexical.type=="stat")indent=state.lexical.indented;else for(var outer=state.lexical;outer&&outer.type==")"&&outer.align;outer=outer.prev)
indent=outer.indented;state.lexical=new JSLexical(indent,cx.stream.column(),type,null,state.lexical,info);};result.lex=true;return result;}
function poplex(){var state=cx.state;if(state.lexical.prev){if(state.lexical.type==")")
state.indented=state.lexical.indented;state.lexical=state.lexical.prev;}}
poplex.lex=true;function expect(wanted){function exp(type){if(type==wanted)return cont();else if(wanted==";")return pass();else return cont(exp);};return exp;}
function statement(type,value){if(type=="var")return cont(pushlex("vardef",value.length),vardef,expect(";"),poplex);if(type=="keyword a")return cont(pushlex("form"),parenExpr,statement,poplex);if(type=="keyword b")return cont(pushlex("form"),statement,poplex);if(type=="{")return cont(pushlex("}"),block,poplex);if(type==";")return cont();if(type=="if"){if(cx.state.lexical.info=="else"&&cx.state.cc[cx.state.cc.length-1]==poplex)
cx.state.cc.pop()();return cont(pushlex("form"),parenExpr,statement,poplex,maybeelse);}
if(type=="function")return cont(functiondef);if(type=="for")return cont(pushlex("form"),forspec,statement,poplex);if(type=="variable")return cont(pushlex("stat"),maybelabel);if(type=="switch")return cont(pushlex("form"),parenExpr,pushlex("}","switch"),expect("{"),block,poplex,poplex);if(type=="case")return cont(expression,expect(":"));if(type=="default")return cont(expect(":"));if(type=="catch")return cont(pushlex("form"),pushcontext,expect("("),funarg,expect(")"),statement,poplex,popcontext);if(type=="class")return cont(pushlex("form"),className,poplex);if(type=="export")return cont(pushlex("stat"),afterExport,poplex);if(type=="import")return cont(pushlex("stat"),afterImport,poplex);if(type=="module")return cont(pushlex("form"),pattern,pushlex("}"),expect("{"),block,poplex,poplex)
if(type=="type")return cont(typeexpr,expect("operator"),typeexpr,expect(";"));if(type=="async")return cont(statement)
return pass(pushlex("stat"),expression,expect(";"),poplex);}
function expression(type){return expressionInner(type,false);}
function expressionNoComma(type){return expressionInner(type,true);}
function parenExpr(type){if(type!="(")return pass()
return cont(pushlex(")"),expression,expect(")"),poplex)}
function expressionInner(type,noComma){if(cx.state.fatArrowAt==cx.stream.start){var body=noComma?arrowBodyNoComma:arrowBody;if(type=="(")return cont(pushcontext,pushlex(")"),commasep(pattern,")"),poplex,expect("=>"),body,popcontext);else if(type=="variable")return pass(pushcontext,pattern,expect("=>"),body,popcontext);}
var maybeop=noComma?maybeoperatorNoComma:maybeoperatorComma;if(atomicTypes.hasOwnProperty(type))return cont(maybeop);if(type=="function")return cont(functiondef,maybeop);if(type=="class")return cont(pushlex("form"),classExpression,poplex);if(type=="keyword c"||type=="async")return cont(noComma?maybeexpressionNoComma:maybeexpression);if(type=="(")return cont(pushlex(")"),maybeexpression,expect(")"),poplex,maybeop);if(type=="operator"||type=="spread")return cont(noComma?expressionNoComma:expression);if(type=="[")return cont(pushlex("]"),arrayLiteral,poplex,maybeop);if(type=="{")return contCommasep(objprop,"}",null,maybeop);if(type=="quasi")return pass(quasi,maybeop);if(type=="new")return cont(maybeTarget(noComma));return cont();}
function maybeexpression(type){if(type.match(/[;\}\)\],]/))return pass();return pass(expression);}
function maybeexpressionNoComma(type){if(type.match(/[;\}\)\],]/))return pass();return pass(expressionNoComma);}
function maybeoperatorComma(type,value){if(type==",")return cont(expression);return maybeoperatorNoComma(type,value,false);}
function maybeoperatorNoComma(type,value,noComma){var me=noComma==false?maybeoperatorComma:maybeoperatorNoComma;var expr=noComma==false?expression:expressionNoComma;if(type=="=>")return cont(pushcontext,noComma?arrowBodyNoComma:arrowBody,popcontext);if(type=="operator"){if(/\+\+|--/.test(value))return cont(me);if(value=="?")return cont(expression,expect(":"),expr);return cont(expr);}
if(type=="quasi"){return pass(quasi,me);}
if(type==";")return;if(type=="(")return contCommasep(expressionNoComma,")","call",me);if(type==".")return cont(property,me);if(type=="[")return cont(pushlex("]"),maybeexpression,expect("]"),poplex,me);}
function quasi(type,value){if(type!="quasi")return pass();if(value.slice(value.length-2)!="${")return cont(quasi);return cont(expression,continueQuasi);}
function continueQuasi(type){if(type=="}"){cx.marked="string-2";cx.state.tokenize=tokenQuasi;return cont(quasi);}}
function arrowBody(type){findFatArrow(cx.stream,cx.state);return pass(type=="{"?statement:expression);}
function arrowBodyNoComma(type){findFatArrow(cx.stream,cx.state);return pass(type=="{"?statement:expressionNoComma);}
function maybeTarget(noComma){return function(type){if(type==".")return cont(noComma?targetNoComma:target);else return pass(noComma?expressionNoComma:expression);};}
function target(_,value){if(value=="target"){cx.marked="keyword";return cont(maybeoperatorComma);}}
function targetNoComma(_,value){if(value=="target"){cx.marked="keyword";return cont(maybeoperatorNoComma);}}
function maybelabel(type){if(type==":")return cont(poplex,statement);return pass(maybeoperatorComma,expect(";"),poplex);}
function property(type){if(type=="variable"){cx.marked="property";return cont();}}
function objprop(type,value){if(type=="async"){cx.marked="property";return cont(objprop);}else if(type=="variable"||cx.style=="keyword"){cx.marked="property";if(value=="get"||value=="set")return cont(getterSetter);return cont(afterprop);}else if(type=="number"||type=="string"){cx.marked=jsonldMode?"property":(cx.style+" property");return cont(afterprop);}else if(type=="jsonld-keyword"){return cont(afterprop);}else if(type=="modifier"){return cont(objprop)}else if(type=="["){return cont(expression,expect("]"),afterprop);}else if(type=="spread"){return cont(expression);}else if(type==":"){return pass(afterprop)}}
function getterSetter(type){if(type!="variable")return pass(afterprop);cx.marked="property";return cont(functiondef);}
function afterprop(type){if(type==":")return cont(expressionNoComma);if(type=="(")return pass(functiondef);}
function commasep(what,end){function proceed(type,value){if(type==","){var lex=cx.state.lexical;if(lex.info=="call")lex.pos=(lex.pos||0)+1;return cont(function(type,value){if(type==end||value==end)return pass()
return pass(what)},proceed);}
if(type==end||value==end)return cont();return cont(expect(end));}
return function(type,value){if(type==end||value==end)return cont();return pass(what,proceed);};}
function contCommasep(what,end,info){for(var i=3;i<arguments.length;i++)
cx.cc.push(arguments[i]);return cont(pushlex(end,info),commasep(what,end),poplex);}
function block(type){if(type=="}")return cont();return pass(statement,block);}
function maybetype(type,value){if(isTS){if(type==":")return cont(typeexpr);if(value=="?")return cont(maybetype);}}
function typeexpr(type){if(type=="variable"){cx.marked="variable-3";return cont(afterType);}
if(type=="string"||type=="number"||type=="atom")return cont(afterType);if(type=="{")return cont(commasep(typeprop,"}"))
if(type=="(")return cont(commasep(typearg,")"),maybeReturnType)}
function maybeReturnType(type){if(type=="=>")return cont(typeexpr)}
function typeprop(type){if(type=="variable"||cx.style=="keyword"){cx.marked="property"
return cont(typeprop)}else if(type==":"){return cont(typeexpr)}}
function typearg(type){if(type=="variable")return cont(typearg)
else if(type==":")return cont(typeexpr)}
function afterType(type,value){if(value=="<")return cont(pushlex(">"),commasep(typeexpr,">"),poplex,afterType)
if(value=="|"||type==".")return cont(typeexpr)
if(type=="[")return cont(expect("]"),afterType)}
function vardef(){return pass(pattern,maybetype,maybeAssign,vardefCont);}
function pattern(type,value){if(type=="modifier")return cont(pattern)
if(type=="variable"){register(value);return cont();}
if(type=="spread")return cont(pattern);if(type=="[")return contCommasep(pattern,"]");if(type=="{")return contCommasep(proppattern,"}");}
function proppattern(type,value){if(type=="variable"&&!cx.stream.match(/^\s*:/,false)){register(value);return cont(maybeAssign);}
if(type=="variable")cx.marked="property";if(type=="spread")return cont(pattern);if(type=="}")return pass();return cont(expect(":"),pattern,maybeAssign);}
function maybeAssign(_type,value){if(value=="=")return cont(expressionNoComma);}
function vardefCont(type){if(type==",")return cont(vardef);}
function maybeelse(type,value){if(type=="keyword b"&&value=="else")return cont(pushlex("form","else"),statement,poplex);}
function forspec(type){if(type=="(")return cont(pushlex(")"),forspec1,expect(")"),poplex);}
function forspec1(type){if(type=="var")return cont(vardef,expect(";"),forspec2);if(type==";")return cont(forspec2);if(type=="variable")return cont(formaybeinof);return pass(expression,expect(";"),forspec2);}
function formaybeinof(_type,value){if(value=="in"||value=="of"){cx.marked="keyword";return cont(expression);}
return cont(maybeoperatorComma,forspec2);}
function forspec2(type,value){if(type==";")return cont(forspec3);if(value=="in"||value=="of"){cx.marked="keyword";return cont(expression);}
return pass(expression,expect(";"),forspec3);}
function forspec3(type){if(type!=")")cont(expression);}
function functiondef(type,value){if(value=="*"){cx.marked="keyword";return cont(functiondef);}
if(type=="variable"){register(value);return cont(functiondef);}
if(type=="(")return cont(pushcontext,pushlex(")"),commasep(funarg,")"),poplex,maybetype,statement,popcontext);}
function funarg(type){if(type=="spread")return cont(funarg);return pass(pattern,maybetype,maybeAssign);}
function classExpression(type,value){if(type=="variable")return className(type,value);return classNameAfter(type,value);}
function className(type,value){if(type=="variable"){register(value);return cont(classNameAfter);}}
function classNameAfter(type,value){if(value=="extends"||value=="implements")return cont(isTS?typeexpr:expression,classNameAfter);if(type=="{")return cont(pushlex("}"),classBody,poplex);}
function classBody(type,value){if(type=="variable"||cx.style=="keyword"){if((value=="static"||value=="get"||value=="set"||(isTS&&(value=="public"||value=="private"||value=="protected"||value=="readonly"||value=="abstract")))&&cx.stream.match(/^\s+[\w$\xa1-\uffff]/,false)){cx.marked="keyword";return cont(classBody);}
cx.marked="property";return cont(isTS?classfield:functiondef,classBody);}
if(value=="*"){cx.marked="keyword";return cont(classBody);}
if(type==";")return cont(classBody);if(type=="}")return cont();}
function classfield(type,value){if(value=="?")return cont(classfield)
if(type==":")return cont(typeexpr,maybeAssign)
return pass(functiondef)}
function afterExport(_type,value){if(value=="*"){cx.marked="keyword";return cont(maybeFrom,expect(";"));}
if(value=="default"){cx.marked="keyword";return cont(expression,expect(";"));}
return pass(statement);}
function afterImport(type){if(type=="string")return cont();return pass(importSpec,maybeFrom);}
function importSpec(type,value){if(type=="{")return contCommasep(importSpec,"}");if(type=="variable")register(value);if(value=="*")cx.marked="keyword";return cont(maybeAs);}
function maybeAs(_type,value){if(value=="as"){cx.marked="keyword";return cont(importSpec);}}
function maybeFrom(_type,value){if(value=="from"){cx.marked="keyword";return cont(expression);}}
function arrayLiteral(type){if(type=="]")return cont();return pass(commasep(expressionNoComma,"]"));}
function isContinuedStatement(state,textAfter){return state.lastType=="operator"||state.lastType==","||isOperatorChar.test(textAfter.charAt(0))||/[,.]/.test(textAfter.charAt(0));} 
return{startState:function(basecolumn){var state={tokenize:tokenBase,lastType:"sof",cc:[],lexical:new JSLexical((basecolumn||0)-indentUnit,0,"block",false),localVars:parserConfig.localVars,context:parserConfig.localVars&&{vars:parserConfig.localVars},indented:basecolumn||0};if(parserConfig.globalVars&&typeof parserConfig.globalVars=="object")
state.globalVars=parserConfig.globalVars;return state;},token:function(stream,state){if(stream.sol()){if(!state.lexical.hasOwnProperty("align"))
state.lexical.align=false;state.indented=stream.indentation();findFatArrow(stream,state);}
if(state.tokenize!=tokenComment&&stream.eatSpace())return null;var style=state.tokenize(stream,state);if(type=="comment")return style;state.lastType=type=="operator"&&(content=="++"||content=="--")?"incdec":type;return parseJS(state,style,type,content,stream);},indent:function(state,textAfter){if(state.tokenize==tokenComment)return CodeMirror.Pass;if(state.tokenize!=tokenBase)return 0;var firstChar=textAfter&&textAfter.charAt(0),lexical=state.lexical,top
 
if(!/^\s*else\b/.test(textAfter))for(var i=state.cc.length-1;i>=0;--i){var c=state.cc[i];if(c==poplex)lexical=lexical.prev;else if(c!=maybeelse)break;}
while((lexical.type=="stat"||lexical.type=="form")&&(firstChar=="}"||((top=state.cc[state.cc.length-1])&&(top==maybeoperatorComma||top==maybeoperatorNoComma)&&!/^[,\.=+\-*:?[\(]/.test(textAfter))))
lexical=lexical.prev;if(statementIndent&&lexical.type==")"&&lexical.prev.type=="stat")
lexical=lexical.prev;var type=lexical.type,closing=firstChar==type;if(type=="vardef")return lexical.indented+(state.lastType=="operator"||state.lastType==","?lexical.info+1:0);else if(type=="form"&&firstChar=="{")return lexical.indented;else if(type=="form")return lexical.indented+indentUnit;else if(type=="stat")
return lexical.indented+(isContinuedStatement(state,textAfter)?statementIndent||indentUnit:0);else if(lexical.info=="switch"&&!closing&&parserConfig.doubleIndentSwitch!=false)
return lexical.indented+(/^(?:case|default)\b/.test(textAfter)?indentUnit:2*indentUnit);else if(lexical.align)return lexical.column+(closing?0:1);else return lexical.indented+(closing?0:indentUnit);},electricInput:/^\s*(?:case .*?:|default:|\{|\})$/,blockCommentStart:jsonMode?null:"/*",blockCommentEnd:jsonMode?null:"*/",lineComment:jsonMode?null:"//",fold:"brace",closeBrackets:"()[]{}''\"\"``",helperType:jsonMode?"json":"javascript",jsonldMode:jsonldMode,jsonMode:jsonMode,expressionAllowed:expressionAllowed,skipExpression:function(state){var top=state.cc[state.cc.length-1]
if(top==expression||top==expressionNoComma)state.cc.pop()}};});CodeMirror.registerHelper("wordChars","javascript",/[\w$]/);CodeMirror.defineMIME("text/javascript","javascript");CodeMirror.defineMIME("text/ecmascript","javascript");CodeMirror.defineMIME("application/javascript","javascript");CodeMirror.defineMIME("application/x-javascript","javascript");CodeMirror.defineMIME("application/ecmascript","javascript");CodeMirror.defineMIME("application/json",{name:"javascript",json:true});CodeMirror.defineMIME("application/x-json",{name:"javascript",json:true});CodeMirror.defineMIME("application/ld+json",{name:"javascript",jsonld:true});CodeMirror.defineMIME("text/typescript",{name:"javascript",typescript:true});CodeMirror.defineMIME("application/typescript",{name:"javascript",typescript:true});});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"),require("../xml/xml"),require("../javascript/javascript"))
else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror","../xml/xml","../javascript/javascript"],mod)
else
 mod(CodeMirror)})(function(CodeMirror){"use strict"


function Context(state,mode,depth,prev){this.state=state;this.mode=mode;this.depth=depth;this.prev=prev}
function copyContext(context){return new Context(CodeMirror.copyState(context.mode,context.state),context.mode,context.depth,context.prev&&copyContext(context.prev))}
CodeMirror.defineMode("jsx",function(config,modeConfig){var xmlMode=CodeMirror.getMode(config,{name:"xml",allowMissing:true,multilineTagIndentPastTag:false,allowMissingTagName:true})
var jsMode=CodeMirror.getMode(config,modeConfig&&modeConfig.base||"javascript")
function flatXMLIndent(state){var tagName=state.tagName
state.tagName=null
var result=xmlMode.indent(state,"")
state.tagName=tagName
return result}
function token(stream,state){if(state.context.mode==xmlMode)
return xmlToken(stream,state,state.context)
else
return jsToken(stream,state,state.context)}
function xmlToken(stream,state,cx){if(cx.depth==2){ if(stream.match(/^.*?\*\//))cx.depth=1
else stream.skipToEnd()
return"comment"}
if(stream.peek()=="{"){xmlMode.skipAttribute(cx.state)
var indent=flatXMLIndent(cx.state),xmlContext=cx.state.context
 
if(xmlContext&&stream.match(/^[^>]*>\s*$/,false)){while(xmlContext.prev&&!xmlContext.startOfLine)
xmlContext=xmlContext.prev
 
if(xmlContext.startOfLine)indent-=config.indentUnit
 
else if(cx.prev.state.lexical)indent=cx.prev.state.lexical.indented

}else if(cx.depth==1){indent+=config.indentUnit}
state.context=new Context(CodeMirror.startState(jsMode,indent),jsMode,0,state.context)
return null}
if(cx.depth==1){ if(stream.peek()=="<"){ xmlMode.skipAttribute(cx.state)
state.context=new Context(CodeMirror.startState(xmlMode,flatXMLIndent(cx.state)),xmlMode,0,state.context)
return null}else if(stream.match("//")){stream.skipToEnd()
return"comment"}else if(stream.match("/*")){cx.depth=2
return token(stream,state)}}
var style=xmlMode.token(stream,cx.state),cur=stream.current(),stop
if(/\btag\b/.test(style)){if(/>$/.test(cur)){if(cx.state.context)cx.depth=0
else state.context=state.context.prev}else if(/^</.test(cur)){cx.depth=1}}else if(!style&&(stop=cur.indexOf("{"))>-1){stream.backUp(cur.length-stop)}
return style}
function jsToken(stream,state,cx){if(stream.peek()=="<"&&jsMode.expressionAllowed(stream,cx.state)){jsMode.skipExpression(cx.state)
state.context=new Context(CodeMirror.startState(xmlMode,jsMode.indent(cx.state,"")),xmlMode,0,state.context)
return null}
var style=jsMode.token(stream,cx.state)
if(!style&&cx.depth!=null){var cur=stream.current()
if(cur=="{"){cx.depth++}else if(cur=="}"){if(--cx.depth==0)state.context=state.context.prev}}
return style}
return{startState:function(){return{context:new Context(CodeMirror.startState(jsMode),jsMode)}},copyState:function(state){return{context:copyContext(state.context)}},token:token,indent:function(state,textAfter,fullLine){return state.context.mode.indent(state.context.state,textAfter,fullLine)},innerMode:function(state){return state.context}}},"xml","javascript")
CodeMirror.defineMIME("text/jsx","jsx")
CodeMirror.defineMIME("text/typescript-jsx",{name:"jsx",base:{name:"javascript",typescript:true}})});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";CodeMirror.defineMode('livescript',function(){var tokenBase=function(stream,state){var next_rule=state.next||"start";if(next_rule){state.next=state.next;var nr=Rules[next_rule];if(nr.splice){for(var i$=0;i$<nr.length;++i$){var r=nr[i$];if(r.regex&&stream.match(r.regex)){state.next=r.next||state.next;return r.token;}}
stream.next();return'error';}
if(stream.match(r=Rules[next_rule])){if(r.regex&&stream.match(r.regex)){state.next=r.next;return r.token;}else{stream.next();return'error';}}}
stream.next();return'error';};var external={startState:function(){return{next:'start',lastToken:{style:null,indent:0,content:""}};},token:function(stream,state){while(stream.pos==stream.start)
var style=tokenBase(stream,state);state.lastToken={style:style,indent:stream.indentation(),content:stream.current()};return style.replace(/\./g,' ');},indent:function(state){var indentation=state.lastToken.indent;if(state.lastToken.content.match(indenter)){indentation+=2;}
return indentation;}};return external;});var identifier='(?![\\d\\s])[$\\w\\xAA-\\uFFDC](?:(?!\\s)[$\\w\\xAA-\\uFFDC]|-[A-Za-z])*';var indenter=RegExp('(?:[({[=:]|[-~]>|\\b(?:e(?:lse|xport)|d(?:o|efault)|t(?:ry|hen)|finally|import(?:\\s*all)?|const|var|let|new|catch(?:\\s*'+identifier+')?))\\s*$');var keywordend='(?![$\\w]|-[A-Za-z]|\\s*:(?![:=]))';var stringfill={token:'string',regex:'.+'};var Rules={start:[{token:'comment.doc',regex:'/\\*',next:'comment'},{token:'comment',regex:'#.*'},{token:'keyword',regex:'(?:t(?:h(?:is|row|en)|ry|ypeof!?)|c(?:on(?:tinue|st)|a(?:se|tch)|lass)|i(?:n(?:stanceof)?|mp(?:ort(?:\\s+all)?|lements)|[fs])|d(?:e(?:fault|lete|bugger)|o)|f(?:or(?:\\s+own)?|inally|unction)|s(?:uper|witch)|e(?:lse|x(?:tends|port)|val)|a(?:nd|rguments)|n(?:ew|ot)|un(?:less|til)|w(?:hile|ith)|o[fr]|return|break|let|var|loop)'+keywordend},{token:'constant.language',regex:'(?:true|false|yes|no|on|off|null|void|undefined)'+keywordend},{token:'invalid.illegal',regex:'(?:p(?:ackage|r(?:ivate|otected)|ublic)|i(?:mplements|nterface)|enum|static|yield)'+keywordend},{token:'language.support.class',regex:'(?:R(?:e(?:gExp|ferenceError)|angeError)|S(?:tring|yntaxError)|E(?:rror|valError)|Array|Boolean|Date|Function|Number|Object|TypeError|URIError)'+keywordend},{token:'language.support.function',regex:'(?:is(?:NaN|Finite)|parse(?:Int|Float)|Math|JSON|(?:en|de)codeURI(?:Component)?)'+keywordend},{token:'variable.language',regex:'(?:t(?:hat|il|o)|f(?:rom|allthrough)|it|by|e)'+keywordend},{token:'identifier',regex:identifier+'\\s*:(?![:=])'},{token:'variable',regex:identifier},{token:'keyword.operator',regex:'(?:\\.{3}|\\s+\\?)'},{token:'keyword.variable',regex:'(?:@+|::|\\.\\.)',next:'key'},{token:'keyword.operator',regex:'\\.\\s*',next:'key'},{token:'string',regex:'\\\\\\S[^\\s,;)}\\]]*'},{token:'string.doc',regex:'\'\'\'',next:'qdoc'},{token:'string.doc',regex:'"""',next:'qqdoc'},{token:'string',regex:'\'',next:'qstring'},{token:'string',regex:'"',next:'qqstring'},{token:'string',regex:'`',next:'js'},{token:'string',regex:'<\\[',next:'words'},{token:'string.regex',regex:'//',next:'heregex'},{token:'string.regex',regex:'\\/(?:[^[\\/\\n\\\\]*(?:(?:\\\\.|\\[[^\\]\\n\\\\]*(?:\\\\.[^\\]\\n\\\\]*)*\\])[^[\\/\\n\\\\]*)*)\\/[gimy$]{0,4}',next:'key'},{token:'constant.numeric',regex:'(?:0x[\\da-fA-F][\\da-fA-F_]*|(?:[2-9]|[12]\\d|3[0-6])r[\\da-zA-Z][\\da-zA-Z_]*|(?:\\d[\\d_]*(?:\\.\\d[\\d_]*)?|\\.\\d[\\d_]*)(?:e[+-]?\\d[\\d_]*)?[\\w$]*)'},{token:'lparen',regex:'[({[]'},{token:'rparen',regex:'[)}\\]]',next:'key'},{token:'keyword.operator',regex:'\\S+'},{token:'text',regex:'\\s+'}],heregex:[{token:'string.regex',regex:'.*?//[gimy$?]{0,4}',next:'start'},{token:'string.regex',regex:'\\s*#{'},{token:'comment.regex',regex:'\\s+(?:#.*)?'},{token:'string.regex',regex:'\\S+'}],key:[{token:'keyword.operator',regex:'[.?@!]+'},{token:'identifier',regex:identifier,next:'start'},{token:'text',regex:'',next:'start'}],comment:[{token:'comment.doc',regex:'.*?\\*/',next:'start'},{token:'comment.doc',regex:'.+'}],qdoc:[{token:'string',regex:".*?'''",next:'key'},stringfill],qqdoc:[{token:'string',regex:'.*?"""',next:'key'},stringfill],qstring:[{token:'string',regex:'[^\\\\\']*(?:\\\\.[^\\\\\']*)*\'',next:'key'},stringfill],qqstring:[{token:'string',regex:'[^\\\\"]*(?:\\\\.[^\\\\"]*)*"',next:'key'},stringfill],js:[{token:'string',regex:'[^\\\\`]*(?:\\\\.[^\\\\`]*)*`',next:'key'},stringfill],words:[{token:'string',regex:'.*?\\]>',next:'key'},stringfill]};for(var idx in Rules){var r=Rules[idx];if(r.splice){for(var i=0,len=r.length;i<len;++i){var rr=r[i];if(typeof rr.regex==='string'){Rules[idx][i].regex=new RegExp('^'+rr.regex);}}}else if(typeof rr.regex==='string'){Rules[idx].regex=new RegExp('^'+r.regex);}}
CodeMirror.defineMIME('text/x-livescript','livescript');});



(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";CodeMirror.defineOption("styleSelectedText",false,function(cm,val,old){var prev=old&&old!=CodeMirror.Init;if(val&&!prev){cm.state.markedSelection=[];cm.state.markedSelectionStyle=typeof val=="string"?val:"CodeMirror-selectedtext";reset(cm);cm.on("cursorActivity",onCursorActivity);cm.on("change",onChange);}else if(!val&&prev){cm.off("cursorActivity",onCursorActivity);cm.off("change",onChange);clear(cm);cm.state.markedSelection=cm.state.markedSelectionStyle=null;}});function onCursorActivity(cm){cm.operation(function(){update(cm);});}
function onChange(cm){if(cm.state.markedSelection.length)
cm.operation(function(){clear(cm);});}
var CHUNK_SIZE=8;var Pos=CodeMirror.Pos;var cmp=CodeMirror.cmpPos;function coverRange(cm,from,to,addAt){if(cmp(from,to)==0)return;var array=cm.state.markedSelection;var cls=cm.state.markedSelectionStyle;for(var line=from.line;;){var start=line==from.line?from:Pos(line,0);var endLine=line+CHUNK_SIZE,atEnd=endLine>=to.line;var end=atEnd?to:Pos(endLine,0);var mark=cm.markText(start,end,{className:cls});if(addAt==null)array.push(mark);else array.splice(addAt++,0,mark);if(atEnd)break;line=endLine;}}
function clear(cm){var array=cm.state.markedSelection;for(var i=0;i<array.length;++i)array[i].clear();array.length=0;}
function reset(cm){clear(cm);var ranges=cm.listSelections();for(var i=0;i<ranges.length;i++)
coverRange(cm,ranges[i].from(),ranges[i].to());}
function update(cm){if(!cm.somethingSelected())return clear(cm);if(cm.listSelections().length>1)return reset(cm);var from=cm.getCursor("start"),to=cm.getCursor("end");var array=cm.state.markedSelection;if(!array.length)return coverRange(cm,from,to);var coverStart=array[0].find(),coverEnd=array[array.length-1].find();if(!coverStart||!coverEnd||to.line-from.line<CHUNK_SIZE||cmp(from,coverEnd.to)>=0||cmp(to,coverStart.from)<=0)
return reset(cm);while(cmp(from,coverStart.from)>0){array.shift().clear();coverStart=array[0].find();}
if(cmp(from,coverStart.from)<0){if(coverStart.to.line-from.line<CHUNK_SIZE){array.shift().clear();coverRange(cm,from,coverStart.to,0);}else{coverRange(cm,from,coverStart.from,0);}}
while(cmp(to,coverEnd.to)<0){array.pop().clear();coverEnd=array[array.length-1].find();}
if(cmp(to,coverEnd.to)>0){if(to.line-coverEnd.from.line<CHUNK_SIZE){array.pop().clear();coverRange(cm,coverEnd.from,to);}else{coverRange(cm,coverEnd.to,to);}}}});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){var ie_lt8=/MSIE \d/.test(navigator.userAgent)&&(document.documentMode==null||document.documentMode<8);var Pos=CodeMirror.Pos;var matching={"(":")>",")":"(<","[":"]>","]":"[<","{":"}>","}":"{<"};function findMatchingBracket(cm,where,strict,config){var line=cm.getLineHandle(where.line),pos=where.ch-1;var match=(pos>=0&&matching[line.text.charAt(pos)])||matching[line.text.charAt(++pos)];if(!match)return null;var dir=match.charAt(1)==">"?1:-1;if(strict&&(dir>0)!=(pos==where.ch))return null;var style=cm.getTokenTypeAt(Pos(where.line,pos+1));var found=scanForBracket(cm,Pos(where.line,pos+(dir>0?1:0)),dir,style||null,config);if(found==null)return null;return{from:Pos(where.line,pos),to:found&&found.pos,match:found&&found.ch==match.charAt(0),forward:dir>0};}

 
function scanForBracket(cm,where,dir,style,config){var maxScanLen=(config&&config.maxScanLineLength)||10000;var maxScanLines=(config&&config.maxScanLines)||1000;var stack=[];var re=config&&config.bracketRegex?config.bracketRegex:/[(){}[\]]/;var lineEnd=dir>0?Math.min(where.line+maxScanLines,cm.lastLine()+1):Math.max(cm.firstLine()-1,where.line-maxScanLines);for(var lineNo=where.line;lineNo!=lineEnd;lineNo+=dir){var line=cm.getLine(lineNo);if(!line)continue;var pos=dir>0?0:line.length-1,end=dir>0?line.length:-1;if(line.length>maxScanLen)continue;if(lineNo==where.line)pos=where.ch-(dir<0?1:0);for(;pos!=end;pos+=dir){var ch=line.charAt(pos);if(re.test(ch)&&(style===undefined||cm.getTokenTypeAt(Pos(lineNo,pos+1))==style)){var match=matching[ch];if((match.charAt(1)==">")==(dir>0))stack.push(ch);else if(!stack.length)return{pos:Pos(lineNo,pos),ch:ch};else stack.pop();}}}
return lineNo-dir==(dir>0?cm.lastLine():cm.firstLine())?false:null;}
function matchBrackets(cm,autoclear,config){ var maxHighlightLen=cm.state.matchBrackets.maxHighlightLineLength||1000;var marks=[],ranges=cm.listSelections();for(var i=0;i<ranges.length;i++){var match=ranges[i].empty()&&findMatchingBracket(cm,ranges[i].head,false,config);if(match&&cm.getLine(match.from.line).length<=maxHighlightLen){var style=match.match?"CodeMirror-matchingbracket":"CodeMirror-nonmatchingbracket";marks.push(cm.markText(match.from,Pos(match.from.line,match.from.ch+1),{className:style}));if(match.to&&cm.getLine(match.to.line).length<=maxHighlightLen)
marks.push(cm.markText(match.to,Pos(match.to.line,match.to.ch+1),{className:style}));}}
if(marks.length){
if(ie_lt8&&cm.state.focused)cm.focus();var clear=function(){cm.operation(function(){for(var i=0;i<marks.length;i++)marks[i].clear();});};if(autoclear)setTimeout(clear,800);else return clear;}}
var currentlyHighlighted=null;function doMatchBrackets(cm){cm.operation(function(){if(currentlyHighlighted){currentlyHighlighted();currentlyHighlighted=null;}
currentlyHighlighted=matchBrackets(cm,false,cm.state.matchBrackets);});}
CodeMirror.defineOption("matchBrackets",false,function(cm,val,old){if(old&&old!=CodeMirror.Init){cm.off("cursorActivity",doMatchBrackets);if(currentlyHighlighted){currentlyHighlighted();currentlyHighlighted=null;}}
if(val){cm.state.matchBrackets=typeof val=="object"?val:{};cm.on("cursorActivity",doMatchBrackets);}});CodeMirror.defineExtension("matchBrackets",function(){matchBrackets(this,true);});CodeMirror.defineExtension("findMatchingBracket",function(pos,strict,config){return findMatchingBracket(this,pos,strict,config);});CodeMirror.defineExtension("scanForBracket",function(pos,dir,style,config){return scanForBracket(this,pos,dir,style,config);});});







(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";CodeMirror.overlayMode=function(base,overlay,combine){return{startState:function(){return{base:CodeMirror.startState(base),overlay:CodeMirror.startState(overlay),basePos:0,baseCur:null,overlayPos:0,overlayCur:null,streamSeen:null};},copyState:function(state){return{base:CodeMirror.copyState(base,state.base),overlay:CodeMirror.copyState(overlay,state.overlay),basePos:state.basePos,baseCur:null,overlayPos:state.overlayPos,overlayCur:null};},token:function(stream,state){if(stream!=state.streamSeen||Math.min(state.basePos,state.overlayPos)<stream.start){state.streamSeen=stream;state.basePos=state.overlayPos=stream.start;}
if(stream.start==state.basePos){state.baseCur=base.token(stream,state.base);state.basePos=stream.pos;}
if(stream.start==state.overlayPos){stream.pos=stream.start;state.overlayCur=overlay.token(stream,state.overlay);state.overlayPos=stream.pos;}
stream.pos=Math.min(state.basePos,state.overlayPos); if(state.overlayCur==null)return state.baseCur;else if(state.baseCur!=null&&state.overlay.combineTokens||combine&&state.overlay.combineTokens==null)
return state.baseCur+" "+state.overlayCur;else return state.overlayCur;},indent:base.indent&&function(state,textAfter){return base.indent(state.base,textAfter);},electricChars:base.electricChars,innerMode:function(state){return{state:state.base,mode:base};},blankLine:function(state){var baseToken,overlayToken;if(base.blankLine)baseToken=base.blankLine(state.base);if(overlay.blankLine)overlayToken=overlay.blankLine(state.overlay);return overlayToken==null?baseToken:(combine&&baseToken!=null?baseToken+" "+overlayToken:overlayToken);}};};});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){CodeMirror.defineOption("placeholder","",function(cm,val,old){var prev=old&&old!=CodeMirror.Init;if(val&&!prev){cm.on("blur",onBlur);cm.on("change",onChange);cm.on("swapDoc",onChange);onChange(cm);}else if(!val&&prev){cm.off("blur",onBlur);cm.off("change",onChange);cm.off("swapDoc",onChange);clearPlaceholder(cm);var wrapper=cm.getWrapperElement();wrapper.className=wrapper.className.replace(" CodeMirror-empty","");}
if(val&&!cm.hasFocus())onBlur(cm);});function clearPlaceholder(cm){if(cm.state.placeholder){cm.state.placeholder.parentNode.removeChild(cm.state.placeholder);cm.state.placeholder=null;}}
function setPlaceholder(cm){clearPlaceholder(cm);var elt=cm.state.placeholder=document.createElement("pre");elt.style.cssText="height: 0; overflow: visible";elt.className="CodeMirror-placeholder";var placeHolder=cm.getOption("placeholder")
if(typeof placeHolder=="string")placeHolder=document.createTextNode(placeHolder)
elt.appendChild(placeHolder)
cm.display.lineSpace.insertBefore(elt,cm.display.lineSpace.firstChild);}
function onBlur(cm){if(isEmpty(cm))setPlaceholder(cm);}
function onChange(cm){var wrapper=cm.getWrapperElement(),empty=isEmpty(cm);wrapper.className=wrapper.className.replace(" CodeMirror-empty","")+(empty?" CodeMirror-empty":"");if(empty)setPlaceholder(cm);else clearPlaceholder(cm);}
function isEmpty(cm){return(cm.lineCount()===1)&&(cm.getLine(0)==="");}});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";CodeMirror.runMode=function(string,modespec,callback,options){var mode=CodeMirror.getMode(CodeMirror.defaults,modespec);var ie=/MSIE \d/.test(navigator.userAgent);var ie_lt9=ie&&(document.documentMode==null||document.documentMode<9);if(callback.appendChild){var tabSize=(options&&options.tabSize)||CodeMirror.defaults.tabSize;var node=callback,col=0;node.innerHTML="";callback=function(text,style){if(text=="\n"){node.appendChild(document.createTextNode(ie_lt9?'\r':text));col=0;return;}
var content=""; for(var pos=0;;){var idx=text.indexOf("\t",pos);if(idx==-1){content+=text.slice(pos);col+=text.length-pos;break;}else{col+=idx-pos;content+=text.slice(pos,idx);var size=tabSize-col%tabSize;col+=size;for(var i=0;i<size;++i)content+=" ";pos=idx+1;}}
if(style){var sp=node.appendChild(document.createElement("span"));sp.className="cm-"+style.replace(/ +/g," cm-");sp.appendChild(document.createTextNode(content));}else{node.appendChild(document.createTextNode(content));}};}
var lines=CodeMirror.splitLines(string),state=(options&&options.state)||CodeMirror.startState(mode);for(var i=0,e=lines.length;i<e;++i){if(i)callback("\n");var stream=new CodeMirror.StringStream(lines[i]);if(!stream.string&&mode.blankLine)mode.blankLine(state);while(!stream.eol()){var style=mode.token(stream,state);callback(stream.current(),style,i,stream.start,state);stream.start=stream.pos;}}};});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";CodeMirror.defineMode("sass",function(config){function tokenRegexp(words){return new RegExp("^"+words.join("|"));}
var keywords=["true","false","null","auto"];var keywordsRegexp=new RegExp("^"+keywords.join("|"));var operators=["\\(","\\)","=",">","<","==",">=","<=","\\+","-","\\!=","/","\\*","%","and","or","not",";","\\{","\\}",":"];var opRegexp=tokenRegexp(operators);var pseudoElementsRegexp=/^::?[a-zA-Z_][\w\-]*/;function urlTokens(stream,state){var ch=stream.peek();if(ch===")"){stream.next();state.tokenizer=tokenBase;return"operator";}else if(ch==="("){stream.next();stream.eatSpace();return"operator";}else if(ch==="'"||ch==='"'){state.tokenizer=buildStringTokenizer(stream.next());return"string";}else{state.tokenizer=buildStringTokenizer(")",false);return"string";}}
function comment(indentation,multiLine){return function(stream,state){if(stream.sol()&&stream.indentation()<=indentation){state.tokenizer=tokenBase;return tokenBase(stream,state);}
if(multiLine&&stream.skipTo("*/")){stream.next();stream.next();state.tokenizer=tokenBase;}else{stream.skipToEnd();}
return"comment";};}
function buildStringTokenizer(quote,greedy){if(greedy==null){greedy=true;}
function stringTokenizer(stream,state){var nextChar=stream.next();var peekChar=stream.peek();var previousChar=stream.string.charAt(stream.pos-2);var endingString=((nextChar!=="\\"&&peekChar===quote)||(nextChar===quote&&previousChar!=="\\"));if(endingString){if(nextChar!==quote&&greedy){stream.next();}
state.tokenizer=tokenBase;return"string";}else if(nextChar==="#"&&peekChar==="{"){state.tokenizer=buildInterpolationTokenizer(stringTokenizer);stream.next();return"operator";}else{return"string";}}
return stringTokenizer;}
function buildInterpolationTokenizer(currentTokenizer){return function(stream,state){if(stream.peek()==="}"){stream.next();state.tokenizer=currentTokenizer;return"operator";}else{return tokenBase(stream,state);}};}
function indent(state){if(state.indentCount==0){state.indentCount++;var lastScopeOffset=state.scopes[0].offset;var currentOffset=lastScopeOffset+config.indentUnit;state.scopes.unshift({offset:currentOffset});}}
function dedent(state){if(state.scopes.length==1)return;state.scopes.shift();}
function tokenBase(stream,state){var ch=stream.peek(); if(stream.match("/*")){state.tokenizer=comment(stream.indentation(),true);return state.tokenizer(stream,state);}
if(stream.match("//")){state.tokenizer=comment(stream.indentation(),false);return state.tokenizer(stream,state);} 
if(stream.match("#{")){state.tokenizer=buildInterpolationTokenizer(tokenBase);return"operator";} 
if(ch==='"'||ch==="'"){stream.next();state.tokenizer=buildStringTokenizer(ch);return"string";}
if(!state.cursorHalf){

 if(ch==="."){stream.next();if(stream.match(/^[\w-]+/)){indent(state);return"atom";}else if(stream.peek()==="#"){indent(state);return"atom";}}
if(ch==="#"){stream.next(); if(stream.match(/^[\w-]+/)){indent(state);return"atom";}
if(stream.peek()==="#"){indent(state);return"atom";}} 
if(ch==="$"){stream.next();stream.eatWhile(/[\w-]/);return"variable-2";} 
if(stream.match(/^-?[0-9\.]+/))
return"number"; if(stream.match(/^(px|em|in)\b/))
return"unit";if(stream.match(keywordsRegexp))
return"keyword";if(stream.match(/^url/)&&stream.peek()==="("){state.tokenizer=urlTokens;return"atom";}
if(ch==="="){ if(stream.match(/^=[\w-]+/)){indent(state);return"meta";}}
if(ch==="+"){ if(stream.match(/^\+[\w-]+/)){return"variable-3";}}
if(ch==="@"){if(stream.match(/@extend/)){if(!stream.match(/\s*[\w]/))
dedent(state);}} 
if(stream.match(/^@(else if|if|media|else|for|each|while|mixin|function)/)){indent(state);return"meta";} 
if(ch==="@"){stream.next();stream.eatWhile(/[\w-]/);return"meta";}
if(stream.eatWhile(/[\w-]/)){if(stream.match(/ *: *[\w-\+\$#!\("']/,false)){return"property";}
else if(stream.match(/ *:/,false)){indent(state);state.cursorHalf=1;return"atom";}
else if(stream.match(/ *,/,false)){return"atom";}
else{indent(state);return"atom";}}
if(ch===":"){if(stream.match(pseudoElementsRegexp)){ return"keyword";}
stream.next();state.cursorHalf=1;return"operator";}} 
else{if(ch==="#"){stream.next(); if(stream.match(/[0-9a-fA-F]{6}|[0-9a-fA-F]{3}/)){if(!stream.peek()){state.cursorHalf=0;}
return"number";}} 
if(stream.match(/^-?[0-9\.]+/)){if(!stream.peek()){state.cursorHalf=0;}
return"number";} 
if(stream.match(/^(px|em|in)\b/)){if(!stream.peek()){state.cursorHalf=0;}
return"unit";}
if(stream.match(keywordsRegexp)){if(!stream.peek()){state.cursorHalf=0;}
return"keyword";}
if(stream.match(/^url/)&&stream.peek()==="("){state.tokenizer=urlTokens;if(!stream.peek()){state.cursorHalf=0;}
return"atom";} 
if(ch==="$"){stream.next();stream.eatWhile(/[\w-]/);if(!stream.peek()){state.cursorHalf=0;}
return"variable-3";}
if(ch==="!"){stream.next();if(!stream.peek()){state.cursorHalf=0;}
return stream.match(/^[\w]+/)?"keyword":"operator";}
if(stream.match(opRegexp)){if(!stream.peek()){state.cursorHalf=0;}
return"operator";} 
if(stream.eatWhile(/[\w-]/)){if(!stream.peek()){state.cursorHalf=0;}
return"attribute";}
if(!stream.peek()){state.cursorHalf=0;return null;}} 
if(stream.match(opRegexp))
return"operator";
 stream.next();return null;}
function tokenLexer(stream,state){if(stream.sol())state.indentCount=0;var style=state.tokenizer(stream,state);var current=stream.current();if(current==="@return"||current==="}"){dedent(state);}
if(style!==null){var startOfToken=stream.pos-current.length;var withCurrentIndent=startOfToken+(config.indentUnit*state.indentCount);var newScopes=[];for(var i=0;i<state.scopes.length;i++){var scope=state.scopes[i];if(scope.offset<=withCurrentIndent)
newScopes.push(scope);}
state.scopes=newScopes;}
return style;}
return{startState:function(){return{tokenizer:tokenBase,scopes:[{offset:0,type:"sass"}],indentCount:0,cursorHalf:0,
definedVars:[],definedMixins:[]};},token:function(stream,state){var style=tokenLexer(stream,state);state.lastToken={style:style,content:stream.current()};return style;},indent:function(state){return state.scopes[0].offset;}};});CodeMirror.defineMIME("text/x-sass","sass");});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";var Pos=CodeMirror.Pos;function SearchCursor(doc,query,pos,caseFold){this.atOccurrence=false;this.doc=doc;if(caseFold==null&&typeof query=="string")caseFold=false;pos=pos?doc.clipPos(pos):Pos(0,0);this.pos={from:pos,to:pos};

if(typeof query!="string"){ if(!query.global)query=new RegExp(query.source,query.ignoreCase?"ig":"g");this.matches=function(reverse,pos){if(reverse){query.lastIndex=0;var line=doc.getLine(pos.line).slice(0,pos.ch),cutOff=0,match,start;for(;;){query.lastIndex=cutOff;var newMatch=query.exec(line);if(!newMatch)break;match=newMatch;start=match.index;cutOff=match.index+(match[0].length||1);if(cutOff==line.length)break;}
var matchLen=(match&&match[0].length)||0;if(!matchLen){if(start==0&&line.length==0){match=undefined;}
else if(start!=doc.getLine(pos.line).length){matchLen++;}}}else{query.lastIndex=pos.ch;var line=doc.getLine(pos.line),match=query.exec(line);var matchLen=(match&&match[0].length)||0;var start=match&&match.index;if(start+matchLen!=line.length&&!matchLen)matchLen=1;}
if(match&&matchLen)
return{from:Pos(pos.line,start),to:Pos(pos.line,start+matchLen),match:match};};}else{ var origQuery=query;if(caseFold)query=query.toLowerCase();var fold=caseFold?function(str){return str.toLowerCase();}:function(str){return str;};var target=query.split("\n"); if(target.length==1){if(!query.length){
this.matches=function(){};}else{this.matches=function(reverse,pos){if(reverse){var orig=doc.getLine(pos.line).slice(0,pos.ch),line=fold(orig);var match=line.lastIndexOf(query);if(match>-1){match=adjustPos(orig,line,match);return{from:Pos(pos.line,match),to:Pos(pos.line,match+origQuery.length)};}}else{var orig=doc.getLine(pos.line).slice(pos.ch),line=fold(orig);var match=line.indexOf(query);if(match>-1){match=adjustPos(orig,line,match)+pos.ch;return{from:Pos(pos.line,match),to:Pos(pos.line,match+origQuery.length)};}}};}}else{var origTarget=origQuery.split("\n");this.matches=function(reverse,pos){var last=target.length-1;if(reverse){if(pos.line-(target.length-1)<doc.firstLine())return;if(fold(doc.getLine(pos.line).slice(0,origTarget[last].length))!=target[target.length-1])return;var to=Pos(pos.line,origTarget[last].length);for(var ln=pos.line-1,i=last-1;i>=1;--i,--ln)
if(target[i]!=fold(doc.getLine(ln)))return;var line=doc.getLine(ln),cut=line.length-origTarget[0].length;if(fold(line.slice(cut))!=target[0])return;return{from:Pos(ln,cut),to:to};}else{if(pos.line+(target.length-1)>doc.lastLine())return;var line=doc.getLine(pos.line),cut=line.length-origTarget[0].length;if(fold(line.slice(cut))!=target[0])return;var from=Pos(pos.line,cut);for(var ln=pos.line+1,i=1;i<last;++i,++ln)
if(target[i]!=fold(doc.getLine(ln)))return;if(fold(doc.getLine(ln).slice(0,origTarget[last].length))!=target[last])return;return{from:from,to:Pos(ln,origTarget[last].length)};}};}}}
SearchCursor.prototype={findNext:function(){return this.find(false);},findPrevious:function(){return this.find(true);},find:function(reverse){var self=this,pos=this.doc.clipPos(reverse?this.pos.from:this.pos.to);function savePosAndFail(line){var pos=Pos(line,0);self.pos={from:pos,to:pos};self.atOccurrence=false;return false;}
for(;;){if(this.pos=this.matches(reverse,pos)){this.atOccurrence=true;return this.pos.match||true;}
if(reverse){if(!pos.line)return savePosAndFail(0);pos=Pos(pos.line-1,this.doc.getLine(pos.line-1).length);}
else{var maxLine=this.doc.lineCount();if(pos.line==maxLine-1)return savePosAndFail(maxLine);pos=Pos(pos.line+1,0);}}},from:function(){if(this.atOccurrence)return this.pos.from;},to:function(){if(this.atOccurrence)return this.pos.to;},replace:function(newText,origin){if(!this.atOccurrence)return;var lines=CodeMirror.splitLines(newText);this.doc.replaceRange(lines,this.pos.from,this.pos.to,origin);this.pos.to=Pos(this.pos.from.line+lines.length-1,lines[lines.length-1].length+(lines.length==1?this.pos.from.ch:0));}};
function adjustPos(orig,folded,pos){if(orig.length==folded.length)return pos;for(var pos1=Math.min(pos,orig.length);;){var len1=orig.slice(0,pos1).toLowerCase().length;if(len1<pos)++pos1;else if(len1>pos)--pos1;else return pos1;}}
CodeMirror.defineExtension("getSearchCursor",function(query,pos,caseFold){return new SearchCursor(this.doc,query,pos,caseFold);});CodeMirror.defineDocExtension("getSearchCursor",function(query,pos,caseFold){return new SearchCursor(this,query,pos,caseFold);});CodeMirror.defineExtension("selectMatches",function(query,caseFold){var ranges=[];var cur=this.getSearchCursor(query,this.getCursor("from"),caseFold);while(cur.findNext()){if(CodeMirror.cmpPos(cur.to(),this.getCursor("to"))>0)break;ranges.push({anchor:cur.from(),head:cur.to()});}
if(ranges.length)
this.setSelections(ranges,0);});});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";CodeMirror.defineMode("sql",function(config,parserConfig){"use strict";var client=parserConfig.client||{},atoms=parserConfig.atoms||{"false":true,"true":true,"null":true},builtin=parserConfig.builtin||{},keywords=parserConfig.keywords||{},operatorChars=parserConfig.operatorChars||/^[*+\-%<>!=&|~^]/,support=parserConfig.support||{},hooks=parserConfig.hooks||{},dateSQL=parserConfig.dateSQL||{"date":true,"time":true,"timestamp":true};function tokenBase(stream,state){var ch=stream.next(); if(hooks[ch]){var result=hooks[ch](stream,state);if(result!==false)return result;}
if(support.hexNumber&&((ch=="0"&&stream.match(/^[xX][0-9a-fA-F]+/))||(ch=="x"||ch=="X")&&stream.match(/^'[0-9a-fA-F]+'/))){
 return"number";}else if(support.binaryNumber&&(((ch=="b"||ch=="B")&&stream.match(/^'[01]+'/))||(ch=="0"&&stream.match(/^b[01]+/)))){
 return"number";}else if(ch.charCodeAt(0)>47&&ch.charCodeAt(0)<58){
 stream.match(/^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/);support.decimallessFloat&&stream.eat('.');return"number";}else if(ch=="?"&&(stream.eatSpace()||stream.eol()||stream.eat(";"))){ return"variable-3";}else if(ch=="'"||(ch=='"'&&support.doubleQuote)){
 state.tokenize=tokenLiteral(ch);return state.tokenize(stream,state);}else if((((support.nCharCast&&(ch=="n"||ch=="N"))||(support.charsetCast&&ch=="_"&&stream.match(/[a-z][a-z0-9]*/i)))&&(stream.peek()=="'"||stream.peek()=='"'))){ return"keyword";}else if(/^[\(\),\;\[\]]/.test(ch)){ return null;}else if(support.commentSlashSlash&&ch=="/"&&stream.eat("/")){ stream.skipToEnd();return"comment";}else if((support.commentHash&&ch=="#")||(ch=="-"&&stream.eat("-")&&(!support.commentSpaceRequired||stream.eat(" ")))){
stream.skipToEnd();return"comment";}else if(ch=="/"&&stream.eat("*")){
state.tokenize=tokenComment;return state.tokenize(stream,state);}else if(ch=="."){ if(support.zerolessFloat&&stream.match(/^(?:\d+(?:e[+-]?\d+)?)/i)){return"number";} 
if(support.ODBCdotTable&&stream.match(/^[a-zA-Z_]+/)){return"variable-2";}}else if(operatorChars.test(ch)){ stream.eatWhile(operatorChars);return null;}else if(ch=='{'&&(stream.match(/^( )*(d|D|t|T|ts|TS)( )*'[^']*'( )*}/)||stream.match(/^( )*(d|D|t|T|ts|TS)( )*"[^"]*"( )*}/))){ 
return"number";}else{stream.eatWhile(/^[_\w\d]/);var word=stream.current().toLowerCase(); 
if(dateSQL.hasOwnProperty(word)&&(stream.match(/^( )+'[^']*'/)||stream.match(/^( )+"[^"]*"/)))
return"number";if(atoms.hasOwnProperty(word))return"atom";if(builtin.hasOwnProperty(word))return"builtin";if(keywords.hasOwnProperty(word))return"keyword";if(client.hasOwnProperty(word))return"string-2";return null;}}
function tokenLiteral(quote){return function(stream,state){var escaped=false,ch;while((ch=stream.next())!=null){if(ch==quote&&!escaped){state.tokenize=tokenBase;break;}
escaped=!escaped&&ch=="\\";}
return"string";};}
function tokenComment(stream,state){while(true){if(stream.skipTo("*")){stream.next();if(stream.eat("/")){state.tokenize=tokenBase;break;}}else{stream.skipToEnd();break;}}
return"comment";}
function pushContext(stream,state,type){state.context={prev:state.context,indent:stream.indentation(),col:stream.column(),type:type};}
function popContext(state){state.indent=state.context.indent;state.context=state.context.prev;}
return{startState:function(){return{tokenize:tokenBase,context:null};},token:function(stream,state){if(stream.sol()){if(state.context&&state.context.align==null)
state.context.align=false;}
if(stream.eatSpace())return null;var style=state.tokenize(stream,state);if(style=="comment")return style;if(state.context&&state.context.align==null)
state.context.align=true;var tok=stream.current();if(tok=="(")
pushContext(stream,state,")");else if(tok=="[")
pushContext(stream,state,"]");else if(state.context&&state.context.type==tok)
popContext(state);return style;},indent:function(state,textAfter){var cx=state.context;if(!cx)return CodeMirror.Pass;var closing=textAfter.charAt(0)==cx.type;if(cx.align)return cx.col+(closing?0:1);else return cx.indent+(closing?0:config.indentUnit);},blockCommentStart:"/*",blockCommentEnd:"*/",lineComment:support.commentSlashSlash?"//":support.commentHash?"#":null};});(function(){"use strict";function hookIdentifier(stream){
 var ch;while((ch=stream.next())!=null){if(ch=="`"&&!stream.eat("`"))return"variable-2";}
stream.backUp(stream.current().length-1);return stream.eatWhile(/\w/)?"variable-2":null;} 
function hookVar(stream){

 if(stream.eat("@")){stream.match(/^session\./);stream.match(/^local\./);stream.match(/^global\./);}
if(stream.eat("'")){stream.match(/^.*'/);return"variable-2";}else if(stream.eat('"')){stream.match(/^.*"/);return"variable-2";}else if(stream.eat("`")){stream.match(/^.*`/);return"variable-2";}else if(stream.match(/^[0-9a-zA-Z$\.\_]+/)){return"variable-2";}
return null;}; function hookClient(stream){
 if(stream.eat("N")){return"atom";}
 
return stream.match(/^[a-zA-Z.#!?]/)?"variable-2":null;}
var sqlKeywords="alter and as asc between by count create delete desc distinct drop from group having in insert into is join like not on or order select set table union update values where limit "; function set(str){var obj={},words=str.split(" ");for(var i=0;i<words.length;++i)obj[words[i]]=true;return obj;} 
CodeMirror.defineMIME("text/x-sql",{name:"sql",keywords:set(sqlKeywords+"begin"),builtin:set("bool boolean bit blob enum long longblob longtext medium mediumblob mediumint mediumtext time timestamp tinyblob tinyint tinytext text bigint int int1 int2 int3 int4 int8 integer float float4 float8 double char varbinary varchar varcharacter precision real date datetime year unsigned signed decimal numeric"),atoms:set("false true null unknown"),operatorChars:/^[*+\-%<>!=]/,dateSQL:set("date time timestamp"),support:set("ODBCdotTable doubleQuote binaryNumber hexNumber")});CodeMirror.defineMIME("text/x-mssql",{name:"sql",client:set("charset clear connect edit ego exit go help nopager notee nowarning pager print prompt quit rehash source status system tee"),keywords:set(sqlKeywords+"begin trigger proc view index for add constraint key primary foreign collate clustered nonclustered declare exec"),builtin:set("bigint numeric bit smallint decimal smallmoney int tinyint money float real char varchar text nchar nvarchar ntext binary varbinary image cursor timestamp hierarchyid uniqueidentifier sql_variant xml table "),atoms:set("false true null unknown"),operatorChars:/^[*+\-%<>!=]/,dateSQL:set("date datetimeoffset datetime2 smalldatetime datetime time"),hooks:{"@":hookVar}});CodeMirror.defineMIME("text/x-mysql",{name:"sql",client:set("charset clear connect edit ego exit go help nopager notee nowarning pager print prompt quit rehash source status system tee"),keywords:set(sqlKeywords+"accessible action add after algorithm all analyze asensitive at authors auto_increment autocommit avg avg_row_length before binary binlog both btree cache call cascade cascaded case catalog_name chain change changed character check checkpoint checksum class_origin client_statistics close coalesce code collate collation collations column columns comment commit committed completion concurrent condition connection consistent constraint contains continue contributors convert cross current current_date current_time current_timestamp current_user cursor data database databases day_hour day_microsecond day_minute day_second deallocate dec declare default delay_key_write delayed delimiter des_key_file describe deterministic dev_pop dev_samp deviance diagnostics directory disable discard distinctrow div dual dumpfile each elseif enable enclosed end ends engine engines enum errors escape escaped even event events every execute exists exit explain extended fast fetch field fields first flush for force foreign found_rows full fulltext function general get global grant grants group group_concat handler hash help high_priority hosts hour_microsecond hour_minute hour_second if ignore ignore_server_ids import index index_statistics infile inner innodb inout insensitive insert_method install interval invoker isolation iterate key keys kill language last leading leave left level limit linear lines list load local localtime localtimestamp lock logs low_priority master master_heartbeat_period master_ssl_verify_server_cert masters match max max_rows maxvalue message_text middleint migrate min min_rows minute_microsecond minute_second mod mode modifies modify mutex mysql_errno natural next no no_write_to_binlog offline offset one online open optimize option optionally out outer outfile pack_keys parser partition partitions password phase plugin plugins prepare preserve prev primary privileges procedure processlist profile profiles purge query quick range read read_write reads real rebuild recover references regexp relaylog release remove rename reorganize repair repeatable replace require resignal restrict resume return returns revoke right rlike rollback rollup row row_format rtree savepoint schedule schema schema_name schemas second_microsecond security sensitive separator serializable server session share show signal slave slow smallint snapshot soname spatial specific sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache sql_small_result sqlexception sqlstate sqlwarning ssl start starting starts status std stddev stddev_pop stddev_samp storage straight_join subclass_origin sum suspend table_name table_statistics tables tablespace temporary terminated to trailing transaction trigger triggers truncate uncommitted undo uninstall unique unlock upgrade usage use use_frm user user_resources user_statistics using utc_date utc_time utc_timestamp value variables varying view views warnings when while with work write xa xor year_month zerofill begin do then else loop repeat"),builtin:set("bool boolean bit blob decimal double float long longblob longtext medium mediumblob mediumint mediumtext time timestamp tinyblob tinyint tinytext text bigint int int1 int2 int3 int4 int8 integer float float4 float8 double char varbinary varchar varcharacter precision date datetime year unsigned signed numeric"),atoms:set("false true null unknown"),operatorChars:/^[*+\-%<>!=&|^]/,dateSQL:set("date time timestamp"),support:set("ODBCdotTable decimallessFloat zerolessFloat binaryNumber hexNumber doubleQuote nCharCast charsetCast commentHash commentSpaceRequired"),hooks:{"@":hookVar,"`":hookIdentifier,"\\":hookClient}});CodeMirror.defineMIME("text/x-mariadb",{name:"sql",client:set("charset clear connect edit ego exit go help nopager notee nowarning pager print prompt quit rehash source status system tee"),keywords:set(sqlKeywords+"accessible action add after algorithm all always analyze asensitive at authors auto_increment autocommit avg avg_row_length before binary binlog both btree cache call cascade cascaded case catalog_name chain change changed character check checkpoint checksum class_origin client_statistics close coalesce code collate collation collations column columns comment commit committed completion concurrent condition connection consistent constraint contains continue contributors convert cross current current_date current_time current_timestamp current_user cursor data database databases day_hour day_microsecond day_minute day_second deallocate dec declare default delay_key_write delayed delimiter des_key_file describe deterministic dev_pop dev_samp deviance diagnostics directory disable discard distinctrow div dual dumpfile each elseif enable enclosed end ends engine engines enum errors escape escaped even event events every execute exists exit explain extended fast fetch field fields first flush for force foreign found_rows full fulltext function general generated get global grant grants group groupby_concat handler hard hash help high_priority hosts hour_microsecond hour_minute hour_second if ignore ignore_server_ids import index index_statistics infile inner innodb inout insensitive insert_method install interval invoker isolation iterate key keys kill language last leading leave left level limit linear lines list load local localtime localtimestamp lock logs low_priority master master_heartbeat_period master_ssl_verify_server_cert masters match max max_rows maxvalue message_text middleint migrate min min_rows minute_microsecond minute_second mod mode modifies modify mutex mysql_errno natural next no no_write_to_binlog offline offset one online open optimize option optionally out outer outfile pack_keys parser partition partitions password persistent phase plugin plugins prepare preserve prev primary privileges procedure processlist profile profiles purge query quick range read read_write reads real rebuild recover references regexp relaylog release remove rename reorganize repair repeatable replace require resignal restrict resume return returns revoke right rlike rollback rollup row row_format rtree savepoint schedule schema schema_name schemas second_microsecond security sensitive separator serializable server session share show shutdown signal slave slow smallint snapshot soft soname spatial specific sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache sql_small_result sqlexception sqlstate sqlwarning ssl start starting starts status std stddev stddev_pop stddev_samp storage straight_join subclass_origin sum suspend table_name table_statistics tables tablespace temporary terminated to trailing transaction trigger triggers truncate uncommitted undo uninstall unique unlock upgrade usage use use_frm user user_resources user_statistics using utc_date utc_time utc_timestamp value variables varying view views virtual warnings when while with work write xa xor year_month zerofill begin do then else loop repeat"),builtin:set("bool boolean bit blob decimal double float long longblob longtext medium mediumblob mediumint mediumtext time timestamp tinyblob tinyint tinytext text bigint int int1 int2 int3 int4 int8 integer float float4 float8 double char varbinary varchar varcharacter precision date datetime year unsigned signed numeric"),atoms:set("false true null unknown"),operatorChars:/^[*+\-%<>!=&|^]/,dateSQL:set("date time timestamp"),support:set("ODBCdotTable decimallessFloat zerolessFloat binaryNumber hexNumber doubleQuote nCharCast charsetCast commentHash commentSpaceRequired"),hooks:{"@":hookVar,"`":hookIdentifier,"\\":hookClient}});
 CodeMirror.defineMIME("text/x-cassandra",{name:"sql",client:{},keywords:set("add all allow alter and any apply as asc authorize batch begin by clustering columnfamily compact consistency count create custom delete desc distinct drop each_quorum exists filtering from grant if in index insert into key keyspace keyspaces level limit local_one local_quorum modify nan norecursive nosuperuser not of on one order password permission permissions primary quorum rename revoke schema select set storage superuser table three to token truncate ttl two type unlogged update use user users using values where with writetime"),builtin:set("ascii bigint blob boolean counter decimal double float frozen inet int list map static text timestamp timeuuid tuple uuid varchar varint"),atoms:set("false true infinity NaN"),operatorChars:/^[<>=]/,dateSQL:{},support:set("commentSlashSlash decimallessFloat"),hooks:{}}); CodeMirror.defineMIME("text/x-plsql",{name:"sql",client:set("appinfo arraysize autocommit autoprint autorecovery autotrace blockterminator break btitle cmdsep colsep compatibility compute concat copycommit copytypecheck define describe echo editfile embedded escape exec execute feedback flagger flush heading headsep instance linesize lno loboffset logsource long longchunksize markup native newpage numformat numwidth pagesize pause pno recsep recsepchar release repfooter repheader serveroutput shiftinout show showmode size spool sqlblanklines sqlcase sqlcode sqlcontinue sqlnumber sqlpluscompatibility sqlprefix sqlprompt sqlterminator suffix tab term termout time timing trimout trimspool ttitle underline verify version wrap"),keywords:set("abort accept access add all alter and any array arraylen as asc assert assign at attributes audit authorization avg base_table begin between binary_integer body boolean by case cast char char_base check close cluster clusters colauth column comment commit compress connect connected constant constraint crash create current currval cursor data_base database date dba deallocate debugoff debugon decimal declare default definition delay delete desc digits dispose distinct do drop else elseif elsif enable end entry escape exception exception_init exchange exclusive exists exit external fast fetch file for force form from function generic goto grant group having identified if immediate in increment index indexes indicator initial initrans insert interface intersect into is key level library like limited local lock log logging long loop master maxextents maxtrans member minextents minus mislabel mode modify multiset new next no noaudit nocompress nologging noparallel not nowait number_base object of off offline on online only open option or order out package parallel partition pctfree pctincrease pctused pls_integer positive positiven pragma primary prior private privileges procedure public raise range raw read rebuild record ref references refresh release rename replace resource restrict return returning returns reverse revoke rollback row rowid rowlabel rownum rows run savepoint schema segment select separate session set share snapshot some space split sql start statement storage subtype successful synonym tabauth table tables tablespace task terminate then to trigger truncate type union unique unlimited unrecoverable unusable update use using validate value values variable view views when whenever where while with work"),builtin:set("abs acos add_months ascii asin atan atan2 average bfile bfilename bigserial bit blob ceil character chartorowid chr clob concat convert cos cosh count dec decode deref dual dump dup_val_on_index empty error exp false float floor found glb greatest hextoraw initcap instr instrb int integer isopen last_day least length lengthb ln lower lpad ltrim lub make_ref max min mlslabel mod months_between natural naturaln nchar nclob new_time next_day nextval nls_charset_decl_len nls_charset_id nls_charset_name nls_initcap nls_lower nls_sort nls_upper nlssort no_data_found notfound null number numeric nvarchar2 nvl others power rawtohex real reftohex round rowcount rowidtochar rowtype rpad rtrim serial sign signtype sin sinh smallint soundex sqlcode sqlerrm sqrt stddev string substr substrb sum sysdate tan tanh to_char text to_date to_label to_multi_byte to_number to_single_byte translate true trunc uid unlogged upper user userenv varchar varchar2 variance varying vsize xml"),operatorChars:/^[*+\-%<>!=~]/,dateSQL:set("date time timestamp"),support:set("doubleQuote nCharCast zerolessFloat binaryNumber hexNumber")}); CodeMirror.defineMIME("text/x-hive",{name:"sql",keywords:set("select alter $elem$ $key$ $value$ add after all analyze and archive as asc before between binary both bucket buckets by cascade case cast change cluster clustered clusterstatus collection column columns comment compute concatenate continue create cross cursor data database databases dbproperties deferred delete delimited desc describe directory disable distinct distribute drop else enable end escaped exclusive exists explain export extended external false fetch fields fileformat first format formatted from full function functions grant group having hold_ddltime idxproperties if import in index indexes inpath inputdriver inputformat insert intersect into is items join keys lateral left like limit lines load local location lock locks mapjoin materialized minus msck no_drop nocompress not of offline on option or order out outer outputdriver outputformat overwrite partition partitioned partitions percent plus preserve procedure purge range rcfile read readonly reads rebuild recordreader recordwriter recover reduce regexp rename repair replace restrict revoke right rlike row schema schemas semi sequencefile serde serdeproperties set shared show show_database sort sorted ssl statistics stored streamtable table tables tablesample tblproperties temporary terminated textfile then tmp to touch transform trigger true unarchive undo union uniquejoin unlock update use using utc utc_tmestamp view when where while with"),builtin:set("bool boolean long timestamp tinyint smallint bigint int float double date datetime unsigned string array struct map uniontype"),atoms:set("false true null unknown"),operatorChars:/^[*+\-%<>!=]/,dateSQL:set("date timestamp"),support:set("ODBCdotTable doubleQuote binaryNumber hexNumber")});CodeMirror.defineMIME("text/x-pgsql",{name:"sql",client:set("source"), keywords:set(sqlKeywords+"a abort abs absent absolute access according action ada add admin after aggregate all allocate also always analyse analyze any are array array_agg array_max_cardinality asensitive assertion assignment asymmetric at atomic attribute attributes authorization avg backward base64 before begin begin_frame begin_partition bernoulli binary bit_length blob blocked bom both breadth c cache call called cardinality cascade cascaded case cast catalog catalog_name ceil ceiling chain characteristics characters character_length character_set_catalog character_set_name character_set_schema char_length check checkpoint class class_origin clob close cluster coalesce cobol collate collation collation_catalog collation_name collation_schema collect column columns column_name command_function command_function_code comment comments commit committed concurrently condition condition_number configuration conflict connect connection connection_name constraint constraints constraint_catalog constraint_name constraint_schema constructor contains content continue control conversion convert copy corr corresponding cost covar_pop covar_samp cross csv cube cume_dist current current_catalog current_date current_default_transform_group current_path current_role current_row current_schema current_time current_timestamp current_transform_group_for_type current_user cursor cursor_name cycle data database datalink datetime_interval_code datetime_interval_precision day db deallocate dec declare default defaults deferrable deferred defined definer degree delimiter delimiters dense_rank depth deref derived describe descriptor deterministic diagnostics dictionary disable discard disconnect dispatch dlnewcopy dlpreviouscopy dlurlcomplete dlurlcompleteonly dlurlcompletewrite dlurlpath dlurlpathonly dlurlpathwrite dlurlscheme dlurlserver dlvalue do document domain dynamic dynamic_function dynamic_function_code each element else empty enable encoding encrypted end end-exec end_frame end_partition enforced enum equals escape event every except exception exclude excluding exclusive exec execute exists exp explain expression extension external extract false family fetch file filter final first first_value flag float floor following for force foreign fortran forward found frame_row free freeze fs full function functions fusion g general generated get global go goto grant granted greatest grouping groups handler header hex hierarchy hold hour id identity if ignore ilike immediate immediately immutable implementation implicit import including increment indent index indexes indicator inherit inherits initially inline inner inout input insensitive instance instantiable instead integrity intersect intersection invoker isnull isolation k key key_member key_type label lag language large last last_value lateral lead leading leakproof least left length level library like_regex link listen ln load local localtime localtimestamp location locator lock locked logged lower m map mapping match matched materialized max maxvalue max_cardinality member merge message_length message_octet_length message_text method min minute minvalue mod mode modifies module month more move multiset mumps name names namespace national natural nchar nclob nesting new next nfc nfd nfkc nfkd nil no none normalize normalized nothing notify notnull nowait nth_value ntile null nullable nullif nulls number object occurrences_regex octets octet_length of off offset oids old only open operator option options ordering ordinality others out outer output over overlaps overlay overriding owned owner p pad parameter parameter_mode parameter_name parameter_ordinal_position parameter_specific_catalog parameter_specific_name parameter_specific_schema parser partial partition pascal passing passthrough password percent percentile_cont percentile_disc percent_rank period permission placing plans pli policy portion position position_regex power precedes preceding prepare prepared preserve primary prior privileges procedural procedure program public quote range rank read reads reassign recheck recovery recursive ref references referencing refresh regr_avgx regr_avgy regr_count regr_intercept regr_r2 regr_slope regr_sxx regr_sxy regr_syy reindex relative release rename repeatable replace replica requiring reset respect restart restore restrict result return returned_cardinality returned_length returned_octet_length returned_sqlstate returning returns revoke right role rollback rollup routine routine_catalog routine_name routine_schema row rows row_count row_number rule savepoint scale schema schema_name scope scope_catalog scope_name scope_schema scroll search second section security selective self sensitive sequence sequences serializable server server_name session session_user setof sets share show similar simple size skip snapshot some source space specific specifictype specific_name sql sqlcode sqlerror sqlexception sqlstate sqlwarning sqrt stable standalone start state statement static statistics stddev_pop stddev_samp stdin stdout storage strict strip structure style subclass_origin submultiset substring substring_regex succeeds sum symmetric sysid system system_time system_user t tables tablesample tablespace table_name temp template temporary then ties timezone_hour timezone_minute to token top_level_count trailing transaction transactions_committed transactions_rolled_back transaction_active transform transforms translate translate_regex translation treat trigger trigger_catalog trigger_name trigger_schema trim trim_array true truncate trusted type types uescape unbounded uncommitted under unencrypted unique unknown unlink unlisten unlogged unnamed unnest until untyped upper uri usage user user_defined_type_catalog user_defined_type_code user_defined_type_name user_defined_type_schema using vacuum valid validate validator value value_of varbinary variadic var_pop var_samp verbose version versioning view views volatile when whenever whitespace width_bucket window within work wrapper write xmlagg xmlattributes xmlbinary xmlcast xmlcomment xmlconcat xmldeclaration xmldocument xmlelement xmlexists xmlforest xmliterate xmlnamespaces xmlparse xmlpi xmlquery xmlroot xmlschema xmlserialize xmltable xmltext xmlvalidate year yes loop repeat"), builtin:set("bigint int8 bigserial serial8 bit varying varbit boolean bool box bytea character char varchar cidr circle date double precision float8 inet integer int int4 interval json jsonb line lseg macaddr money numeric decimal path pg_lsn point polygon real float4 smallint int2 smallserial serial2 serial serial4 text time without zone with timetz timestamp timestamptz tsquery tsvector txid_snapshot uuid xml"),atoms:set("false true null unknown"),operatorChars:/^[*+\-%<>!=&|^\/#@?~]/,dateSQL:set("date time timestamp"),support:set("ODBCdotTable decimallessFloat zerolessFloat binaryNumber hexNumber nCharCast charsetCast")}); CodeMirror.defineMIME("text/x-gql",{name:"sql",keywords:set("ancestor and asc by contains desc descendant distinct from group has in is limit offset on order select superset where"),atoms:set("false true"),builtin:set("blob datetime first key __key__ string integer double boolean null"),operatorChars:/^[*+\-%<>!=]/});}());});


(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../lib/codemirror"),require("../addon/search/searchcursor"),require("../addon/edit/matchbrackets"));else if(typeof define=="function"&&define.amd) 
define(["../lib/codemirror","../addon/search/searchcursor","../addon/edit/matchbrackets"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";var map=CodeMirror.keyMap.sublime={fallthrough:"default"};var cmds=CodeMirror.commands;var Pos=CodeMirror.Pos;var mac=CodeMirror.keyMap["default"]==CodeMirror.keyMap.macDefault;var ctrl=mac?"Cmd-":"Ctrl-";function findPosSubword(doc,start,dir){if(dir<0&&start.ch==0)return doc.clipPos(Pos(start.line-1));var line=doc.getLine(start.line);if(dir>0&&start.ch>=line.length)return doc.clipPos(Pos(start.line+1,0));var state="start",type;for(var pos=start.ch,e=dir<0?0:line.length,i=0;pos!=e;pos+=dir,i++){var next=line.charAt(dir<0?pos-1:pos);var cat=next!="_"&&CodeMirror.isWordChar(next)?"w":"o";if(cat=="w"&&next.toUpperCase()==next)cat="W";if(state=="start"){if(cat!="o"){state="in";type=cat;}}else if(state=="in"){if(type!=cat){if(type=="w"&&cat=="W"&&dir<0)pos--;if(type=="W"&&cat=="w"&&dir>0){type="w";continue;}
break;}}}
return Pos(start.line,pos);}
function moveSubword(cm,dir){cm.extendSelectionsBy(function(range){if(cm.display.shift||cm.doc.extend||range.empty())
return findPosSubword(cm.doc,range.head,dir);else
return dir<0?range.from():range.to();});}
var goSubwordCombo=mac?"Ctrl-":"Alt-";cmds[map[goSubwordCombo+"Left"]="goSubwordLeft"]=function(cm){moveSubword(cm,-1);};cmds[map[goSubwordCombo+"Right"]="goSubwordRight"]=function(cm){moveSubword(cm,1);};if(mac)map["Cmd-Left"]="goLineStartSmart";var scrollLineCombo=mac?"Ctrl-Alt-":"Ctrl-";cmds[map[scrollLineCombo+"Up"]="scrollLineUp"]=function(cm){var info=cm.getScrollInfo();if(!cm.somethingSelected()){var visibleBottomLine=cm.lineAtHeight(info.top+info.clientHeight,"local");if(cm.getCursor().line>=visibleBottomLine)
cm.execCommand("goLineUp");}
cm.scrollTo(null,info.top-cm.defaultTextHeight());};cmds[map[scrollLineCombo+"Down"]="scrollLineDown"]=function(cm){var info=cm.getScrollInfo();if(!cm.somethingSelected()){var visibleTopLine=cm.lineAtHeight(info.top,"local")+1;if(cm.getCursor().line<=visibleTopLine)
cm.execCommand("goLineDown");}
cm.scrollTo(null,info.top+cm.defaultTextHeight());};cmds[map["Shift-"+ctrl+"L"]="splitSelectionByLine"]=function(cm){var ranges=cm.listSelections(),lineRanges=[];for(var i=0;i<ranges.length;i++){var from=ranges[i].from(),to=ranges[i].to();for(var line=from.line;line<=to.line;++line)
if(!(to.line>from.line&&line==to.line&&to.ch==0))
lineRanges.push({anchor:line==from.line?from:Pos(line,0),head:line==to.line?to:Pos(line)});}
cm.setSelections(lineRanges,0);};map["Shift-Tab"]="indentLess";cmds[map["Esc"]="singleSelectionTop"]=function(cm){var range=cm.listSelections()[0];cm.setSelection(range.anchor,range.head,{scroll:false});};cmds[map[ctrl+"L"]="selectLine"]=function(cm){var ranges=cm.listSelections(),extended=[];for(var i=0;i<ranges.length;i++){var range=ranges[i];extended.push({anchor:Pos(range.from().line,0),head:Pos(range.to().line+1,0)});}
cm.setSelections(extended);};map["Shift-Ctrl-K"]="deleteLine";function insertLine(cm,above){if(cm.isReadOnly())return CodeMirror.Pass
cm.operation(function(){var len=cm.listSelections().length,newSelection=[],last=-1;for(var i=0;i<len;i++){var head=cm.listSelections()[i].head;if(head.line<=last)continue;var at=Pos(head.line+(above?0:1),0);cm.replaceRange("\n",at,null,"+insertLine");cm.indentLine(at.line,null,true);newSelection.push({head:at,anchor:at});last=head.line+1;}
cm.setSelections(newSelection);});cm.execCommand("indentAuto");}
cmds[map[ctrl+"Enter"]="insertLineAfter"]=function(cm){return insertLine(cm,false);};cmds[map["Shift-"+ctrl+"Enter"]="insertLineBefore"]=function(cm){return insertLine(cm,true);};function wordAt(cm,pos){var start=pos.ch,end=start,line=cm.getLine(pos.line);while(start&&CodeMirror.isWordChar(line.charAt(start-1)))--start;while(end<line.length&&CodeMirror.isWordChar(line.charAt(end)))++end;return{from:Pos(pos.line,start),to:Pos(pos.line,end),word:line.slice(start,end)};}
cmds[map[ctrl+"D"]="selectNextOccurrence"]=function(cm){var from=cm.getCursor("from"),to=cm.getCursor("to");var fullWord=cm.state.sublimeFindFullWord==cm.doc.sel;if(CodeMirror.cmpPos(from,to)==0){var word=wordAt(cm,from);if(!word.word)return;cm.setSelection(word.from,word.to);fullWord=true;}else{var text=cm.getRange(from,to);var query=fullWord?new RegExp("\\b"+text+"\\b"):text;var cur=cm.getSearchCursor(query,to);if(cur.findNext()){cm.addSelection(cur.from(),cur.to());}else{cur=cm.getSearchCursor(query,Pos(cm.firstLine(),0));if(cur.findNext())
cm.addSelection(cur.from(),cur.to());}}
if(fullWord)
cm.state.sublimeFindFullWord=cm.doc.sel;};var mirror="(){}[]";function selectBetweenBrackets(cm){var ranges=cm.listSelections(),newRanges=[]
for(var i=0;i<ranges.length;i++){var range=ranges[i],pos=range.head,opening=cm.scanForBracket(pos,-1);if(!opening)return false;for(;;){var closing=cm.scanForBracket(pos,1);if(!closing)return false;if(closing.ch==mirror.charAt(mirror.indexOf(opening.ch)+1)){newRanges.push({anchor:Pos(opening.pos.line,opening.pos.ch+1),head:closing.pos});break;}
pos=Pos(closing.pos.line,closing.pos.ch+1);}}
cm.setSelections(newRanges);return true;}
cmds[map["Shift-"+ctrl+"Space"]="selectScope"]=function(cm){selectBetweenBrackets(cm)||cm.execCommand("selectAll");};cmds[map["Shift-"+ctrl+"M"]="selectBetweenBrackets"]=function(cm){if(!selectBetweenBrackets(cm))return CodeMirror.Pass;};cmds[map[ctrl+"M"]="goToBracket"]=function(cm){cm.extendSelectionsBy(function(range){var next=cm.scanForBracket(range.head,1);if(next&&CodeMirror.cmpPos(next.pos,range.head)!=0)return next.pos;var prev=cm.scanForBracket(range.head,-1);return prev&&Pos(prev.pos.line,prev.pos.ch+1)||range.head;});};var swapLineCombo=mac?"Cmd-Ctrl-":"Shift-Ctrl-";cmds[map[swapLineCombo+"Up"]="swapLineUp"]=function(cm){if(cm.isReadOnly())return CodeMirror.Pass
var ranges=cm.listSelections(),linesToMove=[],at=cm.firstLine()-1,newSels=[];for(var i=0;i<ranges.length;i++){var range=ranges[i],from=range.from().line-1,to=range.to().line;newSels.push({anchor:Pos(range.anchor.line-1,range.anchor.ch),head:Pos(range.head.line-1,range.head.ch)});if(range.to().ch==0&&!range.empty())--to;if(from>at)linesToMove.push(from,to);else if(linesToMove.length)linesToMove[linesToMove.length-1]=to;at=to;}
cm.operation(function(){for(var i=0;i<linesToMove.length;i+=2){var from=linesToMove[i],to=linesToMove[i+1];var line=cm.getLine(from);cm.replaceRange("",Pos(from,0),Pos(from+1,0),"+swapLine");if(to>cm.lastLine())
cm.replaceRange("\n"+line,Pos(cm.lastLine()),null,"+swapLine");else
cm.replaceRange(line+"\n",Pos(to,0),null,"+swapLine");}
cm.setSelections(newSels);cm.scrollIntoView();});};cmds[map[swapLineCombo+"Down"]="swapLineDown"]=function(cm){if(cm.isReadOnly())return CodeMirror.Pass
var ranges=cm.listSelections(),linesToMove=[],at=cm.lastLine()+1;for(var i=ranges.length-1;i>=0;i--){var range=ranges[i],from=range.to().line+1,to=range.from().line;if(range.to().ch==0&&!range.empty())from--;if(from<at)linesToMove.push(from,to);else if(linesToMove.length)linesToMove[linesToMove.length-1]=to;at=to;}
cm.operation(function(){for(var i=linesToMove.length-2;i>=0;i-=2){var from=linesToMove[i],to=linesToMove[i+1];var line=cm.getLine(from);if(from==cm.lastLine())
cm.replaceRange("",Pos(from-1),Pos(from),"+swapLine");else
cm.replaceRange("",Pos(from,0),Pos(from+1,0),"+swapLine");cm.replaceRange(line+"\n",Pos(to,0),null,"+swapLine");}
cm.scrollIntoView();});};cmds[map[ctrl+"/"]="toggleCommentIndented"]=function(cm){cm.toggleComment({indent:true});}
cmds[map[ctrl+"J"]="joinLines"]=function(cm){var ranges=cm.listSelections(),joined=[];for(var i=0;i<ranges.length;i++){var range=ranges[i],from=range.from();var start=from.line,end=range.to().line;while(i<ranges.length-1&&ranges[i+1].from().line==end)
end=ranges[++i].to().line;joined.push({start:start,end:end,anchor:!range.empty()&&from});}
cm.operation(function(){var offset=0,ranges=[];for(var i=0;i<joined.length;i++){var obj=joined[i];var anchor=obj.anchor&&Pos(obj.anchor.line-offset,obj.anchor.ch),head;for(var line=obj.start;line<=obj.end;line++){var actual=line-offset;if(line==obj.end)head=Pos(actual,cm.getLine(actual).length+1);if(actual<cm.lastLine()){cm.replaceRange(" ",Pos(actual),Pos(actual+1,/^\s*/.exec(cm.getLine(actual+1))[0].length));++offset;}}
ranges.push({anchor:anchor||head,head:head});}
cm.setSelections(ranges,0);});};cmds[map["Shift-"+ctrl+"D"]="duplicateLine"]=function(cm){cm.operation(function(){var rangeCount=cm.listSelections().length;for(var i=0;i<rangeCount;i++){var range=cm.listSelections()[i];if(range.empty())
cm.replaceRange(cm.getLine(range.head.line)+"\n",Pos(range.head.line,0));else
cm.replaceRange(cm.getRange(range.from(),range.to()),range.from());}
cm.scrollIntoView();});};if(!mac)map[ctrl+"T"]="transposeChars";function sortLines(cm,caseSensitive){if(cm.isReadOnly())return CodeMirror.Pass
var ranges=cm.listSelections(),toSort=[],selected;for(var i=0;i<ranges.length;i++){var range=ranges[i];if(range.empty())continue;var from=range.from().line,to=range.to().line;while(i<ranges.length-1&&ranges[i+1].from().line==to)
to=range[++i].to().line;toSort.push(from,to);}
if(toSort.length)selected=true;else toSort.push(cm.firstLine(),cm.lastLine());cm.operation(function(){var ranges=[];for(var i=0;i<toSort.length;i+=2){var from=toSort[i],to=toSort[i+1];var start=Pos(from,0),end=Pos(to);var lines=cm.getRange(start,end,false);if(caseSensitive)
lines.sort();else
lines.sort(function(a,b){var au=a.toUpperCase(),bu=b.toUpperCase();if(au!=bu){a=au;b=bu;}
return a<b?-1:a==b?0:1;});cm.replaceRange(lines,start,end);if(selected)ranges.push({anchor:start,head:end});}
if(selected)cm.setSelections(ranges,0);});}
cmds[map["F9"]="sortLines"]=function(cm){sortLines(cm,true);};cmds[map[ctrl+"F9"]="sortLinesInsensitive"]=function(cm){sortLines(cm,false);};cmds[map["F2"]="nextBookmark"]=function(cm){var marks=cm.state.sublimeBookmarks;if(marks)while(marks.length){var current=marks.shift();var found=current.find();if(found){marks.push(current);return cm.setSelection(found.from,found.to);}}};cmds[map["Shift-F2"]="prevBookmark"]=function(cm){var marks=cm.state.sublimeBookmarks;if(marks)while(marks.length){marks.unshift(marks.pop());var found=marks[marks.length-1].find();if(!found)
marks.pop();else
return cm.setSelection(found.from,found.to);}};cmds[map[ctrl+"F2"]="toggleBookmark"]=function(cm){var ranges=cm.listSelections();var marks=cm.state.sublimeBookmarks||(cm.state.sublimeBookmarks=[]);for(var i=0;i<ranges.length;i++){var from=ranges[i].from(),to=ranges[i].to();var found=cm.findMarks(from,to);for(var j=0;j<found.length;j++){if(found[j].sublimeBookmark){found[j].clear();for(var k=0;k<marks.length;k++)
if(marks[k]==found[j])
marks.splice(k--,1);break;}}
if(j==found.length)
marks.push(cm.markText(from,to,{sublimeBookmark:true,clearWhenEmpty:false}));}};cmds[map["Shift-"+ctrl+"F2"]="clearBookmarks"]=function(cm){var marks=cm.state.sublimeBookmarks;if(marks)for(var i=0;i<marks.length;i++)marks[i].clear();marks.length=0;};cmds[map["Alt-F2"]="selectBookmarks"]=function(cm){var marks=cm.state.sublimeBookmarks,ranges=[];if(marks)for(var i=0;i<marks.length;i++){var found=marks[i].find();if(!found)
marks.splice(i--,0);else
ranges.push({anchor:found.from,head:found.to});}
if(ranges.length)
cm.setSelections(ranges,0);};map["Alt-Q"]="wrapLines";var cK=ctrl+"K ";function modifyWordOrSelection(cm,mod){cm.operation(function(){var ranges=cm.listSelections(),indices=[],replacements=[];for(var i=0;i<ranges.length;i++){var range=ranges[i];if(range.empty()){indices.push(i);replacements.push("");}
else replacements.push(mod(cm.getRange(range.from(),range.to())));}
cm.replaceSelections(replacements,"around","case");for(var i=indices.length-1,at;i>=0;i--){var range=ranges[indices[i]];if(at&&CodeMirror.cmpPos(range.head,at)>0)continue;var word=wordAt(cm,range.head);at=word.from;cm.replaceRange(mod(word.word),word.from,word.to);}});}
map[cK+ctrl+"Backspace"]="delLineLeft";cmds[map["Backspace"]="smartBackspace"]=function(cm){if(cm.somethingSelected())return CodeMirror.Pass;cm.operation(function(){var cursors=cm.listSelections();var indentUnit=cm.getOption("indentUnit");for(var i=cursors.length-1;i>=0;i--){var cursor=cursors[i].head;var toStartOfLine=cm.getRange({line:cursor.line,ch:0},cursor);var column=CodeMirror.countColumn(toStartOfLine,null,cm.getOption("tabSize")); var deletePos=cm.findPosH(cursor,-1,"char",false);if(toStartOfLine&&!/\S/.test(toStartOfLine)&&column%indentUnit==0){var prevIndent=new Pos(cursor.line,CodeMirror.findColumn(toStartOfLine,column-indentUnit,indentUnit)); if(prevIndent.ch!=cursor.ch)deletePos=prevIndent;}
cm.replaceRange("",deletePos,cursor,"+delete");}});};cmds[map[cK+ctrl+"K"]="delLineRight"]=function(cm){cm.operation(function(){var ranges=cm.listSelections();for(var i=ranges.length-1;i>=0;i--)
cm.replaceRange("",ranges[i].anchor,Pos(ranges[i].to().line),"+delete");cm.scrollIntoView();});};cmds[map[cK+ctrl+"U"]="upcaseAtCursor"]=function(cm){modifyWordOrSelection(cm,function(str){return str.toUpperCase();});};cmds[map[cK+ctrl+"L"]="downcaseAtCursor"]=function(cm){modifyWordOrSelection(cm,function(str){return str.toLowerCase();});};cmds[map[cK+ctrl+"Space"]="setSublimeMark"]=function(cm){if(cm.state.sublimeMark)cm.state.sublimeMark.clear();cm.state.sublimeMark=cm.setBookmark(cm.getCursor());};cmds[map[cK+ctrl+"A"]="selectToSublimeMark"]=function(cm){var found=cm.state.sublimeMark&&cm.state.sublimeMark.find();if(found)cm.setSelection(cm.getCursor(),found);};cmds[map[cK+ctrl+"W"]="deleteToSublimeMark"]=function(cm){var found=cm.state.sublimeMark&&cm.state.sublimeMark.find();if(found){var from=cm.getCursor(),to=found;if(CodeMirror.cmpPos(from,to)>0){var tmp=to;to=from;from=tmp;}
cm.state.sublimeKilled=cm.getRange(from,to);cm.replaceRange("",from,to);}};cmds[map[cK+ctrl+"X"]="swapWithSublimeMark"]=function(cm){var found=cm.state.sublimeMark&&cm.state.sublimeMark.find();if(found){cm.state.sublimeMark.clear();cm.state.sublimeMark=cm.setBookmark(cm.getCursor());cm.setCursor(found);}};cmds[map[cK+ctrl+"Y"]="sublimeYank"]=function(cm){if(cm.state.sublimeKilled!=null)
cm.replaceSelection(cm.state.sublimeKilled,null,"paste");};map[cK+ctrl+"G"]="clearBookmarks";cmds[map[cK+ctrl+"C"]="showInCenter"]=function(cm){var pos=cm.cursorCoords(null,"local");cm.scrollTo(null,(pos.top+pos.bottom)/2-cm.getScrollInfo().clientHeight/2);};var selectLinesCombo=mac?"Ctrl-Shift-":"Ctrl-Alt-";cmds[map[selectLinesCombo+"Up"]="selectLinesUpward"]=function(cm){cm.operation(function(){var ranges=cm.listSelections();for(var i=0;i<ranges.length;i++){var range=ranges[i];if(range.head.line>cm.firstLine())
cm.addSelection(Pos(range.head.line-1,range.head.ch));}});};cmds[map[selectLinesCombo+"Down"]="selectLinesDownward"]=function(cm){cm.operation(function(){var ranges=cm.listSelections();for(var i=0;i<ranges.length;i++){var range=ranges[i];if(range.head.line<cm.lastLine())
cm.addSelection(Pos(range.head.line+1,range.head.ch));}});};function getTarget(cm){var from=cm.getCursor("from"),to=cm.getCursor("to");if(CodeMirror.cmpPos(from,to)==0){var word=wordAt(cm,from);if(!word.word)return;from=word.from;to=word.to;}
return{from:from,to:to,query:cm.getRange(from,to),word:word};}
function findAndGoTo(cm,forward){var target=getTarget(cm);if(!target)return;var query=target.query;var cur=cm.getSearchCursor(query,forward?target.to:target.from);if(forward?cur.findNext():cur.findPrevious()){cm.setSelection(cur.from(),cur.to());}else{cur=cm.getSearchCursor(query,forward?Pos(cm.firstLine(),0):cm.clipPos(Pos(cm.lastLine())));if(forward?cur.findNext():cur.findPrevious())
cm.setSelection(cur.from(),cur.to());else if(target.word)
cm.setSelection(target.from,target.to);}};cmds[map[ctrl+"F3"]="findUnder"]=function(cm){findAndGoTo(cm,true);};cmds[map["Shift-"+ctrl+"F3"]="findUnderPrevious"]=function(cm){findAndGoTo(cm,false);};cmds[map["Alt-F3"]="findAllUnder"]=function(cm){var target=getTarget(cm);if(!target)return;var cur=cm.getSearchCursor(target.query);var matches=[];var primaryIndex=-1;while(cur.findNext()){matches.push({anchor:cur.from(),head:cur.to()});if(cur.from().line<=target.from.line&&cur.from().ch<=target.from.ch)
primaryIndex++;}
cm.setSelections(matches,primaryIndex);};map["Shift-"+ctrl+"["]="fold";map["Shift-"+ctrl+"]"]="unfold";map[cK+ctrl+"0"]=map[cK+ctrl+"J"]="unfoldAll";map[ctrl+"I"]="findIncremental";map["Shift-"+ctrl+"I"]="findIncrementalReverse";map[ctrl+"H"]="replace";map["F3"]="findNext";map["Shift-F3"]="findPrev";CodeMirror.normalizeKeyMap(map);});
(function(mod){if(typeof exports=="object"&&typeof module=="object") 
mod(require("../../lib/codemirror"));else if(typeof define=="function"&&define.amd) 
define(["../../lib/codemirror"],mod);else
 mod(CodeMirror);})(function(CodeMirror){"use strict";var htmlConfig={autoSelfClosers:{'area':true,'base':true,'br':true,'col':true,'command':true,'embed':true,'frame':true,'hr':true,'img':true,'input':true,'keygen':true,'link':true,'meta':true,'param':true,'source':true,'track':true,'wbr':true,'menuitem':true},implicitlyClosed:{'dd':true,'li':true,'optgroup':true,'option':true,'p':true,'rp':true,'rt':true,'tbody':true,'td':true,'tfoot':true,'th':true,'tr':true},contextGrabbers:{'dd':{'dd':true,'dt':true},'dt':{'dd':true,'dt':true},'li':{'li':true},'option':{'option':true,'optgroup':true},'optgroup':{'optgroup':true},'p':{'address':true,'article':true,'aside':true,'blockquote':true,'dir':true,'div':true,'dl':true,'fieldset':true,'footer':true,'form':true,'h1':true,'h2':true,'h3':true,'h4':true,'h5':true,'h6':true,'header':true,'hgroup':true,'hr':true,'menu':true,'nav':true,'ol':true,'p':true,'pre':true,'section':true,'table':true,'ul':true},'rp':{'rp':true,'rt':true},'rt':{'rp':true,'rt':true},'tbody':{'tbody':true,'tfoot':true},'td':{'td':true,'th':true},'tfoot':{'tbody':true},'th':{'td':true,'th':true},'thead':{'tbody':true,'tfoot':true},'tr':{'tr':true}},doNotIndent:{"pre":true},allowUnquoted:true,allowMissing:true,caseFold:true}
var xmlConfig={autoSelfClosers:{},implicitlyClosed:{},contextGrabbers:{},doNotIndent:{},allowUnquoted:false,allowMissing:false,caseFold:false}
CodeMirror.defineMode("xml",function(editorConf,config_){var indentUnit=editorConf.indentUnit
var config={}
var defaults=config_.htmlMode?htmlConfig:xmlConfig
for(var prop in defaults)config[prop]=defaults[prop]
for(var prop in config_)config[prop]=config_[prop] 
var type,setStyle;function inText(stream,state){function chain(parser){state.tokenize=parser;return parser(stream,state);}
var ch=stream.next();if(ch=="<"){if(stream.eat("!")){if(stream.eat("[")){if(stream.match("CDATA["))return chain(inBlock("atom","]]>"));else return null;}else if(stream.match("--")){return chain(inBlock("comment","-->"));}else if(stream.match("DOCTYPE",true,true)){stream.eatWhile(/[\w\._\-]/);return chain(doctype(1));}else{return null;}}else if(stream.eat("?")){stream.eatWhile(/[\w\._\-]/);state.tokenize=inBlock("meta","?>");return"meta";}else{type=stream.eat("/")?"closeTag":"openTag";state.tokenize=inTag;return"tag bracket";}}else if(ch=="&"){var ok;if(stream.eat("#")){if(stream.eat("x")){ok=stream.eatWhile(/[a-fA-F\d]/)&&stream.eat(";");}else{ok=stream.eatWhile(/[\d]/)&&stream.eat(";");}}else{ok=stream.eatWhile(/[\w\.\-:]/)&&stream.eat(";");}
return ok?"atom":"error";}else{stream.eatWhile(/[^&<]/);return null;}}
inText.isInText=true;function inTag(stream,state){var ch=stream.next();if(ch==">"||(ch=="/"&&stream.eat(">"))){state.tokenize=inText;type=ch==">"?"endTag":"selfcloseTag";return"tag bracket";}else if(ch=="="){type="equals";return null;}else if(ch=="<"){state.tokenize=inText;state.state=baseState;state.tagName=state.tagStart=null;var next=state.tokenize(stream,state);return next?next+" tag error":"tag error";}else if(/[\'\"]/.test(ch)){state.tokenize=inAttribute(ch);state.stringStartCol=stream.column();return state.tokenize(stream,state);}else{stream.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/);return"word";}}
function inAttribute(quote){var closure=function(stream,state){while(!stream.eol()){if(stream.next()==quote){state.tokenize=inTag;break;}}
return"string";};closure.isInAttribute=true;return closure;}
function inBlock(style,terminator){return function(stream,state){while(!stream.eol()){if(stream.match(terminator)){state.tokenize=inText;break;}
stream.next();}
return style;};}
function doctype(depth){return function(stream,state){var ch;while((ch=stream.next())!=null){if(ch=="<"){state.tokenize=doctype(depth+1);return state.tokenize(stream,state);}else if(ch==">"){if(depth==1){state.tokenize=inText;break;}else{state.tokenize=doctype(depth-1);return state.tokenize(stream,state);}}}
return"meta";};}
function Context(state,tagName,startOfLine){this.prev=state.context;this.tagName=tagName;this.indent=state.indented;this.startOfLine=startOfLine;if(config.doNotIndent.hasOwnProperty(tagName)||(state.context&&state.context.noIndent))
this.noIndent=true;}
function popContext(state){if(state.context)state.context=state.context.prev;}
function maybePopContext(state,nextTagName){var parentTagName;while(true){if(!state.context){return;}
parentTagName=state.context.tagName;if(!config.contextGrabbers.hasOwnProperty(parentTagName)||!config.contextGrabbers[parentTagName].hasOwnProperty(nextTagName)){return;}
popContext(state);}}
function baseState(type,stream,state){if(type=="openTag"){state.tagStart=stream.column();return tagNameState;}else if(type=="closeTag"){return closeTagNameState;}else{return baseState;}}
function tagNameState(type,stream,state){if(type=="word"){state.tagName=stream.current();setStyle="tag";return attrState;}else{setStyle="error";return tagNameState;}}
function closeTagNameState(type,stream,state){if(type=="word"){var tagName=stream.current();if(state.context&&state.context.tagName!=tagName&&config.implicitlyClosed.hasOwnProperty(state.context.tagName))
popContext(state);if((state.context&&state.context.tagName==tagName)||config.matchClosing===false){setStyle="tag";return closeState;}else{setStyle="tag error";return closeStateErr;}}else{setStyle="error";return closeStateErr;}}
function closeState(type,_stream,state){if(type!="endTag"){setStyle="error";return closeState;}
popContext(state);return baseState;}
function closeStateErr(type,stream,state){setStyle="error";return closeState(type,stream,state);}
function attrState(type,_stream,state){if(type=="word"){setStyle="attribute";return attrEqState;}else if(type=="endTag"||type=="selfcloseTag"){var tagName=state.tagName,tagStart=state.tagStart;state.tagName=state.tagStart=null;if(type=="selfcloseTag"||config.autoSelfClosers.hasOwnProperty(tagName)){maybePopContext(state,tagName);}else{maybePopContext(state,tagName);state.context=new Context(state,tagName,tagStart==state.indented);}
return baseState;}
setStyle="error";return attrState;}
function attrEqState(type,stream,state){if(type=="equals")return attrValueState;if(!config.allowMissing)setStyle="error";return attrState(type,stream,state);}
function attrValueState(type,stream,state){if(type=="string")return attrContinuedState;if(type=="word"&&config.allowUnquoted){setStyle="string";return attrState;}
setStyle="error";return attrState(type,stream,state);}
function attrContinuedState(type,stream,state){if(type=="string")return attrContinuedState;return attrState(type,stream,state);}
return{startState:function(baseIndent){var state={tokenize:inText,state:baseState,indented:baseIndent||0,tagName:null,tagStart:null,context:null}
if(baseIndent!=null)state.baseIndent=baseIndent
return state},token:function(stream,state){if(!state.tagName&&stream.sol())
state.indented=stream.indentation();if(stream.eatSpace())return null;type=null;var style=state.tokenize(stream,state);if((style||type)&&style!="comment"){setStyle=null;state.state=state.state(type||style,stream,state);if(setStyle)
style=setStyle=="error"?style+" error":setStyle;}
return style;},indent:function(state,textAfter,fullLine){var context=state.context;if(state.tokenize.isInAttribute){if(state.tagStart==state.indented)
return state.stringStartCol+1;else
return state.indented+indentUnit;}
if(context&&context.noIndent)return CodeMirror.Pass;if(state.tokenize!=inTag&&state.tokenize!=inText)
return fullLine?fullLine.match(/^(\s*)/)[0].length:0;if(state.tagName){if(config.multilineTagIndentPastTag!==false)
return state.tagStart+state.tagName.length+2;else
return state.tagStart+indentUnit*(config.multilineTagIndentFactor||1);}
if(config.alignCDATA&&/<!\[CDATA\[/.test(textAfter))return 0;var tagAfter=textAfter&&/^<(\/)?([\w_:\.-]*)/.exec(textAfter);if(tagAfter&&tagAfter[1]){ while(context){if(context.tagName==tagAfter[2]){context=context.prev;break;}else if(config.implicitlyClosed.hasOwnProperty(context.tagName)){context=context.prev;}else{break;}}}else if(tagAfter){ while(context){var grabbers=config.contextGrabbers[context.tagName];if(grabbers&&grabbers.hasOwnProperty(tagAfter[2]))
context=context.prev;else
break;}}
while(context&&context.prev&&!context.startOfLine)
context=context.prev;if(context)return context.indent+indentUnit;else return state.baseIndent||0;},electricInput:/<\/[\s\w:]+>$/,blockCommentStart:"<!--",blockCommentEnd:"-->",configuration:config.htmlMode?"html":"xml",helperType:config.htmlMode?"html":"xml",skipAttribute:function(state){if(state.state==attrValueState)
state.state=attrState}};});CodeMirror.defineMIME("text/xml","xml");CodeMirror.defineMIME("application/xml","xml");if(!CodeMirror.mimeModes.hasOwnProperty("text/html"))
CodeMirror.defineMIME("text/html",{name:"xml",htmlMode:true});});
