import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

const app = express();
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(express.json({ limit: '100kb' }));
app.disable('x-powered-by');
app.set('trust proxy', 1);

const PORT = Number(process.env.AUTOMATION_PORT || 5001);
const PUBLIC_ORIGIN = String(process.env.PUBLIC_ORIGIN || '').replace(/\/$/, '');
const INTERNAL_API_ORIGIN = String(process.env.INTERNAL_API_ORIGIN || 'http://127.0.0.1:3000').replace(/\/$/, '');
const PAYHERE_MERCHANT_ID = String(process.env.PAYHERE_MERCHANT_ID || '').trim();
const PAYHERE_MERCHANT_SECRET = String(process.env.PAYHERE_MERCHANT_SECRET || '').trim();
const PAYHERE_SANDBOX = String(process.env.PAYHERE_SANDBOX || 'true').toLowerCase() === 'true';
const PAYHERE_USD_TO_LKR = Number(process.env.PAYHERE_USD_TO_LKR || 300);
const DISCORD_TOKEN = String(process.env.DISCORD_BOT_TOKEN || '').trim();
const DISCORD_GUILD_ID = String(process.env.DISCORD_GUILD_ID || '1540991735595929680').trim();
const DISCORD_TICKET_CATEGORY_ID = String(process.env.DISCORD_TICKET_CATEGORY_ID || '').trim();
const DISCORD_TICKET_CHANNEL_ID = String(process.env.DISCORD_TICKET_CHANNEL_ID || '1540995191727722557').trim();
const DISCORD_STAFF_ROLE_ID = String(process.env.DISCORD_STAFF_ROLE_ID || '').trim();
const PTERO_URL = String(process.env.PTERODACTYL_URL || '').replace(/\/$/, '');
const PTERO_TOKEN = String(process.env.PTERODACTYL_APPLICATION_TOKEN || '').trim();
const PTERO_NEST_ID = Number(process.env.PTERODACTYL_NEST_ID || 1);
const PTERO_EGG_ID = Number(process.env.PTERODACTYL_EGG_ID || 1);
const PTERO_LOCATION_ID = Number(process.env.PTERODACTYL_LOCATION_ID || 1);
const PTERO_NODE_ID = Number(process.env.PTERODACTYL_NODE_ID || 1);
const PTERO_ALLOCATION_ID = Number(process.env.PTERODACTYL_ALLOCATION_ID || 0);
const PTERO_DOCKER_IMAGE = String(process.env.PTERODACTYL_DOCKER_IMAGE || 'ghcr.io/pterodactyl/yolks:java_21');
const PTERO_STARTUP = String(process.env.PTERODACTYL_STARTUP || 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}');
const DATA_DIR = path.resolve(process.env.ARVEX_AUTOMATION_DATA_DIR || './data/automation');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const INTERNAL_SECRET = String(process.env.AUTOMATION_INTERNAL_SECRET || '').trim();
const rate = new Map();

