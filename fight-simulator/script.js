// =====================================================
// 📦 1) Données globales
// =====================================================
// Données de base (seulement les stats brutes et infos fixes)
const gameData = {
  personnages: {
    brakmar: {
      nom: "Brakmar",
      for: 10,
      agi: 3,
      int: 5,
      end: 8,
      cha: 6,
      niveau: 11,
      ca: 13,
      reducphy: 2,
      reducmag: 0,
      pv: 25
    },
    draner: {
      nom: "Drânër",
      for: 5,
      agi: 10,
      int: 5,
      end: 6,
      cha: 6,
      niveau: 11,
      ca: 10,
      reducphy: 1,
      reducmag: 0,
      pv: 16
    }
  }
};

// Fonction d’hydratation : calcule automatiquement les bonus à partir des stats
function hydratePersonnages() {
  for (const key in gameData.personnages) {
    const perso = gameData.personnages[key];

    // --- Bonus dégâts ---
    perso.bonusDegatsCAC   = Math.floor(perso.for / 10); // +1 tous les 10 FOR
    perso.bonusDegatsDist  = Math.floor(perso.agi / 10); // +1 tous les 10 AGI
    perso.bonusDegatsSort  = Math.floor(perso.int / 10); // +1 tous les 10 INT
    perso.bonusTacle  = Math.floor(perso.for / 10); // +1 tous les 10 FOR
    perso.bonusEsquive  = Math.floor(perso.agi / 10); // +1 tous les 10 AGI


    // --- Bonus jets de caractéristiques ---
    perso.bonusJetFor = Math.floor(perso.for / 5);  // +1 tous les 5 FOR
    perso.bonusJetAgi = Math.floor(perso.agi / 5);  // +1 tous les 5 AGI
    perso.bonusJetInt = Math.floor(perso.int / 5);  // +1 tous les 5 INT
    perso.bonusJetCha = Math.floor(perso.cha / 3);  // +1 tous les 3 CHA
    perso.bonusJetEnd = Math.floor(perso.end / 5);  // +1 tous les 5 END

    // --- Spécial ---
    perso.bonusApprivoiser = Math.floor(perso.cha / 5); // compagnons
    perso.poidsMax = 20 + perso.for * 2; // poids transportable
  }
}

hydratePersonnages();

window.gameData = gameData;
// Exemple d’utilisation (pas de changement dans ton code actuel)
const perso = gameData.personnages["brakmar"];
console.log(perso);


// ============================================
// 🔗 2) Raccourcis DOM
// ============================================
const persoSelect = document.getElementById('personnage');
const statsDiv = document.getElementById('statsPerso');
const armeSelect = document.getElementById('arme');
const historiqueDiv = document.getElementById('historique');
const seuilInput = document.getElementById('seuilToucher');
const bonusContextInput = document.getElementById('bonusContext');
const resultatDiv = document.getElementById('resultat');
const resumeDiv = document.getElementById('resume');

let historique = [];

// =====================================================
// 🧾 3) Affichage des stats
// =====================================================
function afficherStats() {
  const id = persoSelect.value;
  const perso = gameData.personnages[id];

  if (!perso) {
    statsDiv.textContent = "Sélectionnez un personnage";
    return;
  }

  statsDiv.innerHTML = `
    <h3 id="statsTitle">Stats de ${perso.nom}</h3>

    <div class="table-wrapper">
      <table>
        <tr><th>Caractéristiques</th><th>Stats</th><th>Bonus tests</th></tr>
        <tr><td>FOR</td><td>${perso.for}</td><td>${perso.bonusJetFor}</td></tr>
        <tr><td>AGI</td><td>${perso.agi}</td><td>${perso.bonusJetAgi}</td></tr>
        <tr><td>INT</td><td>${perso.int}</td><td>${perso.bonusJetInt}</td></tr>
        <tr><td>END</td><td>${perso.end}</td><td>${perso.bonusJetEnd}</td></tr>
        <tr><td>CHA</td><td>${perso.cha}</td><td>${perso.bonusJetCha}</td></tr>
      </table>
    </div>

    <div class="table-wrapper">
      <table>
        <tr><th>Combat</th><th>Corps à Corps</th><th>À Distance</th></tr>
        <tr><td></td><td>${perso.bonusDegatsCAC}</td><td>${perso.bonusDegatsDist}</td></tr>
        <tr><th>Spécial</th><th>Tacle</th><th>Esquive</th></tr>
        <tr><td></td><td>${perso.bonusTacle}</td><td>${perso.bonusEsquive}</td></tr>
      </table>
    </div>

    <div class="table-wrapper">
      <table>
        <tr><th>Niveau</th><td>${perso.niveau}</td></tr>
        <tr><th>Classe d'armure</th><td>${perso.ca}</td></tr>
        <tr><th>Réduction des dégâts physiques</th><td>${perso.reducphy}</td></tr>
        <tr><th>Réduction des dégâts magiques</th><td>${perso.reducmag}</td></tr>
        <tr><th>PV max</th><td>${perso.pv}</td></tr>
      </table>
    </div>
  `;
}

