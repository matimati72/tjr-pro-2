"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Euro, Calendar, Percent, ChevronDown, Copy, Share2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const fmt = (n:number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n||0));
const fmt2 = (n:number) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n||0);
const clamp = (n:number, min:number, max:number) => Math.max(min, Math.min(max, n));

function useQuerySync(state:any, setState:(v:any)=>void) {
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const entries:any = {};
    params.forEach((v,k)=>{ entries[k] = v; });
    if(Object.keys(entries).length){
      setState((s:any)=>({
        ...s,
        targetNet: entries.tn ? Number(entries.tn) : s.targetNet,
        workingDays: entries.wd ? Number(entries.wd) : s.workingDays,
        nonBillablePct: entries.nb ? Number(entries.nb) : s.nonBillablePct,
        hoursPerDay: entries.hp ? Number(entries.hp) : s.hoursPerDay,
        chargesPct: entries.cp ? Number(entries.cp) : s.chargesPct,
        monthlyFixed: entries.mf ? Number(entries.mf) : s.monthlyFixed,
        autoEntrepreneur: entries.ae ? entries.ae === '1' : s.autoEntrepreneur,
      }));
    }
  }, [setState]);
  useEffect(()=>{
    const p = new URLSearchParams();
    p.set('tn', String(state.targetNet));
    p.set('wd', String(state.workingDays));
    p.set('nb', String(state.nonBillablePct));
    p.set('hp', String(state.hoursPerDay));
    p.set('cp', String(state.chargesPct));
    p.set('mf', String(state.monthlyFixed));
    p.set('ae', state.autoEntrepreneur ? '1' : '0');
    const url = `${window.location.pathname}?${p.toString()}`;
    window.history.replaceState({}, '', url);
  }, [state]);
}