async function readJson(file, fallback) { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') console.error(e); return fallback; } }
async function writeJson(file, value) { await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 }); const tmp = `${file}.${process.pid}.${Date.now()}.tmp`; await fs.writeFile(tmp, JSON.stringify(value, null, 2), { mode: 0o600 }); await fs.rename(tmp, file); }
async function orders() { return readJson(ORDERS_FILE, []); }
async function saveOrders(v) { return writeJson(ORDERS_FILE, v); }
function md5(v) { return crypto.createHash('md5').update(v).digest('hex').toUpperCase(); }
function payHash(orderId, amount, currency) { return md5(PAYHERE_MERCHANT_ID + orderId + Number(amount).toFixed(2) + currency + md5(PAYHERE_MERCHANT_SECRET)); }
function verifyPayHere(body) { const local = md5(String(body.merchant_id || '') + String(body.order_id || '') + String(body.payhere_amount || '') + String(body.payhere_currency || '') + String(body.status_code || '') + md5(PAYHERE_MERCHANT_SECRET)); return local === String(body.md5sig || '').toUpperCase(); }
function clientKey(req) { return String(req.headers['cf-connecting-ip'] || req.ip || 'unknown'); }
function limited(req) { const key=clientKey(req), now=Date.now(), e=rate.get(key); if (!e || now-e.t>10*60*1000) { rate.set(key,{t:now,n:1}); return false; } e.n++; return e.n > 20; }
function internal(req,res,next) { if (!INTERNAL_SECRET) return next(); const provided=Buffer.from(String(req.headers['x-arvex-automation-secret']||'')); const expected=Buffer.from(INTERNAL_SECRET); if (provided.length===expected.length && crypto.timingSafeEqual(provided, expected)) return next(); return res.status(401).json({ error:'Unauthorized automation request.' }); }
async function cmsConfig() { const r=await fetch(`${INTERNAL_API_ORIGIN}/api/cms/config`); if(!r.ok) throw new Error('CMS configuration unavailable'); return r.json(); }
function planCycleAmount(plan, cycle) { const base=Number(plan?.monthlyPrice || 0); if(cycle==='yearly') return Number((base*10).toFixed(2)); if(cycle==='quarterly') return Number((base*2.8).toFixed(2)); return Number(base.toFixed(2)); }
function splitName(name='ArveX Customer') { const parts=String(name).trim().split(/\s+/); return { first_name: parts.shift() || 'ArveX', last_name: parts.join(' ') || 'Customer' }; }

let discord = null;
if (DISCORD_TOKEN) {
  discord = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
  discord.once('ready', () => console.log(`Discord automation ready as ${discord.user.tag}`));
  discord.on('error', console.error);
  discord.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    const [action, orderId] = interaction.customId.split(':');
    if (!orderId) return;
    const list = await orders(); const order = list.find(o => o.orderId === orderId);
    if (!order) return interaction.reply({ content:'Order record not found.', ephemeral:true });
    const isStaff = Boolean(DISCORD_STAFF_ROLE_ID && interaction.member?.roles?.cache?.has(DISCORD_STAFF_ROLE_ID)) || interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels);
    if (['claim','payment_done','close'].includes(action) && !isStaff) return interaction.reply({ content:'Staff access required.', ephemeral:true });
    if (action === 'claim') { order.claimedBy = interaction.user.id; order.claimedAt = new Date().toISOString(); await saveOrders(list); return interaction.reply({ content:`Ticket claimed by <@${interaction.user.id}>.`, ephemeral:false }); }
    if (action === 'close') { order.closedAt = new Date().toISOString(); order.status='closed'; await saveOrders(list); return interaction.update({ content:`🔒 Ticket closed by <@${interaction.user.id}>.`, components:[] }); }
    if (action === 'payment_done') {
      if (order.paymentStatus !== 'paid') return interaction.reply({ content:'Payment is not verified by PayHere yet. Do not provision this order.', ephemeral:true });
      if (order.provisionStatus === 'provisioned') return interaction.reply({ content:'This order has already been provisioned.', ephemeral:true });
      await interaction.deferReply({ ephemeral:false });
      try {
        const result = await provision(order);
        order.provisionStatus='provisioned'; order.server=result.server; order.provisionedAt=new Date().toISOString(); await saveOrders(list);
        await interaction.editReply(`✅ **Provisioning complete**\nServer: **${result.server.name}**\nPanel: ${PTERO_URL}\nOrder: **${order.orderId}**`);
        if (order.ticketChannelId) { const ch=await discord.channels.fetch(order.ticketChannelId).catch(()=>null); if(ch) await ch.send({content:`<@${order.discordUserId || ''}>`,embeds:[serverEmbed(order,result)],components:[]}).catch(()=>{}); }
        if (order.discordUserId) await interaction.client.users.fetch(order.discordUserId).then(u=>u.send({embeds:[serverEmbed(order,result)]})).catch(()=>{});
      } catch (e) { console.error(e); order.provisionStatus='failed'; order.provisionError=String(e.message||e); await saveOrders(list); await interaction.editReply(`❌ Provisioning failed: ${String(e.message||e).slice(0,1500)}`); }
    }
  });
  discord.login(DISCORD_TOKEN).catch(e=>console.error('Discord login failed:',e.message));
}