// Event listener
persoSelect.addEventListener('change', afficherStats);
afficherStats();


// =====================================================
// 🎲 4) Utilitaires de dés (identiques à l’existant)
// =====================================================
function rollDice(expr) {
  // Exemple d'expr : "2d10+4" ou "1d6-2"
  const regex = /^(\d+)d(\d+)([+-]\d+)?$/i;
  const match = expr.match(regex);
  if (!match) {
    throw new Error("Expression de dé invalide : " + expr);
  }
  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const bonus = match[3] ? parseInt(match[3], 10) : 0;

  let rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  const totalRoll = rolls.reduce((a, b) => a + b, 0);
  let total = totalRoll + bonus;

  // Dégâts minimum 1
  if (total < 1) total = 1;

  return { total, rolls, bonus };
}

// =====================================================
// ⚔️ 5) Lancer d’un personnage 
//     - CàC : d20 + bonus ; 1 = échec critique ; 20 = critique (dégâts doublés)
//     - Distance : d6 pour toucher, dégâts = formule + bonusDist + contexte
//     - Tests : d20 + bonus de la carac
//     - Parsing dégâts "XdY+Z" inchangé
// =====================================================
function lancerDe() {
  const id = persoSelect.value;
  const perso = gameData.personnages[id];
  const persoNom = perso.nom;

  const bonusContext = parseInt(bonusContextInput.value) || 0;
  const seuil = parseInt(seuilInput.value) || 10;

  const armeOpt = armeSelect.options[armeSelect.selectedIndex];
  const armeNom = armeOpt.textContent;
  const armeType = armeOpt.dataset.type;
  const armeValeur = armeOpt.value;

  let echecCritique = false;
  let successCritique = false;
  let touche = false;
  let resultatTexte = "";
  let resumeTexte = "";
  let jetToucher = 0;
  let degats = 0;

  if (armeType === "cac") {
    // d20 au CàC + gestion critiques
    const jetToucherObj = rollDice("1d20");
    jetToucher = jetToucherObj.total;

    if (jetToucher === 1) echecCritique = true;
    if (jetToucher === 20) successCritique = true;

    // ⚠️ On suit ta version : pas de bonusTest ici (tu l’avais à 0)
    const bonusTest = 0;
    const totalToucher = jetToucher + bonusTest + bonusContext;
    touche = totalToucher >= seuil;

    let toucherParts = [`${jetToucher}`];
    if (bonusTest !== 0) toucherParts.push(`bonus test (${bonusTest})`);
    if (bonusContext !== 0) toucherParts.push(`bonus contexte (${bonusContext})`);
    resumeTexte += `Jet pour toucher (1d20) : ${toucherParts.join(' + ')} = ${totalToucher}\n`;
    resumeTexte += touche ? "=> Touché\n" : "=> Raté\n";

    // Séparation dés et bonus fixe dans l'arme (ex: "2d10+4")
    const armeValeurClean = armeValeur.replace(/\s+/g, "");
    const match = armeValeurClean.match(/^(\d+d\d+)([+-]\d+)?$/);
    let formuleDes = armeValeurClean;
    let bonusArmeFixe = 0;
    if (match) {
      formuleDes = match[1]; // ex: "2d10"
      bonusArmeFixe = parseInt(match[2] || "0", 10); // ex: "+4"
    }

    if (!touche) {
      if (echecCritique) {
        degats = 0;
        resumeTexte += `💥 Échec critique : ${persoNom} perd son prochain tour.\n`;
        resultatTexte = `💀 Échec critique ! → ${persoNom} passe son prochain tour.`;
      } else {
        resultatTexte = "Résultat : Échec.";
      }
    } else {
      const degatsRollObj = rollDice(formuleDes);

      if (successCritique) {
        const baseDegats = degatsRollObj.total + bonusArmeFixe;
        const degatsJetDouble = baseDegats * 2;
        degats = degatsJetDouble + perso.bonusDegatsCAC + bonusContext;
        if (degats < 1) degats = 1;

        let degatsParts = [`( ${degatsRollObj.rolls.join(' + ')} )`];
        if (bonusArmeFixe !== 0) degatsParts.push(`+ ${bonusArmeFixe}`);
        const baseDegatsTexte = degatsParts.join(' ');

        resumeTexte += `💥 Dégâts critiques : (${baseDegatsTexte}) × 2 = ${degatsJetDouble}`;

        let bonusParts = [];
        if (perso.bonusDegatsCAC !== 0) bonusParts.push(`+ CàC (${perso.bonusDegatsCAC})`);
        if (bonusContext !== 0) bonusParts.push(`+ Contexte (${bonusContext})`);
        resumeTexte += ` ${bonusParts.join(' ')} = ${degats}\n`;

        resultatTexte = `🎯 Coup critique ! → Dégâts doublés : ${degats}`;
      } else {
        // Normal hit
        const degatsRollObj2 = rollDice(formuleDes);
        degats = degatsRollObj2.total + bonusArmeFixe + perso.bonusDegatsCAC + bonusContext;
        if (degats < 1) degats = 1;

        let degatsParts = [];
        if (degatsRollObj2.rolls.length > 0) degatsParts.push(`( ${degatsRollObj2.rolls.join(' + ')} )`);
        if (bonusArmeFixe !== 0) degatsParts.push(`+ ${bonusArmeFixe}`);
        if (perso.bonusDegatsCAC !== 0) degatsParts.push(`+ CàC (${perso.bonusDegatsCAC})`);
        if (bonusContext !== 0) degatsParts.push(`+ Contexte (${bonusContext})`);

        resumeTexte += `Dégâts : ${degatsParts.join(' ')} = ${degats}\n`;
        resultatTexte = `Touché ! (${jetToucher}) → Dégâts infligés : ${degats}`;
      }
    }

  } else if (armeType === "distance") {
    // À distance : ton code d’origine → jet 1d6 vs seuil (CT gérée côté PNJ)
    const jetToucherObj = rollDice("1d6");
    jetToucher = jetToucherObj.total;
    touche = jetToucher >= seuil;
    resumeTexte += `Jet pour toucher (1d6) : ${jetToucher} vs seuil (${seuil})\n`;
    resumeTexte += touche ? "=> Touché\n" : "=> Raté\n";
    if (!touche) {
      resultatTexte = "Résultat : Échec.";
    } else {
      const degatsRollObj = rollDice(armeValeur);
      degats = degatsRollObj.total + perso.bonusDegatsDistist + bonusContext;
      if (degats < 1) degats = 1;

      let degatsParts = [];
      if (degatsRollObj.rolls.length > 0) degatsParts.push(degatsRollObj.rolls.join(' + '));
      if (perso.bonusDegatsDistist !== 0) degatsParts.push(`bonus distance (${perso.bonusDegatsDistist})`);
      if (bonusContext !== 0) degatsParts.push(`bonus contexte (${bonusContext})`);
      resumeTexte += `Dégâts (jets + bonus) : ${degatsParts.join(' + ')} = ${degats}\n`;

      resultatTexte = `Touché ! (${jetToucher}) Dégâts infligés : ${degats}`;
    }

  } else if (armeType === "test") {
    // Test de carac : 1d20 + bonus de la carac + contexte
    const jetToucherObj = rollDice("1d20");
    jetToucher = jetToucherObj.total;
    let bonusTest = 0;
    switch (armeOpt.dataset.stat) {
    case "for": bonusTest = perso.bonusJetFor; break;
    case "agi": bonusTest = perso.bonusJetAgi; break;
    case "int": bonusTest = perso.bonusJetInt; break;
    case "end": bonusTest = perso.bonusJetEnd; break;
    case "cha": bonusTest = perso.bonusJetCha; break;
  }
    const totalTest = jetToucher + bonusTest + bonusContext;
    if (jetToucher === 1) echecCritique = true;
    if (jetToucher === 20) successCritique = true;

    touche = totalTest >= seuil;
    resumeTexte += `Jet de test (1d20) : ${jetToucher} + bonus test (${bonusTest}) + bonus contexte (${bonusContext}) = ${totalTest}\n`;
    resumeTexte += touche ? "=> Réussite\n" : "=> Échec\n";
    if (echecCritique) {
      resultatTexte = "Résultat : Échec critique !";
    } else if (successCritique) {
      resultatTexte = "Résultat : Succès critique !";
    } else if (!touche) {
      resultatTexte = "Résultat : Échec.";
    } else {
      resultatTexte = "Résultat : Réussite.";
    }
  } else {
    resultatTexte = "Type d'arme/test inconnu.";
  }

  const date = new Date().toLocaleTimeString();
  if ((armeType === "cac" || armeType === "distance") && touche) {
    historique.unshift(`[${date}] ${armeNom} => Touché ! (${jetToucher}) Dégâts infligés : ${degats}`);
  } else {
    historique.unshift(`[${date}] ${armeNom} => ${resultatTexte} (${jetToucher})`);
  }
  if (historique.length > 10) historique.pop();
  historiqueDiv.textContent = historique.join('\n');

  resultatDiv.textContent = resultatTexte;
  resumeDiv.textContent = resumeTexte;
}