export default function Page(){
  const [state, setState] = useState({
    targetNet: 3000,
    workingDays: 19,
    nonBillablePct: 30,
    hoursPerDay: 7,
    chargesPct: 45,
    monthlyFixed: 250,
    autoEntrepreneur: false,
  });

  useQuerySync(state, setState);

  const presets = {
    ae: { chargesPct: 22, note: "Taux moyen micro (BNC/vente). Ajuste selon ton activité." },
    societe: { chargesPct: 45, note: "Estimation charges + impôt. Adapte avec ton expert-comptable." }
  } as const;

  const billableDays = useMemo(()=>{
    const effective = clamp(state.workingDays, 10, 23) * (1 - clamp(state.nonBillablePct,0,90)/100);
    return Math.max(1, Math.round(effective));
  }, [state.workingDays, state.nonBillablePct]);

  const turnover = useMemo(()=>{
    const base = state.targetNet + state.monthlyFixed;
    const ratio = 1 - clamp(state.chargesPct, 0, 90)/100;
    return ratio <= 0 ? 0 : base / ratio;
  }, [state.targetNet, state.monthlyFixed, state.chargesPct]);

  const tjm = useMemo(()=> turnover / billableDays, [turnover, billableDays]);
  const thm = useMemo(()=> tjm / Math.max(1, state.hoursPerDay), [tjm, state.hoursPerDay]);

  const tiers = useMemo(()=>[
    { label: "Essentiel", mult: 1.00 },
    { label: "Standard",  mult: 1.10 },
    { label: "Premium",   mult: 1.25 },
  ].map(t => ({...t, value: tjm * t.mult})), [tjm]);

  const copy = async (text:string) => {
    try { await navigator.clipboard.writeText(text); alert("Copié dans le presse-papiers ✅"); }
    catch { alert("Impossible de copier :("); }
  }
  const share = async () => {
    try { await (navigator as any).share?.({ title: "Mon TJM freelance", text: "Voici mon TJM calculé avec TJM Pro", url: window.location.href }); } catch {}
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen p-4 sm:p-8">
        <header className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-slate-900 text-white"><Calculator className="w-5 h-5"/></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">TJM Pro</h1>
              <p className="text-slate-600 text-sm">Calculateur de TJM pour freelances (France) — partageable, gratuit, prêt à monétiser</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="" onClick={()=>copy(`TJM conseillé: ${fmt(tjm)} € / jour`)}><Copy className="w-4 h-4"/>Copier</Button>
            <Button variant="outline" onClick={share}><Share2 className="w-4 h-4"/>Partager</Button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto mt-6 grid md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 card shadow-md">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2"><Euro className="w-5 h-5"/>Paramètres</h3>
            </div>
            <div className="card-content space-y-5">

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Objectif net mensuel (€)</Label>
                  <Input type="number" min={0} value={state.targetNet}
                         onChange={e=>setState(s=>({ ...s, targetNet: Number(e.target.value) }))}/>
                </div>
                <div>
                  <Label>Coûts fixes mensuels (€)</Label>
                  <Input type="number" min={0} value={state.monthlyFixed}
                         onChange={e=>setState(s=>({ ...s, monthlyFixed: Number(e.target.value) }))}/>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label className="">Jours travaillés/mois <Calendar className="inline w-4 h-4"/></Label>
                  <Input type="number" min={10} max={23} value={state.workingDays}
                         onChange={e=>setState(s=>({ ...s, workingDays: Number(e.target.value) }))}/>
                </div>
                <div>
                  <Label className="">% non facturable <Percent className="inline w-4 h-4"/></Label>
                  <div className="pt-2">
                    <Slider min={0} max={70} step={1}
                            value={[state.nonBillablePct]}
                            onValueChange={(v)=>setState(s=>({ ...s, nonBillablePct: v[0] }))}/>
                  </div>
                  <div className="text-xs text-slate-500">{state.nonBillablePct}% (prospection, admin…)</div>
                </div>
                <div>
                  <Label>Heures facturables / jour</Label>
                  <Input type="number" min={4} max={10} value={state.hoursPerDay}
                         onChange={e=>setState(s=>({ ...s, hoursPerDay: Number(e.target.value) }))}/>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>Charges & impôts estimés (%)</Label>
                    <div className="flex items-center gap-3 text-sm">
                      <Switch checked={state.autoEntrepreneur}
                              onCheckedChange={(v)=>setState(s=>({ ...s, autoEntrepreneur: v, chargesPct: v ? presets.ae.chargesPct : presets.societe.chargesPct }))}/>
                      <span className="text-slate-600">Auto‑entrepreneur</span>
                      <Tooltip>
                        <TooltipTrigger asChild><span className="cursor-help text-slate-500">ℹ️</span></TooltipTrigger>
                        <TooltipContent>{state.autoEntrepreneur ? presets.ae.note : presets.societe.note}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <Slider min={5} max={65} step={1}
                          value={[state.chargesPct]}
                          onValueChange={(v)=>setState(s=>({ ...s, chargesPct: v[0] }))}/>
                  <div className="text-xs text-slate-500">{state.chargesPct}%</div>
                </div>
                <div>
                  <Label className="invisible sm:visible">—</Label>
                  <Button variant="outline" onClick={()=>setState(s=>({ ...s, chargesPct: state.autoEntrepreneur ? presets.ae.chargesPct : presets.societe.chargesPct }))} full>Réinitialiser</Button>
                </div>
              </div>

              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer select-none text-slate-700"><ChevronDown className="w-4 h-4 group-open:rotate-180 transition"/> Options avancées</summary>
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Inclure un palier de sécurité (%)</Label>
                    <Input type="number" min={0} max={50} defaultValue={10}
                           onChange={e=>{
                             const safety = Number(e.target.value) || 0;
                             setState(s=>({ ...s, targetNet: Math.round(3000*(1+safety/100)) }));
                           }} />
                    <p className="text-xs text-slate-500 mt-1">Astuce : ajoute une marge pour congés, creux d'activité, etc.</p>
                  </div>
                  <div>
                    <Label>Lien d’affiliation / pub</Label>
                    <Input placeholder="Colle ici un script AdSense/partenaire (pro)" disabled/>
                    <p className="text-xs text-slate-500 mt-1">Zone réservée à la version Pro (facile à activer côté code).</p>
                  </div>
                </div>
              </details>

            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
              <div className="card border-emerald-200 shadow-md">
                <div className="card-header">
                  <div className="card-title flex items-center justify-between">
                    <span className="flex items-center gap-2"><TrendingUp className="w-5 h-5"/>Résultats</span>
                    <span className="text-xs text-slate-500">Lien partageable prêt ↓</span>
                  </div>
                </div>
                <div className="card-content grid grid-cols-2 gap-4">
                  <div className="pill bg-emerald-50">
                    <div className="text-xs uppercase tracking-wide text-emerald-700">TJM conseillé</div>
                    <div className="text-3xl font-bold">{fmt(tjm)} €</div>
                    <div className="text-xs text-slate-500">par jour facturé (≈ {billableDays} j/mois)</div>
                  </div>
                  <div className="pill bg-blue-50">
                    <div className="text-xs uppercase tracking-wide text-blue-700">THM estimé</div>
                    <div className="text-3xl font-bold">{fmt2(thm)} €</div>
                    <div className="text-xs text-slate-500">par heure facturée (≈ {state.hoursPerDay} h/j)</div>
                  </div>
                  <div className="col-span-2 grid sm:grid-cols-3 gap-3">
                    {tiers.map(t => (
                      <div key={t.label} className="p-3 rounded-xl border">
                        <div className="text-xs text-slate-500">{t.label}</div>
                        <div className="text-xl font-semibold">{fmt(t.value)} € / j</div>
                      </div>
                    ))}
                  </div>
                  <div className="col-span-2 text-sm text-slate-600">
                    <p>Chiffre d'affaires requis : <b>{fmt(turnover)} €</b>/mois. Jours facturables estimés : <b>{billableDays}</b>. Ajuste charges et non‑facturable pour coller à ta réalité.</p>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <Button onClick={()=>copy(`${fmt(tjm)} € / jour`)} className="flex-1">Copier le TJM</Button>
                    <Button variant="outline" onClick={share} className="flex-1">Partager</Button>
                  </div>
                </div>
              </div>
            </motion.div>

            <Tabs defaultValue="seo">
              <TabsList>
                <TabsTrigger value="seo">SEO & contenu</TabsTrigger>
                <TabsTrigger value="plan">Monétisation</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
              <TabsContent value="seo">
                <div className="card">
                  <div className="card-content space-y-3 pt-6 text-sm text-slate-700">
                    <p><b>Idées d’articles (SEO)</b> à publier autour de l’outil :</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>"Comment calculer son TJM en 2025 : méthode simple et erreurs à éviter"</li>
                      <li>"Auto‑entrepreneur vs société : quel impact sur le TJM ?"</li>
                      <li>"TJM par métier : développeur, designer, chef de projet – benchmarks"</li>
                      <li>"Jours non facturables : comment les réduire sans s’épuiser"</li>
                    </ul>
                    <p className="text-xs text-slate-500">Astuce : chaque article cible un mot‑clé et renvoie vers le calculateur.</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="plan">
                <div className="card">
                  <div className="card-content space-y-3 pt-6 text-sm text-slate-700">
                    <div className="flex items-center gap-2"><span>✨</span> <b>Plan de monétisation</b></div>
                    <ol className="list-decimal ml-5 space-y-1">
                      <li>Activer <b>Google AdSense</b> sur la page (bloc dans Options avancées).</li>
                      <li>Ajouter des liens <b>d’affiliation</b> (banques pro, outils de facturation, assurances RC pro).</li>
                      <li>Proposer un <b>Pack Pro</b> (5–15 €) : export PDF, sauvegardes, comparatif devis, thèmes.</li>
                      <li>Lancer une <b>newsletter</b> mensuelle "Tarifs & Missions" sponsorisée.</li>
                    </ol>
                    <p className="text-xs text-slate-500">Partenaires possibles : Qonto, Shine, Indy, Freebe, assurances pro, CRM freelances.</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="faq">
                <div className="card">
                  <div className="card-content pt-6 space-y-3 text-sm text-slate-700">
                    <p><b>Le calcul est‑il exact ?</b> C’est une estimation pratique. Pour des décisions fiscales, vois un expert.</p>
                    <p><b>Puis‑je modifier les formules ?</b> Oui, tout est dans ce fichier : ajuste les presets, ajoute des champs.</p>
                    <p><b>Comment l’héberger ?</b> Déploie sur Vercel : connecte ton GitHub, importe le repo, clique sur Deploy.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <footer className="max-w-5xl mx-auto mt-10 pb-10 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TJM Pro. Créé pour te faire gagner du temps — et de l’argent.</p>
        </footer>
      </div>
    </TooltipProvider>
  );
}