function orderEmbed(o) { return new EmbedBuilder().setColor(0x7c3aed).setTitle(`ArveX Hosting • Order ${o.orderId}`).setDescription('New hosting order. Payment is only considered complete after PayHere server-side verification.').addFields({name:'Customer',value:`${o.customerName}\n${o.customerEmail}`},{name:'Plan',value:o.planName},{name:'Billing',value:o.cycle},{name:'Amount',value:`LKR ${Number(o.amountLkr).toLocaleString('en-LK',{minimumFractionDigits:2})}`},{name:'Payment',value:o.paymentStatus},{name:'Provisioning',value:o.provisionStatus}).setTimestamp(); }
function serverEmbed(o,r) { return new EmbedBuilder().setColor(0x10b981).setTitle(`ArveX • ${o.planName} provisioned`).addFields({name:'Order',value:o.orderId},{name:'Server',value:r.server.name},{name:'Panel',value:PTERO_URL},{name:'Server ID',value:String(r.server.id)}).setTimestamp(); }
async function createTicket(o) {
  if (!discord) throw new Error('Discord bot is not configured. Set DISCORD_BOT_TOKEN.');
  const guild=await discord.guilds.fetch(DISCORD_GUILD_ID); const parent=DISCORD_TICKET_CATEGORY_ID ? await guild.channels.fetch(DISCORD_TICKET_CATEGORY_ID).catch(()=>null) : null;
  if (!parent || parent.type!==ChannelType.GuildCategory) throw new Error('DISCORD_TICKET_CATEGORY_ID must be a valid Discord category ID.');
  let member=null; if(o.discordUserId) member=await guild.members.fetch(o.discordUserId).catch(()=>null);
  const overwrites=[{id:guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},{id:guild.members.me.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ManageChannels,PermissionFlagsBits.ReadMessageHistory]}];
  if(member) overwrites.push({id:member.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]});
  if(DISCORD_STAFF_ROLE_ID) overwrites.push({id:DISCORD_STAFF_ROLE_ID,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.ManageChannels]});
  const channel=await guild.channels.create({name:`order-${o.orderId.toLowerCase()}`,type:ChannelType.GuildText,parent:parent.id,permissionOverwrites:overwrites,topic:`ArveX order ${o.orderId}`});
  const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`claim:${o.orderId}`).setLabel('Claim Ticket').setStyle(ButtonStyle.Primary).setEmoji('🛡️'),new ButtonBuilder().setCustomId(`payment_done:${o.orderId}`).setLabel('Payment Done').setStyle(ButtonStyle.Success).setEmoji('💳'),new ButtonBuilder().setCustomId(`close:${o.orderId}`).setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'));
  await channel.send({content:member?`<@${member.id}>`:`Order customer: ${o.customerEmail}`,embeds:[orderEmbed(o)],components:[row]});
  return channel.id;
}
async function ptero(pathname, options={}) { if(!PTERO_URL||!PTERO_TOKEN) throw new Error('Pterodactyl is not configured.'); const r=await fetch(`${PTERO_URL}${pathname}`,{...options,headers:{Authorization:`Bearer ${PTERO_TOKEN}`,Accept:'Application/vnd.pterodactyl.v1+json','Content-Type':'application/json',...(options.headers||{})}}); const text=await r.text(); let data={}; try{data=JSON.parse(text);}catch{} if(!r.ok) throw new Error(`Pterodactyl ${r.status}: ${data?.errors?.[0]?.detail || text.slice(0,500)}`); return data; }
async function pteroUser(o) { const existing=await ptero(`/api/application/users?filter[email]=${encodeURIComponent(o.customerEmail)}`); if(existing.data?.[0]?.attributes) return existing.data[0].attributes; const [first,...rest]=o.customerName.split(/\s+/); const password=crypto.randomBytes(18).toString('base64url'); const r=await ptero('/api/application/users',{method:'POST',body:JSON.stringify({email:o.customerEmail,username:`arvex_${crypto.randomBytes(5).toString('hex')}`,first_name:first||'ArveX',last_name:rest.join(' ')||'Customer',password})}); return r.attributes; }
async function provision(o) { const user=await pteroUser(o); const ram=Math.max(128,Math.round(Number(o.ramMb||o.plan?.ramMb||1024))); const disk=Math.max(512,Math.round(Number(o.diskMb||o.plan?.diskMb||10240))); const cpu=Math.max(1,Math.round(Number(o.cpuPercent||o.plan?.cpuPercent||100))); const allocation=PTERO_ALLOCATION_ID?{default:PTERO_ALLOCATION_ID}:{default:null}; if(!allocation.default) throw new Error('Set PTERODACTYL_ALLOCATION_ID before provisioning.'); const body={external_id:o.orderId,name:`ArveX-${o.orderId}`,user:user.id,nest:PTERO_NEST_ID,egg:PTERO_EGG_ID,docker_image:PTERO_DOCKER_IMAGE,startup:PTERO_STARTUP,environment:{SERVER_JARFILE:'server.jar',VANILLA_VERSION:'latest'},limits:{memory:ram,swap:0,disk,cpu,io:500},feature_limits:{databases:1,allocations:1,backups:1},allocation}; const r=await ptero('/api/application/servers',{method:'POST',body:JSON.stringify(body)}); return {user,server:r.attributes}; }