// =====================================================
// 👹 6) Attaque PNJ
//     - CàC : d20 (1 = échec crit, 20 = crit dégâts ×2)
//     - Distance : d6 vs CT (1 = échec)
// =====================================================
function attaquePNJ() {
  try {
    const nomEl = document.getElementById("nomPNJ");
    const ctEl = document.getElementById("ctPNJ");
    const attaqueEl = document.getElementById("attaquePNJ");
    const degatsEl = document.getElementById("degatsPNJ");
    const cibleSel = document.getElementById("ciblePNJ");

    const type = document.getElementById('attackTypePNJSelect').value;

    const nom = nomEl ? (nomEl.value.trim() || "PNJ") : "PNJ";
    const ct = ctEl ? (parseInt(ctEl.value, 10) || 0) : 0;
    const attaqueNom = attaqueEl ? (attaqueEl.value.trim() || "Attaque") : "Attaque";
    const degatsExpr = degatsEl ? (degatsEl.value.trim() || "1d6") : "1d6";
    const cibleId = cibleSel ? (cibleSel.value) : null;
    const cible = cibleId ? gameData.personnages[cibleId] : null;

    const cibleLabel = cible ? cible.nom : (cibleId || "Cible");
    const caCible = cible ? cible.ca : 0;
    const reducPhy = cible ? cible.reducphy : 0;

    let jetToucher = 0;
    let touche = false;
    let echecCrit = false;
    let succesCrit = false;
    let degats = 0;
    let resumeText = "";
    let resultatText = "";

    if (type === "cac") {
      const jet = rollDice("1d20");
      jetToucher = jet.total;

      if (jetToucher === 1) {
        echecCrit = true;
        resultatText = `💥 Échec critique : ${nom} passe son prochain tour !`;
      } else {
        if (jetToucher === 20) succesCrit = true;
        touche = jetToucher >= caCible;
        resumeText += `Jet pour toucher (1d20) : ${jetToucher} = ${jetToucher}\n`;
        resumeText += touche ? "=> Touché\n" : "=> Raté\n";

        if (touche) {
          // Parse dégâts "XdY+Z"
          const exprClean = degatsExpr.replace(/\s+/g, "");
          const m = exprClean.match(/^(\d+d\d+)([+-]\d+)?$/);
          let formule = exprClean;
          let bonusFixe = 0;
          if (m) {
            formule = m[1];
            bonusFixe = parseInt(m[2] || "0", 10);
          }
          const rollD = rollDice(formule);
          const baseDeg = rollD.total + bonusFixe - reducPhy;
          const basePos = baseDeg < 1 ? 1 : baseDeg;

          if (succesCrit) {
            degats = basePos * 2;
            resumeText += `💥 Dégâts critiques : ( ${rollD.rolls.join(" + ")} )${bonusFixe !== 0 ? ` + ${bonusFixe}` : ""} - Réduc (${reducPhy}) × 2 = ${degats}\n`;
            resultatText = `🎯 Coup critique de ${nom} ! (20) → ${cibleLabel} reçoit ${degats} dégâts`;
          } else {
            degats = basePos;
            resumeText += `Dégâts : ( ${rollD.rolls.join(" + ")} )${bonusFixe !== 0 ? ` + ${bonusFixe}` : ""} - Réduc (${reducPhy}) = ${degats}\n`;
            resultatText = `${nom} touche ${cibleLabel} ! (${jetToucher}) et lui inflige : ${degats} dégât(s).`;
          }
        } else {
          resumeText += `Jet pour toucher (1d20) : ${jetToucher} vs CA (${caCible}) => Raté\n`;
          resultatText = `${nom} rate son attaque (${jetToucher}).`;
        }
      }

    } else if (type === "distance") {
      // Règle existante : 1d6, 1 = échec, sinon réussite si >= CT
      const jet = rollDice("1d6");
      jetToucher = jet.total;
      touche = (jetToucher > 1) && (jetToucher >= ct);
      resumeText += `Jet pour toucher (1d6) : ${jetToucher} = ${jetToucher}\n`;
      resumeText += touche ? "=> Touché\n" : "=> Raté\n";
      if (touche) {
        const rollD = rollDice(degatsExpr);
        degats = rollD.total - reducPhy;
        if (degats < 1) degats = 1;
        resumeText += `Dégâts : ( ${rollD.rolls.join(" + ")} ) - Réduc (${reducPhy}) = ${degats}\n`;
        resultatText = `${nom} → ${cibleLabel} Touché ! (${jetToucher}) → Dégât(s) infligé(s) : ${degats}`;
      } else {
        resumeText += `Jet pour toucher (1d6) : ${jetToucher} vs CT (${ct}) => Raté\n`;
        resultatText = `❌ Échec (${jetToucher} < CT ${ct}).`;
      }
    } else {
      resultatText = "Type d'attaque PNJ inconnu.";
    }

    // Historique partagé (max 10)
    const date = new Date().toLocaleTimeString();
    if (touche) {
      historique.unshift(`[${date}] ${attaqueNom} (${nom} → ${cibleLabel}) => Touché ! (${jetToucher}) Dégâts infligés : ${degats}`);
    } else {
      const tag = (echecCrit ? "Échec critique" : "Échec");
      historique.unshift(`[${date}] ${attaqueNom} (${nom} → ${cibleLabel}) => ${tag} (${jetToucher})`);
    }
    if (historique.length > 10) historique.pop();
    historiqueDiv.textContent = historique.join('\n');

    const out = document.getElementById('resultatPNJ');
    if (out) out.textContent = resultatText + (resumeText ? ("\n" + resumeText) : "");

  } catch (err) {
    console.error("Erreur dans attaquePNJ :", err);
    const out = document.getElementById('resultatPNJ');
    if (out) out.textContent = "Erreur : expression de dégâts invalide ou élément absent.";
  }
}

