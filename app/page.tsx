"use client";

import { useMemo, useState } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, BadgeCheck, BarChart3, Bell, Check,
  ChevronDown, CircleHelp, Clapperboard, FileText, Filter, Globe2,
  LayoutDashboard, LockKeyhole, MoreHorizontal, Play, Plus, Radio, Search,
  Settings2, ShieldCheck, Sparkles, UploadCloud, Wallet, X, Youtube, Zap
} from "lucide-react";

type Campaign = {
  id: number; name: string; platform: string; payout: string;
  status: "Draft" | "Active"; brief: string; videoUrl: string; created: string;
};

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Campaigns", icon: Radio },
  { label: "Clip queue", icon: Clapperboard },
  { label: "Publishing", icon: UploadCloud },
  { label: "Analytics", icon: BarChart3 }
];

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [quickUrl, setQuickUrl] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const visibleCampaigns = useMemo(
    () => campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [campaigns, search]
  );

  function saveCampaign() {
    if (!name.trim()) { setNotice("Give this campaign a name before saving."); return; }
    setCampaigns(old => [{
      id: Date.now(), name: name.trim(), platform: "YouTube Shorts",
      payout: "Not specified", status: "Draft",
      brief: brief.trim(), videoUrl: videoUrl.trim(), created: "Just now"
    }, ...old]);
    setName(""); setBrief(""); setVideoUrl(""); setModal(false);
    setNotice("Campaign saved in this browser session. Processing is not connected yet.");
  }

  function prepareRun() {
    if (!selectedCampaign) { setNotice("Choose a campaign first."); return; }
    if (!quickUrl.trim()) { setNotice("Paste the approved YouTube video URL first."); return; }
    setNotice("Run staged. OpenShorts API and a background worker must be connected before video processing can start.");
    setActive("Clip queue");
  }

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brandIcon"><Clapperboard size={20}/></div><div><b>clip<span>factory</span></b><small>CREATOR OPERATIONS</small></div></div>
      <div className="tinyLabel">WORKSPACE</div>
      <button className="workspace"><span className="workspaceAvatar">P</span><span><b>Personal workspace</b><small>Prototype environment</small></span><ChevronDown size={15}/></button>
      <div className="tinyLabel navLabel">MENU</div>
      <nav>{navItems.map(item => { const Icon = item.icon; return <button key={item.label} onClick={() => setActive(item.label)} className={active === item.label ? "navItem selected" : "navItem"}><Icon size={17}/><span>{item.label}</span>{item.label === "Clip queue" && <i>0</i>}</button>; })}</nav>
      <div className="tinyLabel toolsLabel">CONFIGURATION</div>
      <button className="navItem" onClick={() => setNotice("Integration settings will be added with the backend connection.")}><Settings2 size={17}/><span>Integrations</span></button>
      <div className="sideBottom"><div className="sidePromo"><Sparkles size={17}/><b>Your clipping HQ</b><p>Campaigns, clips, publishing and payouts in one workflow.</p><span>BUILDING YOUR WORKSPACE ↗</span></div><div className="profile"><div className="profileAvatar">P</div><div><b>Workspace owner</b><small>Free prototype</small></div><MoreHorizontal size={17}/></div></div>
    </aside>
    <section className="main">
      <header className="topbar"><div className="crumb">Workspace <span>/</span> <b>{active}</b></div><div className="topRight"><div className="system"><i/> Systems not connected</div><button className="iconBtn" aria-label="Help"><CircleHelp size={18}/></button><button className="iconBtn" aria-label="Notifications"><Bell size={18}/></button><div className="topAvatar">P</div></div></header>
      <div className="content">
        <div className="heading"><div><div className="eyebrow"><i/> YOUR CONTENT OPERATIONS, IN ONE PLACE</div><h1>{active === "Overview" ? "Good to see you." : active}</h1><p>Your campaign clipping command centre starts here.</p></div><button className="primary" onClick={() => setModal(true)}><Plus size={16}/> New campaign</button></div>
        {notice && <div className="notice"><span><Check size={15}/>{notice}</span><button onClick={() => setNotice("")}><X size={15}/></button></div>}
        <div className="stats">
          <Stat icon={<Radio size={17}/>} label="Campaigns" value={String(campaigns.length).padStart(2,"0")} note="In your workspace"/>
          <Stat icon={<Clapperboard size={17}/>} label="Clips generated" value="—" note="Waiting for OpenShorts"/>
          <Stat icon={<BadgeCheck size={17}/>} label="Approved clips" value="—" note="Eligibility checks pending"/>
          <Stat icon={<Wallet size={17}/>} label="Tracked earnings" value="₹0" note="No payout data connected"/>
        </div>
        <div className="twoCol">
          <section className="panel workflow"><div className="panelHead"><div><label>THE PIPELINE</label><h2>From source video to campaign payout</h2></div><span className="pill">Setup in progress</span></div>
            <div className="steps">
              <Step n="01" title="Campaign brief" desc="Add rules, payout terms and restrictions" ready/>
              <Step n="02" title="Approved source video" desc="Attach the exact campaign-approved URL" ready/>
              <Step n="03" title="AI clip generation" desc="OpenShorts finds and renders moments"/>
              <Step n="04" title="Eligibility review" desc="Check every clip against campaign rules"/>
              <Step n="05" title="Publish & track" desc="Distribute, monitor views and earnings"/>
            </div>
            <div className="panelFoot"><span><LockKeyhole size={13}/> Processing integrations are not connected yet.</span><button onClick={() => setNotice("Next integration: OpenShorts API, webhook and a persistent processing worker.")}>Integration checklist <ArrowRight size={14}/></button></div>
          </section>
          <section className="panel quick"><div className="panelHead"><div><label>QUICK START</label><h2>Prepare a clipping run</h2></div><div className="zap"><Zap size={17}/></div></div><p>Choose a campaign and paste its approved YouTube source. The run will be linked to that campaign.</p>
            <label className="fieldLabel">CAMPAIGN</label><select value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}><option value="">Choose a campaign</option>{campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <label className="fieldLabel">YOUTUBE VIDEO URL</label><div className="urlInput"><Youtube size={16}/><input value={quickUrl} onChange={e => setQuickUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."/></div>
            <button className="run" onClick={prepareRun}><Play size={14} fill="currentColor"/> Prepare clipping run <ArrowRight size={14}/></button><small className="disclaimer"><LockKeyhole size={12}/> No video is processed in this prototype.</small>
          </section>
        </div>
        <section className="panel campaignPanel"><div className="campaignHead"><div><label>YOUR WORKSPACE</label><h2>Campaigns <span>{campaigns.length}</span></h2></div><div className="tableTools"><div className="search"><Search size={14}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns"/></div><button className="filter" onClick={() => setNotice("Campaign filters will arrive with status tracking.")}><Filter size={14}/> Filter</button></div></div>
          <div className="tableScroll"><table><thead><tr><th>CAMPAIGN</th><th>PLATFORM</th><th>PAYOUT</th><th>STATUS</th><th>ADDED</th><th/></tr></thead><tbody>{visibleCampaigns.map(c => <tr key={c.id}><td><div className="campaignName"><div className="campaignIcon"><Radio size={15}/></div><div><b>{c.name}</b><small>{c.videoUrl ? "Source video attached" : "No source video yet"}</small></div></div></td><td><span className="platform"><Youtube size={13}/> {c.platform}</span></td><td>{c.payout}</td><td><span className="draft"><i/> Draft</span></td><td>{c.created}</td><td><button className="iconBtn"><MoreHorizontal size={16}/></button></td></tr>)}</tbody></table>{visibleCampaigns.length === 0 && <div className="empty">{campaigns.length ? "No campaigns match your search." : "No campaigns yet. Add your first campaign to get started."}</div>}</div><div className="tableFoot"><span>Showing {visibleCampaigns.length} of {campaigns.length} campaigns</span><span>Prototype data is session-only</span></div>
        </section>
        <div className="integrations"><Integration icon={<Clapperboard size={17}/>} title="OpenShorts engine" detail="AI clip generation · API / MCP" onClick={() => setNotice("OpenShorts API endpoint and credentials are the first backend integration.")}/><Integration icon={<Globe2 size={17}/>} title="Publishing accounts" detail="YouTube · Instagram · TikTok" onClick={() => setNotice("Publishing will use official APIs or a supported publishing provider.")}/></div>
        <footer><span>CLIP FACTORY <i>·</i> BUILD 0.1.0</span><span>Built for creators who move at scale.</span></footer>
      </div>
    </section>
    {modal && <div className="overlay" onMouseDown={e => {if(e.target === e.currentTarget) setModal(false);}}><div className="modal"><div className="modalHead"><div><label>NEW WORKSPACE ITEM</label><h2>Create a campaign</h2><p>Save the campaign brief and approved source video.</p></div><button className="iconBtn" onClick={() => setModal(false)}><X size={18}/></button></div><label className="fieldLabel">CAMPAIGN NAME</label><input className="modalInput" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Creator launch campaign"/><label className="fieldLabel">CAMPAIGN RULES / BRIEF</label><textarea className="modalInput textarea" rows={5} value={brief} onChange={e => setBrief(e.target.value)} placeholder="Paste requirements, payout rules, prohibited content, duration, tags..."/><label className="fieldLabel">APPROVED YOUTUBE VIDEO URL <em>OPTIONAL</em></label><input className="modalInput" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."/><div className="modalBottom"><small><LockKeyhole size={12}/> Saved in this browser session</small><button className="primary" onClick={saveCampaign}>Save campaign <ArrowRight size={14}/></button></div></div></div>}
  </main>;
}

function Stat({icon,label,value,note}:{icon:React.ReactNode;label:string;value:string;note:string}) {
  return <div className="stat"><div className="statTop"><span>{label}</span><i>{icon}</i></div><strong>{value}</strong><small>{note}</small></div>;
}
function Step({n,title,desc,ready=false}:{n:string;title:string;desc:string;ready?:boolean}) {
  return <div className="step"><div className={ready?"stepIcon ready":"stepIcon"}>{ready?<Check size={16}/>:<LockKeyhole size={15}/>}</div><div className="stepText"><b>{title}<small>{n}</small></b><p>{desc}</p></div>{ready?<span className="readyText">Ready</span>:<span className="locked">Locked</span>}</div>;
}
function Integration({icon,title,detail,onClick}:{icon:React.ReactNode;title:string;detail:string;onClick:()=>void}) {
  return <div className="integration"><div className="integrationIcon">{icon}</div><div className="integrationText"><b>{title}</b><small>{detail}</small></div><span>Not connected</span><button onClick={onClick}>Configure <ArrowUpRight size={13}/></button></div>;
}