import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';
import { pathToFileURL } from 'node:url';

const workspaceDir='/home/keshav/spendsmart', buildDir=path.join(workspaceDir,'.pptx-build'), stageDir=path.join(workspaceDir,'.pptx-stage'), outDir=path.join(workspaceDir,'deliverables');
const finalPath=path.join(outDir,'SpendSmart_Class_Project_Presentation.pptx');
const skillDir='/home/keshav/.codex/plugins/cache/openai-primary-runtime/presentations/26.1025.11240/skills/presentations';
const W=1280,H=720,FONT='Adwaita Sans';
const C={paper:'#F7F6F2',ink:'#172033',muted:'#596579',violet:'#6D4AFF',lavender:'#E9E4FF',green:'#2F806B',paleGreen:'#DCEFE8',coral:'#CF674F',paleCoral:'#F7E2DB',line:'#D9DCE3',white:'#FFFFFF',dark:'#171B2C'};
const pres=Presentation.create({slideSize:{width:W,height:H}});
function sh(slide,g,x,y,w,h,fill='none',stroke='none',sw=0,name=''){return slide.shapes.add({geometry:g,name,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width:sw}})}
function tx(slide,text,x,y,w,h,size=22,color=C.ink,o={}){const s=sh(slide,'textbox',x,y,w,h);s.text=text;s.text.insets=0;s.text.style={fontFamily:FONT,fontSize:size,color,bold:!!o.bold,alignment:o.align||'left',verticalAlignment:'middle',wrap:true};return s}
function ln(slide,x1,y1,x2,y2,color=C.line,width=1.5){sh(slide,'line',x1,y1,x2-x1,y2-y1,'none',color,width)}
function dot(slide,x,y,d,fill){sh(slide,'ellipse',x,y,d,d,fill)}
function foot(slide,n,dark=false){const col=dark?'#A9AEC0':C.muted;tx(slide,'SPENDSMART  /  CLASS PROJECT',72,674,460,20,12,col,{bold:true});tx(slide,String(n).padStart(2,'0'),1170,674,38,20,12,col,{bold:true,align:'right'})}
function head(slide,k,title,sub,n,dark=false){tx(slide,k.toUpperCase(),72,48,850,24,14,dark?'#B8A9FF':C.violet,{bold:true});tx(slide,title,72,88,1120,66,46,dark?C.white:C.ink,{bold:true});if(sub)tx(slide,sub,72,158,1080,46,21,dark?'#B9BED0':C.muted);foot(slide,n,dark)}
function notes(slide,t){slide.speakerNotes.text=t}