app.get('/health',(_req,res)=>res.json({ok:true,service:'arvex-automation',payhere:Boolean(PAYHERE_MERCHANT_ID&&PAYHERE_MERCHANT_SECRET),discord:Boolean(discord?.isReady()),pterodactyl:Boolean(PTERO_URL&&PTERO_TOKEN)}));
app.get('/api/payments/payhere/quote',async(req,res)=>{try{const cfg=await cmsConfig(); const plan=(cfg.plans||[]).find(p=>p.id===String(req.query.planId)); if(!plan)return res.status(404).json({error:'Plan not found.'}); const cycle=String(req.query.cycle||'monthly'); const amountUsd=planCycleAmount(plan,cycle); if(amountUsd<=0)return res.status(400).json({error:'Plan price is not configured.'}); res.json({amountUsd,amountLkr:Math.round(amountUsd*PAYHERE_USD_TO_LKR*100)/100});}catch(e){res.status(502).json({error:e.message});}});
app.post('/api/payments/payhere/create',internal,async(req,res)=>{if(limited(req))return res.status(429).json({error:'Too many requests.'});if(!PAYHERE_MERCHANT_ID||!PAYHERE_MERCHANT_SECRET)return res.status(503).json({error:'PayHere is not configured.'}); const {orderId,planId,cycle='monthly',phone,address,city,discordUserId}=req.body||{}; if(!orderId||!planId||!phone||!address||!city)return res.status(400).json({error:'Missing required checkout details.'}); if(!/^[A-Za-z0-9_-]{6,80}$/.test(String(orderId)))return res.status(400).json({error:'Invalid order ID.'}); const cfg=await cmsConfig(); const plan=(cfg.plans||[]).find(p=>p.id===String(planId)); if(!plan)return res.status(404).json({error:'Plan not found.'}); const amountUsd=planCycleAmount(plan,String(cycle)); const amountLkr=Math.round(amountUsd*PAYHERE_USD_TO_LKR*100)/100; if(amountLkr<=0)return res.status(400).json({error:'Invalid plan price.'}); const email=String(req.headers['x-customer-email']||req.body.email||'').trim().toLowerCase(); const name=String(req.headers['x-customer-name']||req.body.name||'ArveX Customer').trim(); if(!email||!email.includes('@'))return res.status(400).json({error:'Customer email is required.'}); const list=await orders(); if(list.some(o=>o.orderId===orderId))return res.status(409).json({error:'Order already exists.'}); const o={orderId,planId:String(planId),planName:String(plan.name),cycle:String(cycle),customerEmail:email,customerName:name,phone:String(phone),address:String(address),city:String(city),amountUsd,amountLkr,currency:'LKR',paymentStatus:'pending',provisionStatus:'pending',createdAt:new Date().toISOString(),discordUserId:discordUserId||null}; o.ticketChannelId=await createTicket(o); list.push(o); await saveOrders(list); const action=PAYHERE_SANDBOX?'https://sandbox.payhere.lk/pay/checkout':'https://www.payhere.lk/pay/checkout'; const {first_name,last_name}=splitName(name); const fields={merchant_id:PAYHERE_MERCHANT_ID,return_url:`${PUBLIC_ORIGIN}/payment/${encodeURIComponent(orderId)}/return`,cancel_url:`${PUBLIC_ORIGIN}/payment/${encodeURIComponent(orderId)}/cancel`,notify_url:`${PUBLIC_ORIGIN}/api/payments/payhere/notify`,first_name,last_name,email,phone,address,city,country:'Sri Lanka',order_id:orderId,items:`ArveX ${plan.name}`,currency:'LKR',amount:amountLkr.toFixed(2),hash:payHash(orderId,amountLkr,'LKR'),custom_1:String(planId),custom_2:String(cycle)}; res.json({ok:true,orderId,amountUsd,amountLkr,action,fields}); });
app.post('/api/payments/payhere/notify',async(req,res)=>{try{const b=req.body||{}; if(String(b.merchant_id)!==PAYHERE_MERCHANT_ID||!verifyPayHere(b)) return res.status(400).send('INVALID'); const list=await orders(); const o=list.find(x=>x.orderId===String(b.order_id)); if(!o)return res.status(404).send('ORDER_NOT_FOUND'); const amount=Number(b.payhere_amount),currency=String(b.payhere_currency); if(Math.abs(amount-Number(o.amountLkr))>0.01||currency!=='LKR')return res.status(400).send('AMOUNT_MISMATCH'); o.paymentId=String(b.payment_id||'');o.paymentMethod=String(b.method||'');o.statusMessage=String(b.status_message||'');o.paymentStatus=String(b.status_code)==='2'?'paid':String(b.status_code)==='0'?'pending':String(b.status_code)==='-3'?'chargedback':'failed';o.paymentVerifiedAt=o.paymentStatus==='paid'?new Date().toISOString():o.paymentVerifiedAt;await saveOrders(list);if(o.ticketChannelId&&discord){const ch=await discord.channels.fetch(o.ticketChannelId).catch(()=>null);if(ch)await ch.send({embeds:[new EmbedBuilder().setColor(o.paymentStatus==='paid'?0x10b981:0xf59e0b).setTitle(`PayHere status: ${o.paymentStatus.toUpperCase()}`).setDescription(`Order **${o.orderId}** has been server-verified. ${o.paymentStatus==='paid'?'Staff may now press Payment Done to provision the server.':'No provisioning action is allowed.'}`).addFields({name:'Payment ID',value:o.paymentId||'N/A'},{name:'Method',value:o.paymentMethod||'N/A'})]});}res.send('OK');}catch(e){console.error(e);res.status(500).send('ERROR');}});
app.get('/api/payments/payhere/status',async(req,res)=>{const id=String(req.query.orderId||'');const o=(await orders()).find(x=>x.orderId===id);if(!o)return res.status(404).json({error:'Order not found.'});res.json({orderId:o.orderId,status:o.paymentStatus,statusMessage:o.statusMessage||'',paymentId:o.paymentId||null,provisionStatus:o.provisionStatus});});

app.listen(PORT,'127.0.0.1',()=>console.log(`ArveX automation listening on 127.0.0.1:${PORT}`));
