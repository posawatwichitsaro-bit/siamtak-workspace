require("dotenv").config();
const express=require("express"),session=require("express-session"),path=require("path");
const app=express(),PORT=Number(process.env.PORT||3001),HOST=process.env.HOST||"0.0.0.0";
const users={admin:{password:"admin123",name:"Workspace Admin",role:"Admin"},user:{password:"user123",name:"Workspace User",role:"User"}};
const systems=[
{id:"document-checker",name:"ระบบตรวจเอกสาร",description:"เข้าสู่ระบบตรวจสอบเอกสาร",icon:"📄",url:"/document-checker",type:"internal",enabled:true,permission:"all",sortOrder:1},
{id:"file-extraction",name:"ดึงข้อมูลจากไฟล์",description:"ดึงข้อมูลจากเอกสาร PDF, PNG และ JPG",icon:"📊",url:"/file-extraction",type:"internal",enabled:true,permission:"all",sortOrder:2}
];
app.use(express.json());app.use(express.urlencoded({extended:true}));
app.use(session({secret:process.env.SESSION_SECRET||"dev",resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:"lax"}}));
app.use(express.static(path.join(__dirname,"public")));
const auth=(req,res,next)=>req.session.user?next():res.status(401).json({message:"กรุณาเข้าสู่ระบบ"});
const admin=(req,res,next)=>req.session.user?.role==="Admin"?next():res.status(403).json({message:"ไม่มีสิทธิ์"});
app.get("/api/me",(req,res)=>res.json({authenticated:!!req.session.user,user:req.session.user||null}));
app.post("/api/login",(req,res)=>{const u=users[req.body.username];if(!u||u.password!==req.body.password)return res.status(401).json({message:"ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"});req.session.user={username:req.body.username,name:u.name,role:u.role};res.json({ok:true,user:req.session.user})});
app.post("/api/logout",(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get("/api/config",auth,(req,res)=>res.json({siamtakAIUrl:process.env.SIAMTAK_AI_URL||"http://100.76.213.30:3000"}));
app.get("/api/systems",auth,(req,res)=>res.json(systems.filter(s=>s.enabled&&(s.permission==="all"||s.permission===req.session.user.role)).sort((a,b)=>a.sortOrder-b.sortOrder)));
app.get("/api/admin/systems",admin,(req,res)=>res.json([...systems].sort((a,b)=>a.sortOrder-b.sortOrder)));
app.post("/api/admin/systems",admin,(req,res)=>{const{name,description,icon,url,type,permission,enabled,sortOrder}=req.body;if(!name||!url)return res.status(400).json({message:"กรุณาระบุชื่อและ URL"});const s={id:"system-"+Date.now(),name,description:description||"",icon:icon||"🧩",url,type:type||"external",permission:permission||"all",enabled:enabled!==false,sortOrder:Number(sortOrder||systems.length+1)};systems.push(s);res.json({ok:true,system:s})});
app.put("/api/admin/systems/:id",admin,(req,res)=>{const s=systems.find(x=>x.id===req.params.id);if(!s)return res.status(404).json({message:"ไม่พบระบบ"});Object.assign(s,req.body);if(s.sortOrder!==undefined)s.sortOrder=Number(s.sortOrder);res.json({ok:true,system:s})});
app.delete("/api/admin/systems/:id",admin,(req,res)=>{const i=systems.findIndex(x=>x.id===req.params.id);if(i<0)return res.status(404).json({message:"ไม่พบระบบ"});systems.splice(i,1);res.json({ok:true})});
app.get("/api/health",(_,res)=>res.json({ok:true}));
app.get("*splat",(_,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,HOST,()=>console.log(`Siamtak Workspace: http://${HOST}:${PORT}`));