// 1 Cover
{
const s=pres.slides.add();s.background.fill=C.dark;sh(s,'rect',0,0,16,H,C.violet);
tx(s,'PERSONAL FINANCE TRACKER',82,92,470,28,15,'#BDB3FF',{bold:true});tx(s,'SpendSmart',78,183,710,100,76,C.white,{bold:true});sh(s,'rect',84,304,92,6,C.violet);
tx(s,'Track spending. Set limits. See patterns.',82,342,640,70,28,'#D2D5E0');tx(s,'A full-stack college project',82,440,520,36,20,'#A9AEC0');
[['RECORD',C.violet],['ORGANIZE',C.green],['UNDERSTAND','#D18268']].forEach(([t,c],i)=>{const x=812+i*130;dot(s,x,256,64,c);tx(s,String(i+1),x,256,64,64,22,C.white,{bold:true,align:'center'});tx(s,t,x-24,342,112,22,12,'#C6C9D4',{bold:true,align:'center'});if(i<2)ln(s,x+68,288,x+124,288,'#5D6174',2)});
tx(s,'React  ·  Express  ·  MongoDB',812,420,368,28,16,'#A9AEC0',{align:'center'});foot(s,1,true);notes(s,'Introduce SpendSmart as a personal finance tracker built as a full-stack college project. The presentation follows the user workflow, then explains the implementation and a short demo path.')}
// 2 Goal
{
const s=pres.slides.add();s.background.fill=C.paper;head(s,'Project goal','Make monthly spending easier to understand','The project connects everyday transaction records with category limits and monthly summaries.',2);
tx(s,'THE CHALLENGE',72,274,280,24,14,C.coral,{bold:true});tx(s,'Income and expenses can be hard to review when records are scattered.',72,312,440,120,30,C.ink,{bold:true});ln(s,614,282,614,568,C.line,2);tx(s,'THE APPROACH',676,274,320,24,14,C.violet,{bold:true});
[['01','Capture','Record income and expenses with date and category.'],['02','Set limits','Give each category a monthly budget.'],['03','Review','Use charts and reports to spot spending patterns.']].forEach((a,i)=>{const y=316+i*92;dot(s,676,y,36,i===1?C.green:C.violet);tx(s,a[0],676,y,36,36,12,C.white,{bold:true,align:'center'});tx(s,a[1],730,y-2,170,30,22,C.ink,{bold:true});tx(s,a[2],730,y+31,470,46,17,C.muted)});notes(s,'The central goal is to turn individual records into a monthly view. Emphasize the simple loop: record, set a limit, then review.')}
// 3 Pages
{
const s=pres.slides.add();s.background.fill=C.paper;head(s,'Product tour','Five areas, one money workflow','Each page supports a clear task in the monthly finance routine.',3);
[['01','Overview','Monthly income, expenses, net cash flow, budget progress and trends.'],['02','Transactions','Add, edit, search and filter income or expense records.'],['03','Budgets','Set a monthly spending limit for each category.'],['04','Categories','Create custom labels for income and expenses.'],['05','Reports','Compare months, review categories and follow a six-month trend.']].forEach((it,i)=>{const y=250+i*78;tx(s,it[0],78,y,58,32,14,C.violet,{bold:true});tx(s,it[1],152,y-4,236,36,24,C.ink,{bold:true});tx(s,it[2],392,y-2,740,42,18,C.muted);ln(s,152,y+52,1156,y+52,'#E3E4E8',1)});notes(s,'Walk through the five current application pages. Transaction, budget and category data feed the Overview and Reports pages.')}
// 4 Budgets
{
const s=pres.slides.add();s.background.fill=C.dark;head(s,'Core feature','Budgets are set by category and month','A limit is meaningful only when it is compared with matching expense records.',4,true);
[['01','Choose a month','Select the month the limit applies to.'],['02','Set category limits','Create or update a limit for each category.'],['03','Track progress','The app compares recorded expenses with that limit.']].forEach((a,i)=>{const x=78+i*390;tx(s,a[0],x,278,70,48,34,i===1?'#9F8BFF':'#75C6AD',{bold:true});tx(s,a[1],x,340,340,42,24,C.white,{bold:true});tx(s,a[2],x,394,320,76,18,'#B9BED0');if(i<2)ln(s,x+300,300,x+365,300,'#5A6075',2)});
sh(s,'rect',78,522,1124,1,'#464B60');tx(s,'Budget status appears in the Budgets page and the monthly Overview.',78,552,1040,36,18,'#D3D6E0');notes(s,'Describe the budget feature without using sample amounts. Each budget is stored with a category and YYYY-MM month, and the UI reflects progress or over-budget status.')}
// 5 Architecture
{
const s=pres.slides.add();s.background.fill=C.paper;head(s,'System design','A small, clear full-stack architecture','The browser calls a JSON API; Express validates requests and Mongoose persists records.',5);
const xs=[72,478,884],y=280,w=300,h=212,blocks=[{title:'Frontend',stack:'React 19 · Vite\nReact Router · Tailwind CSS 4\nRecharts · Lucide · Axios',fill:C.lavender,accent:C.violet},{title:'API server',stack:'Node.js · Express 4\nREST routes · request validation\nmonthly report aggregation',fill:C.paleGreen,accent:C.green},{title:'Database',stack:'MongoDB · Mongoose\nTransactions · budgets\ncategories',fill:C.paleCoral,accent:C.coral}];
blocks.forEach((b,i)=>{sh(s,'rect',xs[i],y,w,h,b.fill);sh(s,'rect',xs[i],y,8,h,b.accent);tx(s,b.title,xs[i]+28,y+25,w-50,38,26,C.ink,{bold:true});ln(s,xs[i]+28,y+77,xs[i]+w-24,y+77,'#C9CDD5',1);tx(s,b.stack,xs[i]+28,y+98,w-46,92,18,C.muted)});
tx(s,'HTTP + JSON',386,346,92,24,13,C.violet,{bold:true,align:'center'});tx(s,'HTTP + JSON',792,346,92,24,13,C.green,{bold:true,align:'center'});ln(s,374,384,460,384,C.violet,2);ln(s,780,384,866,384,C.green,2);tx(s,'GET /api/health checks API and database status',72,555,850,26,17,C.muted);notes(s,'Explain the path from UI to database. The frontend uses an Axios service layer; Express routes handle resources and monthly reports; Mongoose models define persisted records. The health route reports API and database connectivity.')}
// 6 Data model
{
const s=pres.slides.add();s.background.fill=C.paper;head(s,'Backend model','Three records power the app','Resource routes keep the main operations explicit and easy to explain.',6);
[{x:72,name:'Transaction',color:C.violet,fields:'title · amount · type\ncategory · date · description'},{x:466,name:'Budget',color:C.green,fields:'category · month\namount'},{x:860,name:'Category',color:C.coral,fields:'name · type · normalized key'}].forEach(c=>{tx(s,c.name.toUpperCase(),c.x,260,330,26,14,c.color,{bold:true});tx(s,c.fields,c.x,304,330,86,23,C.ink,{bold:true})});
[['TRANSACTION API','GET · POST · PUT · DELETE',72],['BUDGET API','Month filter + CRUD',466],['CATEGORY API','Custom category CRUD',860]].forEach(a=>{tx(s,a[0],a[2],456,290,22,13,C.muted,{bold:true});tx(s,a[1],a[2],488,330,28,18,C.ink,{bold:true})});
sh(s,'rect',72,556,1128,1,C.line);tx(s,'Guardrails',72,578,130,28,16,C.violet,{bold:true});tx(s,'Duplicate category/month budgets are rejected; categories in use cannot be deleted.',220,574,930,42,17,C.muted);notes(s,'Summarize the three Mongoose models. Budget uniqueness is enforced for category plus month. The backend also validates incoming fields and prevents deleting categories that are still referenced.')}
// 7 Reporting
{
const s=pres.slides.add();s.background.fill=C.paper;head(s,'Reporting','Reports summarize a selected month','The API returns monthly totals, a previous-month comparison, category totals and a six-month expense trend.',7);
tx(s,'MONTHLY REPORT FLOW',72,278,400,24,14,C.violet,{bold:true});const flow=[['Request','month=YYYY-MM'],['Aggregate','MongoDB pipelines'],['Response','totals · categories\ncomparison · trend']];
flow.forEach((f,i)=>{const x=72+i*392;tx(s,f[0],x,346,300,34,24,C.ink,{bold:true});tx(s,f[1],x,394,300,56,18,C.muted);if(i<2){ln(s,x+300,368,x+365,368,i===0?C.violet:C.green,2);tx(s,'›',x+323,349,28,40,28,i===0?C.violet:C.green,{bold:true,align:'center'})}});
ln(s,72,478,1205,478,C.line,1.5);tx(s,'GET  /api/reports/monthly?month=YYYY-MM',72,510,810,36,22,C.ink,{bold:true});tx(s,'Invalid month formats return a validation error.',72,558,700,30,17,C.muted);notes(s,'The report endpoint computes monthly totals and comparison data server-side. It also produces category summaries and a six-month expense series used by the Reports page.')}
// 8 Demo / scope
{
const s=pres.slides.add();s.background.fill=C.dark;head(s,'Class demo','A short walkthrough','Show the complete path from setup to insight.',8,true);
[['1','Add a category','Create a custom expense label.'],['2','Record a transaction','Save a dated income or expense.'],['3','Set a budget','Choose the same category and month.'],['4','Review the result','Show Overview progress and the Reports page.']].forEach((d,i)=>{const y=256+i*77;dot(s,78,y,40,i===3?C.green:C.violet);tx(s,d[0],78,y,40,40,16,C.white,{bold:true,align:'center'});tx(s,d[1],144,y-1,300,32,21,C.white,{bold:true});tx(s,d[2],456,y,600,32,17,'#B9BED0')});
ln(s,78,582,1200,582,'#51566B',1);tx(s,'Current scope',78,602,166,24,14,'#B8A9FF',{bold:true});tx(s,'One shared workspace; login and per-user data separation are not implemented.',258,596,900,36,17,'#D2D5E0');notes(s,'For the live demo, use a test database and a few sample records. Finish by stating the current scope accurately: the app is a single shared workspace and does not yet provide login or per-user data separation.')}

await fs.mkdir(buildDir,{recursive:true});await fs.mkdir(stageDir,{recursive:true});await fs.mkdir(outDir,{recursive:true});
await (await PresentationFile.exportPptx(pres)).save(path.join(buildDir,'draft.pptx'));
const {finalizePresentation}=await import(pathToFileURL(path.join(skillDir,'container_tools/artifact_tool_utils.mjs')).href);
await finalizePresentation({workspaceDir,candidatePath:path.join(buildDir,'draft.pptx'),finalPath,pythonExecutable:'/home/keshav/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],requiredNativeTableOwnerSlides:[],verifyArtifactToolImport:true,receiptPath:path.join(stageDir,'SpendSmart.validation.json')});
console.log(`Created ${finalPath}`);