// =====================================================
// 🐾 7) Données Chasse 
// =====================================================
const chasseData = {
  ville: [
    {min:6,max:9,animal:"un lapin",jets:{FOR:12,AGI:8,CHA:null},loot:[{t:"ration(s) de viande",q:"0-1"},{t:"fourrure de Lapin",q:"0-1"}],degats:"0"},
    {min:10,max:11,animal:"un faisan",jets:{FOR:14,AGI:10,CHA:null},loot:[{t:"ration(s) de viande",q:"0-1"},{t:"plume(s) de Faisan",q:"0-4"}],degats:"0"},
    {min:12,max:16,animal:"un sanglier",jets:{FOR:12,AGI:14,CHA:null},loot:[{t:"ration(s) de viande",q:"1-3"},{t:"cuir(s) de Sanglier",q:"1d3"}],degats:"1d6"},
    {min:17,max:200,animal:"un chien errant",jets:{FOR:12,AGI:12,CHA:14},loot:[{t:"ration(s) de viande",q:"1-2"}],degats:"1d6"}
  ],
  foret: [
    {min:9,max:10,animal:"un renard",jets:{FOR:13,AGI:10,CHA:12},loot:[{t:"ration(s) de viande",q:"2d1"},{t:"fourrure de Renard",q:"0-1"}],degats:"1"},
    {min:11,max:13,animal:"une biche",jets:{FOR:14,AGI:13,CHA:null},loot:[{t:"ration(s) de viande",q:"2-3"}],degats:"1d4"},
    {min:15,max:17,animal:"un loup",jets:{FOR:12,AGI:13,CHA:14},loot:[{t:"ration(s) de viande",q:"2d1"},{t:"croc(s) de Loup",q:"0-2"}],degats:"1d6"},
    {min:18,max:200,animal:"un ours",jets:{FOR:14,AGI:16,CHA:null},loot:[{t:"ration(s) de viande",q:"2-5"},{t:"fourrure(s) épaisse d’Ours",q:"0-1"}],degats:"2d6"}
  ],
  marais: [
    {min:5,max:9,animal:"une grenouille",jets:{FOR:10,AGI:6,CHA:null},loot:[{t:"ration(s) de viande",q:"1d1"}],degats:"0"},
    {min:10,max:14,animal:"un serpent",jets:{FOR:10,AGI:8,CHA:12},loot:[{t:"ration(s) de viande",q:"1d1"},{t:"peau de serpent",de:"0-1"},{t:"venin(s) puissant",q:"1d1"}],degats:"1d4"},
    {min:15,max:17,animal:"une tortue géante",jets:{FOR:11,AGI:14,CHA:null},loot:[{t:"ration(s) de viande",q:"2d1"},{t:"carapace de Tortue géante",q:"0-1"}],degats:"1d4"},
    {min:18,max:200,animal:"un crocodile",jets:{FOR:14,AGI:15,CHA:null},loot:[{t:"ration(s) de viande",q:"2-5"},{t:"cuir(s) renforcé(s) de Crocodile",q:"1d3"}],degats:"2d6"}
  ],
  montagne: [
    {min:10,max:12,animal:"une chèvre sauvage",jets:{FOR:12,AGI:10,CHA:12},loot:[{t:"ration(s) de viande",q:"1-3"},{t:"corne(s) de Chèvre",q:"1d3"}],degats:"1"},
    {min:13,max:16,animal:"un aigle",jets:{FOR:18,AGI:12,CHA:14},loot:[{t:"ration(s) de viande",q:"0-2"},{t:"plume(s) d'Aigle",q:"0-4"}],degats:"1d6"},
    {min:17,max:19,animal:"un lynx",jets:{FOR:14,AGI:16,CHA:14},loot:[{t:"ration(s) de viande",q:"1-2"},{t:"fourrure(s) de Lynx",de:"1d3"}],degats:"1d6"},
    {min:20,max:200,animal:"un yéti",jets:{FOR:18,AGI:18,CHA:null},loot:[{t:"ration(s) de viande",q:"5-10"},{t:"fourrure(s) légendaire de Yéti",q:"1d3"}],degats:"3d6"}
  ],
  plaine: [
    {min:6,max:10,animal:"unlézard",jets:{FOR:14,AGI:10,CHA:12},loot:[{t:"peau de Lézard",q:"1d1"}],degats:"0"},
    {min:11,max:13,animal:"un scorpion géant",jets:{FOR:12,AGI:12,CHA:null},loot:[{t:"venin(s) puissant",q:"1d3"}],degats:"1d6"},
    {min:14,max:19,animal:"une antilope",jets:{FOR:14,AGI:12,CHA:null},loot:[{t:"ration(s) de viande"},{t:"cuir(s) d’Antilope",q:"1d3"}],degats:"1d4"},
    {min:20,max:200,animal:"un ver des sables",jets:{FOR:18,AGI:18,CHA:null},loot:[{t:"ration(s) de viande",q:"5-10"},{t:"cuir(s) titanesque de Ver",q:"1d3"}],degats:"3d6"}
  ]
};

// =====================================================
// 🎲 8) Utilitaires chasse
// =====================================================
function lancerDes(faces) {
  return Math.floor(Math.random() * faces) + 1;
}

function evalDegats(expr) {
  if (!expr || expr === "0") return 0;

  // Cas "XdY" classique
  let match = expr.match(/(\d+)d(\d+)/);
  if (match) {
    const [, n, faces] = match;
    let total = 0;
    for (let i = 0; i < parseInt(n, 10); i++) {
      total += lancerDes(parseInt(faces, 10));
    }
    return total;
  }

  // Cas "X-Y" pour les loot comme 0-2
  match = expr.match(/(\d+)-(\d+)/);
  if (match) {
    const [, min, max] = match;
    return Math.floor(Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1)) + parseInt(min, 10);
  }

  return parseInt(expr, 10) || 0;
}

function trouverAnimal(zone, jetPistage) {
  const animaux = chasseData[zone] || [];
  return animaux.find(a => jetPistage >= a.min && jetPistage <= a.max) || null;
}

// =====================================================
// 🏹 9) Lancer la chasse
// =====================================================
function lancerChasse() {
  const nameSelect = document.getElementById('nomChasseur');
  const chasseurId = nameSelect.value;
  const chasseur = gameData.personnages[chasseurId];
  const nomChasseur = chasseur ? chasseur.nom : chasseurId;

  const zone = document.getElementById("zoneChasse").value;
  const duree = parseInt(document.getElementById("tempsChasse").value, 10);
  const methode = document.getElementById("methodeChasse").value;
  const priorite = document.getElementById("prioriteChasse").value;
  const bonusPistage = parseInt(document.getElementById("bonusPistage").value, 10) || 0;
  const bonusChasse = parseInt(document.getElementById("bonusChasse").value, 10) || 0;
  let pvActuels = parseInt(document.getElementById("pvActuels").value, 10) || (chasseur ? chasseur.pv : 10);

  let pvPerdus = 0;
  let butin = [];
  let compagnons = [];
  let log = [];
  let cible = null; // animal en cours de combat

  for (let h = 1; h <= duree; h++) {
    if (pvActuels <= 0) break;

    if (!cible) {
      const jetPistage = lancerDes(20) + bonusPistage;
      cible = trouverAnimal(zone, jetPistage);

      if (!cible) {
        log.push(`- *Heure ${h}* : Jet de pistage ${jetPistage} → Rien trouvé.`);
        continue;
      }
      log.push(`- *Heure ${h}* : Jet de pistage ${jetPistage} → ${nomChasseur} rencontre *${cible.animal}* !`);
    } else {
      log.push(`- *Heure ${h}* : ${nomChasseur} continue le combat contre *${cible.animal}*.`);
    }

    const jetAction = lancerDes(20) + bonusChasse;
    const seuil = methode === "brutale" ? cible.jets.FOR :
                  methode === "discrete" ? cible.jets.AGI :
                  cible.jets.CHA;

    if (methode === "apprivoisement" || priorite === "compagnon") {
      if (seuil && jetAction >= seuil) {
        compagnons.push(cible.animal);
        log.push(`    - Jet CHA ${jetAction} (≥ ${seuil}) → Succès ! ${cible.animal} devient un compagnon 🐾`);
        cible = null;
      } else {
        const dmg = evalDegats(cible.degats);
        pvActuels -= dmg;
        pvPerdus += dmg;
        log.push(`    - Jet CHA ${jetAction} (< ${seuil}) → Échec, ${cible.animal} riposte (-${dmg} PV, reste ${pvActuels}).`);
      }
    } else {
      if (seuil && jetAction >= seuil) {
        let lootTrouve = [];
        cible.loot.forEach(obj => {
          const quantite = evalDegats(obj.q || obj.de || "1");
          if (quantite > 0) lootTrouve.push(`${quantite} ${obj.t}`);
        });
        butin.push(...lootTrouve);
        log.push(`    - Jet ${jetAction} (≥ ${seuil}) → Succès ! ${cible.animal} est vaincu et rapporte *${lootTrouve.join(", ")}*.`);
        cible = null;
      } else {
        const dmg = evalDegats(cible.degats);
        pvActuels -= dmg;
        pvPerdus += dmg;
        log.push(`    - Jet ${jetAction} (< ${seuil}) → Échec, ${cible.animal} riposte (-${dmg} PV, reste ${pvActuels}).`);
      }
    }

    if (pvActuels <= 0) {
      log.push(`💀 ${nomChasseur} est épuisé !`);
      butin = [];
      compagnons = [];
      pvActuels = 1; // il rentre en rampant
      break;
    }
  }

  // Regrouper les loots par type
  const lootCompteur = {};
  butin.forEach(item => {
    const match = item.match(/(\d+)\s+(.+)/);
    if (match) {
      const quantite = parseInt(match[1], 10);
      const type = match[2];
      if (!lootCompteur[type]) lootCompteur[type] = 0;
      lootCompteur[type] += quantite;
    }
  });
  const butinRegroupe = Object.entries(lootCompteur).map(([type, quantite]) => `${quantite} ${type}`);

  // Affichage du résumé
  document.getElementById("resultatChasse").innerHTML =
    `### Résumé de la chasse<br>` +
    log.join("<br>") + `<br><br>` +
    `<strong>Bilan : ${nomChasseur}</strong><br>` +
    `PV restants : ${pvActuels}<br>` +
    `PV perdus : ${pvPerdus}<br>` +
    `Butin : ${butinRegroupe.join(", ") || "Aucun"}<br>` +
    `Compagnons : ${compagnons.join(", ") || "Aucun"}`;

  // Historique (max 10)
  const historiqueDivLocal = document.getElementById("historique"); 
  if (!window.historiqueChasses) window.historiqueChasses = []; 

  const date = new Date().toLocaleTimeString();
  const texteBilan = `[${date}] ${nomChasseur} : PV ${pvActuels}, PV perdus ${pvPerdus}, Butin : ${butinRegroupe.join(", ") || "Aucun"}, Compagnons : ${compagnons.join(", ") || "Aucun"}`;

  window.historiqueChasses.unshift(texteBilan);
  if (window.historiqueChasses.length > 10) window.historiqueChasses.pop();

  historiqueDivLocal.textContent = window.historiqueChasses.join("\n---\n");
}

// =====================================================
// 🧭 10) Initialisations DOMContentLoaded
//      (updateTestLabels, menu, onglets, CT distance…)
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
  // === updateTestLabels ===
  function updateTestLabels() {
    const idPerso = persoSelect.value;
    const perso = gameData.personnages[idPerso];

    const statLabels = {
      for: "Force",
      agi: "Agilité",
      int: "Intelligence",
      end: "Endurance",
      cha: "Charisme"
    };

    const bonusMapping = {
      for: "bonusJetFor",
      agi: "bonusJetAgi",
      int: "bonusJetInt",
      end: "bonusJetEnd",
      cha: "bonusJetCha"
    };

    for (const option of armeSelect.querySelectorAll("option[data-type='test']")) {
      const stat = option.dataset.stat; // "for", "agi", ...
      const bonusKey = bonusMapping[stat];
      const bonus = perso ? (perso[bonusKey] ?? 0) : 0;
      const baseLabel = statLabels[stat] || stat;
      option.textContent = `${baseLabel} (${bonus >= 0 ? "+" : ""}${bonus})`;
    }
  }

  persoSelect.addEventListener("change", updateTestLabels);
  updateTestLabels();
});

  // === MENU TOGGLE + OVERLAY ===
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".overlay");
  const closeSidebar = document.querySelector(".close-sidebar");

  function toggleSidebar() {
    sidebar.classList.toggle("open");
    if (overlay) overlay.classList.toggle("show");
  }

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", toggleSidebar);
  }

  if (closeSidebar) {
    closeSidebar.addEventListener("click", toggleSidebar);
  }

  if (overlay) {
    overlay.addEventListener("click", toggleSidebar);
  }

  // === GESTION AFFICHAGE CT SI ATTAQUE À DISTANCE ===
  const attackTypePNJSelect = document.getElementById('attackTypePNJSelect');
  const ctPNJContainer = document.getElementById('ctPNJContainer');

  if (attackTypePNJSelect && ctPNJContainer) {
    attackTypePNJSelect.addEventListener('change', () => {
      if (attackTypePNJSelect.value === 'distance') {
        ctPNJContainer.style.display = 'block';
      } else {
        ctPNJContainer.style.display = 'none';
      }
    });
  }

  // === GESTION DES ONGLETS ===
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  if (tabButtons.length && tabContents.length) {
    tabButtons.forEach(button => {
      button.addEventListener('click', function () {
        // Retire "active" sur tous les boutons
        tabButtons.forEach(b => b.classList.remove('active'));
        // Cache tous les contenus
        tabContents.forEach(c => {
          c.classList.remove('active');
          c.style.display = 'none';
        });

        // Active le bouton cliqué
        this.classList.add('active');

        // Affiche le contenu correspondant
        const targetId = 'tab-' + this.dataset.tab;
        const target = document.getElementById(targetId);
        if (target) {
          target.classList.add('active');
          target.style.display = '';
        }
      });
    });

    // S'assure que le contenu initial reste visible
    const initial = document.querySelector('.tab-content.active');
    if (initial) initial.style.display = '';
  }

// (Duplicata d’onglets
const tabs = document.querySelectorAll('.tab-button');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach((tab, idx) => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    contents[idx].classList.add('active');
  });
});
