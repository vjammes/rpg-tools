// --------------------
// script.js (version complète à copier/coller)
// --------------------

const persoSelect = document.getElementById('personnage');
const persoNom = persoSelect.options[persoSelect.selectedIndex].text;
const statsDiv = document.getElementById('statsPerso');
const armeSelect = document.getElementById('arme');
const historiqueDiv = document.getElementById('historique');
const seuilInput = document.getElementById('seuilToucher');
const bonusContextInput = document.getElementById('bonusContext');
const resultatDiv = document.getElementById('resultat');
const resumeDiv = document.getElementById('resume');

let historique = [];

function afficherStats() {
  const opt = persoSelect.options[persoSelect.selectedIndex];
  const persoNom = opt.text;
  const forVal = opt.dataset.for;
  const agilVal = opt.dataset.agi;
  const intVal = opt.dataset.int;
  const endVal = opt.dataset.end;
  const chaVal = opt.dataset.cha;
  const niveau = opt.dataset.niveau;
  const ca = opt.dataset.ca;
  const reducphy = parseInt(opt.dataset.reducphy);
  const reducmag = parseInt(opt.dataset.reducmag);
  const pvMax = parseInt(opt.dataset.pv);
  const bonusFor = parseInt(opt.dataset.bonusfor);
  const bonusAgi = parseInt(opt.dataset.bonusagi);
  const bonusInt = parseInt(opt.dataset.bonusint);
  const bonusEnd = parseInt(opt.dataset.bonusend);
  const bonusCha = parseInt(opt.dataset.bonuscha);
  const combatCac = parseInt(opt.dataset.combatcac);
  const combatDist = parseInt(opt.dataset.combatdist);
  const tacle = parseInt(opt.dataset.tacle);
  const esquive = parseInt(opt.dataset.esquive);
  const chasse = parseInt(opt.dataset.esquive);
  const pistage = parseInt(opt.dataset.esquive);
  const apprivoisement = parseInt(opt.dataset.esquive);


  statsDiv.innerHTML = `
    <h3 id="statsTitle">Stats de ${persoNom}</h3>
      <div class="table-wrapper">
        <table>
          <tr><th>Caractéristiques</th><th>Stats</th><th>Bonus tests</th></tr>
          <tr><td>FOR</td><td>${forVal}</td><td>${bonusFor}</td></tr>
          <tr><td>AGI</td><td>${agilVal}</td><td>${bonusAgi}</td></tr>
          <tr><td>INT</td><td>${intVal}</td><td>${bonusInt}</td></tr>
          <tr><td>END</td><td>${endVal}</td><td>${bonusEnd}</td></tr>
          <tr><td>CHA</td><td>${chaVal}</td><td>${bonusCha}</td></tr>
        </table>
      </div>
      <div class="table-wrapper">
        <table>
          <tr><th>Combat</th><th>Corps à Corps</th><th>À Distance</th></tr>
          <tr><td></td><td>${combatCac}</td><td>${combatDist}</td></tr>
          <tr><th>Contact</th><th>Tacle</th><th>Esquive</th></tr>
          <tr><td></td><td>${tacle}</td><td>${esquive}</td></tr>
        </table>
      </div>
      <div class="table-wrapper">
        <table>
          <tr><th>Niveau</th><td>${niveau}</td></tr>
          <tr><th>Classe d'armure</th><td>${ca}</td></tr>
          <tr><th>Réduction des dégâts physiques</th><td>${reducphy}</td></tr>
          <tr><th>Réduction des dégâts magiques</th><td>${reducmag}</td></tr>
          <tr><th>PV max</th><td>${pvMax}</td></tr>
        </table>
      </div>
    `;
}
persoSelect.addEventListener('change', afficherStats);
afficherStats();

function rollDice(expr) {
  // Exemple d'expr : "2d10+4" ou "1d6-2"
  const regex = /^(\d+)d(\d+)([+-]\d+)?$/i;
  const match = expr.match(regex);
  if (!match) {
    throw new Error("Expression de dé invalide : " + expr);
  }
  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const bonus = match[3] ? parseInt(match[3]) : 0;

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

function lancerDe() {
  const optPerso = persoSelect.options[persoSelect.selectedIndex];
  const perso = {
    bonusFor: parseInt(optPerso.dataset.bonusfor),
    bonusAgi: parseInt(optPerso.dataset.bonusagi),
    bonusInt: parseInt(optPerso.dataset.bonusint),
    bonusEnd: parseInt(optPerso.dataset.bonusend),
    bonusCha: parseInt(optPerso.dataset.bonuscha),
    combatCac: parseInt(optPerso.dataset.combatcac),
    combatDist: parseInt(optPerso.dataset.combatdist),
  };

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

    // const jetToucherObj = { total: 20, rolls: [20] }; // Simule un vrai jet de 20
    // jetToucher = 20; // Valeur à simuler

    const jetToucherObj = rollDice("1d20");
    jetToucher = jetToucherObj.total;

    if (jetToucher === 1) echecCritique = true;
    if (jetToucher === 20) successCritique = true;

    const bonusTest = 0;
    const totalToucher = jetToucher + bonusTest + bonusContext;
    touche = totalToucher >= seuil;

    let toucherParts = [`${jetToucher}`];
    if (bonusTest !== 0) toucherParts.push(`bonus test (${bonusTest})`);
    if (bonusContext !== 0) toucherParts.push(`bonus contexte (${bonusContext})`);
    resumeTexte += `Jet pour toucher (1d20) : ${toucherParts.join(' + ')} = ${totalToucher}\n`;
    resumeTexte += touche ? "=> Touché\n" : "=> Raté\n";

    // Séparation dés et bonus fixe dans l'arme (ex: "2d10+4")
    // Nettoyage de la chaîne armeValeur
    const armeValeurClean = armeValeur.replace(/\s+/g, "");
    console.log("armeValeurClean =", armeValeurClean);

    const match = armeValeurClean.match(/^(\d+d\d+)([+-]\d+)?$/);

    let formuleDes = armeValeurClean;
    let bonusArmeFixe = 0;

    if (match) {
      formuleDes = match[1]; // ex: "2d10"
      bonusArmeFixe = parseInt(match[2] || "0"); // ex: "+4"
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
        degats = degatsJetDouble + perso.combatCac + bonusContext;
        if (degats < 1) degats = 1;

        let degatsParts = [`( ${degatsRollObj.rolls.join(' + ')} )`];
        if (bonusArmeFixe !== 0) degatsParts.push(`+ ${bonusArmeFixe}`);
        const baseDegatsTexte = degatsParts.join(' ');

        resumeTexte += `💥 Dégâts critiques : (${baseDegatsTexte}) × 2 = ${degatsJetDouble}`;

        let bonusParts = [];
        if (perso.combatCac !== 0) bonusParts.push(`+ CàC (${perso.combatCac})`);
        if (bonusContext !== 0) bonusParts.push(`+ Contexte (${bonusContext})`);
        resumeTexte += ` ${bonusParts.join(' ')} = ${degats}\n`;

        resultatTexte = `🎯 Coup critique ! → Dégâts doublés : ${degats}`;
      } else {

        const degatsRollObj = rollDice(formuleDes);  

        // Calcule total dégâts en ajoutant bonus fixe + bonus combat + contexte
        degats = degatsRollObj.total + bonusArmeFixe + perso.combatCac + bonusContext;

        if (degats < 1) degats = 1;

        let degatsParts = [];
        if (degatsRollObj.rolls.length > 0) degatsParts.push(`( ${degatsRollObj.rolls.join(' + ')} )`);
        if (bonusArmeFixe !== 0) degatsParts.push(`+ ${bonusArmeFixe}`);
        if (perso.combatCac !== 0) degatsParts.push(`+ CàC (${perso.combatCac})`);
        if (bonusContext !== 0) degatsParts.push(`+ Contexte (${bonusContext})`);

        resumeTexte += `Dégâts : ${degatsParts.join(' ')} = ${degats}\n`;
        resultatTexte = `Touché ! (${jetToucher}) → Dégâts infligés : ${degats}`;
      }

    }

  } else if (armeType === "distance") {
    const jetToucherObj = rollDice("1d6");
    jetToucher = jetToucherObj.total;
    touche = jetToucher >= seuil;
    resumeTexte += `Jet pour toucher (1d6) : ${jetToucher} vs seuil (${seuil})\n`;
    resumeTexte += touche ? "=> Touché\n" : "=> Raté\n";
    if (!touche) {
      resultatTexte = "Résultat : Échec.";
    } else {
      const degatsRollObj = rollDice(armeValeur);
      degats = degatsRollObj.total + perso.combatDist + bonusContext;
      if (degats < 1) degats = 1;

      let degatsParts = [];
      if (degatsRollObj.rolls.length > 0) degatsParts.push(degatsRollObj.rolls.join(' + '));
      if (perso.combatDist !== 0) degatsParts.push(`bonus distance (${perso.combatDist})`);
      if (bonusContext !== 0) degatsParts.push(`bonus contexte (${bonusContext})`);
      resumeTexte += `Dégâts (jets + bonus) : ${degatsParts.join(' + ')} = ${degats}\n`;

      resultatTexte = `Touché ! (${jetToucher}) Dégâts infligés : ${degats}`;
    }
  } else if (armeType === "test") {
    const jetToucherObj = rollDice("1d20");
    jetToucher = jetToucherObj.total;
    let bonusTest = 0;
    switch (armeOpt.dataset.stat) {
      case "for": bonusTest = perso.bonusFor; break;
      case "agi": bonusTest = perso.bonusAgi; break;
      case "int": bonusTest = perso.bonusInt; break;
      case "end": bonusTest = perso.bonusEnd; break;
      case "cha": bonusTest = perso.bonusCha; break;
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

function attaquePNJ() {
  try {
    const nomEl = document.getElementById("nomPNJ");
    const ctEl = document.getElementById("ctPNJ");
    const attaqueEl = document.getElementById("attaquePNJ");
    const degatsEl = document.getElementById("degatsPNJ");
    const cibleSel = document.getElementById("ciblePNJ");
    const type = document.getElementById('typePNJSelect').value;

    const nom = nomEl ? (nomEl.value.trim() || "PNJ") : "PNJ";
    const ct = ctEl ? (parseInt(ctEl.value) || 0) : 0;
    const attaqueNom = attaqueEl ? (attaqueEl.value.trim() || "Attaque") : "Attaque";
    const degatsExpr = degatsEl ? (degatsEl.value.trim() || "1d6") : "1d6";
    const cibleValue = cibleSel ? (cibleSel.value) : null;

    const optCible = cibleValue ? document.querySelector(`#personnage option[value="${cibleValue}"]`) : null;
    const cibleLabel = optCible ? optCible.textContent : (cibleValue || "Cible");
    const caCible = optCible ? parseInt(optCible.dataset.ca) : 0;
    const reducPhy = optCible ? parseInt(optCible.dataset.reducphy) : 0; 

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
          // Parse degatsExpr pour séparer dés et bonus fixe (ex: "2d6+1")
          const exprClean = degatsExpr.replace(/\s+/g, "");
          const m = exprClean.match(/^(\d+d\d+)([+-]\d+)?$/);
          let formule = exprClean;
          let bonusFixe = 0;
          if (m) {
            formule = m[1];
            bonusFixe = parseInt(m[2] || "0");
          }
          const rollD = rollDice(formule);
          const baseDeg = rollD.total + bonusFixe;
          if (succesCrit) degats = baseDeg * 2;
          else degats = baseDeg;

          if (succesCrit) {
            resumeText += `💥 Dégâts critiques : ( ${rollD.rolls.join(" + ")} )${bonusFixe !== 0 ? ` + ${bonusFixe}` : ""} × 2 = ${degats}\n`;
            resultatText = `🎯 Coup critique de ${nom} ! (20) → Dégâts doublés : ${cibleLabel} reçoit ${degats} dégâts`;
          } else {
            resumeText += `Dégâts : ( ${rollD.rolls.join(" + ")} )${bonusFixe !== 0 ? ` + ${bonusFixe}` : ""} = ${degats}\n`;
            resultatText = `${nom} touche ${cibleLabel} ! (${jetToucher}) et lui inflige : ${degats} dégât(s).`;
          }
          } else {
            resumeText += `Jet pour toucher (1d20) : ${jetToucher} vs CA (${caCible}) => Raté\n`;
            resultatText = `${nom} rate son attaque (${jetToucher}).`;
          }
      }
    } else if (type === "distance") {
      const jet = rollDice("1d6");
      jetToucher = jet.total;
      touche = touche = (jetToucher > 1) && (jetToucher >= ct); // règle : si jet < CT -> échec et 1 = échec
      resumeText += `Jet pour toucher (1d6) : ${jetToucher} = ${jetToucher}\n`;
      resumeText += touche ? "=> Touché\n" : "=> Raté\n";
      if (touche) {
        const rollD = rollDice(degatsExpr);
        degats = rollD.total;
        resumeText += `Dégâts : ( ${rollD.rolls.join(" + ")} ) = ${degats}\n`;
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
      // On garde le jet pour cohérence avec Personnage
      const tag = (echecCrit ? "Échec critique" : "Échec");
      historique.unshift(`[${date}] ${attaqueNom} (${nom} → ${cibleLabel}) => ${tag} (${jetToucher})`);
    }
    if (historique.length > 10) historique.pop();
    historiqueDiv.textContent = historique.join('\n');

    // Affiche résultat PNJ (élément dans ton HTML : #resultatPNJ)
    const out = document.getElementById('resultatPNJ');
    if (out) out.textContent = resultatText;

  } catch (err) {
    console.error("Erreur dans attaquePNJ :", err);
    const out = document.getElementById('resultatPNJ');
    if (out) out.textContent = "Erreur : expression de dégâts invalide ou élément absent.";
  }
}

/* -------------------------
   📜 Données de chasse
------------------------- */
const chasseData = {
  ville: [
    {min:6,max:9,animal:"un lapin",jets:{FOR:12,AGI:8,CHA:null},loot:[{t:"ration(s) de viande",q:"0-1"},{t:"fourrure de Lapin",q:"0-1"}],degats:"0"},
    {min:10,max:11,animal:"un faisan",jets:{FOR:12,AGI:10,CHA:null},loot:[{t:"ration(s) de viande",q:"0-1"},{t:"plume(s) de Faisan",q:"0-4"}],degats:"0"},
    {min:12,max:16,animal:"un sanglier",jets:{FOR:12,AGI:14,CHA:null},loot:[{t:"ration(s) de viande",q:"1-3"},{t:"cuir(s) de Sanglier",q:"1d3"}],degats:"1d6"},
    {min:17,max:200,animal:"un chien errant",jets:{FOR:12,AGI:12,CHA:14},loot:[{t:"ration(s) de viande",q:"1-2"}],degats:"1d6"}
  ],
  foret: [
    {min:9,max:10,animal:"un renard",jets:{FOR:12,AGI:10,CHA:12},loot:[{t:"ration(s) de viande",q:"2d1"},{t:"fourrure de Renard",q:"0-1"}],degats:"1"},
    {min:11,max:13,animal:"une biche",jets:{FOR:14,AGI:13,CHA:null},loot:[{t:"ration(s) de viande",q:"2-3"}],degats:"1d4"},
    {min:15,max:17,animal:"un loup",jets:{FOR:12,AGI:13,CHA:14},loot:[{t:"ration(s) de viande",q:"2d1"},{t:"croc(s) de Loup",q:"0-2"}],degats:"1d6"},
    {min:18,max:200,animal:"un ours",jets:{FOR:14,AGI:16,CHA:null},loot:[{t:"ration(s) de viande",q:"2-5"},{t:"fourrure(s) épaisse d’Ours",q:"0-1"}],degats:"2d6"}
  ],
  marais: [
    {min:5,max:9,animal:"une grenouille",jets:{FOR:10,AGI:6,CHA:null},loot:[{t:"ration(s) de viande",q:"1d1"}],degats:"0"},
    {min:10,max:14,animal:"un serpent",jets:{FOR:10,AGI:8,CHA:12},loot:[{t:"ration(s) de viande",q:"1d1"},{t:"peau de serpent",de:"0-1"},{t:"venin(s) puissant",q:"1d1"}],degats:"1d4"},
    {min:15,max:17,animal:"une tortue géante",jets:{FOR:12,AGI:14,CHA:null},loot:[{t:"ration(s) de viande",q:"2d1"},{t:"carapace de Tortue géante",q:"0-1"}],degats:"1d4"},
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

/* -------------------------
   🎲 Utilitaires de dés
------------------------- */
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
    for (let i = 0; i < parseInt(n); i++) {
      total += lancerDes(parseInt(faces));
    }
    return total;
  }

  // Cas "X-Y" pour les loot comme 0-2
  match = expr.match(/(\d+)-(\d+)/);
  if (match) {
    const [, min, max] = match;
    return Math.floor(Math.random() * (parseInt(max) - parseInt(min) + 1)) + parseInt(min);
  }

  return parseInt(expr) || 0;
}


/* -------------------------
   🔍 Trouver un animal
------------------------- */
function trouverAnimal(zone, jetPistage) {
  const animaux = chasseData[zone] || [];
  return animaux.find(a => jetPistage >= a.min && jetPistage <= a.max) || null;
}

/* -------------------------
   🎯 Lancer la chasse
------------------------- */
function lancerChasse() {
  const nameSelect = document.getElementById('nomChasseur');
  const nomChasseur = persoSelect.options[nameSelect.selectedIndex].text;
  const zone = document.getElementById("zoneChasse").value;
  const duree = parseInt(document.getElementById("tempsChasse").value);
  const methode = document.getElementById("methodeChasse").value;
  const priorite = document.getElementById("prioriteChasse").value;
  const bonusPistage = parseInt(document.getElementById("bonusPistage").value) || 0;
  const bonusChasse = parseInt(document.getElementById("bonusChasse").value) || 0;
  let pvActuels = parseInt(document.getElementById("pvActuels").value) || 10;

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
        log.push(`- **Heure ${h}** : Jet de pistage ${jetPistage} → Rien trouvé.`);
        continue;
      }
      log.push(`- **Heure ${h}** : Jet de pistage ${jetPistage} → ${nomChasseur} rencontre **${cible.animal}** !`);
    } else {
      log.push(`- **Heure ${h}** : ${nomChasseur} continue le combat contre **${cible.animal}**.`);
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
        log.push(`    - Jet ${jetAction} (≥ ${seuil}) → Succès ! ${cible.animal} est vaincu et rapporte **${lootTrouve.join(", ")}**.`);
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
      const quantite = parseInt(match[1]);
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
const historiqueDiv = document.getElementById("historique"); 
if (!window.historiqueChasses) window.historiqueChasses = []; 

const date = new Date().toLocaleTimeString();
const texteBilan = `[${date}] ${nomChasseur} : PV ${pvActuels}, PV perdus ${pvPerdus}, Butin : ${butinRegroupe.join(", ") || "Aucun"}, Compagnons : ${compagnons.join(", ") || "Aucun"}`;

window.historiqueChasses.unshift(texteBilan);
if (window.historiqueChasses.length > 10) window.historiqueChasses.pop();

historiqueDiv.textContent = window.historiqueChasses.join("\n---\n");


}




// ===================
// Initialisations DOMContentLoaded (regroupe updateTestLabels, onglets, menu toggle)
// ===================
document.addEventListener("DOMContentLoaded", function () {
  // === updateTestLabels ===
  function updateTestLabels() {
    const selectedPersonnage = persoSelect.options[persoSelect.selectedIndex];

    const statLabels = {
      for: "Force",
      agi: "Agilité",
      int: "Intelligence",
      end: "Endurance",
      cha: "Charisme"
    };

    for (const option of armeSelect.querySelectorAll("option[data-type='test']")) {
      const stat = option.dataset.stat;
      const bonusKey = "bonus" + stat;
      const bonus = selectedPersonnage.dataset[bonusKey];
      const baseStat = selectedPersonnage.dataset[stat];
      const baseLabel = statLabels[stat] || stat;

      option.textContent = `${baseLabel} (+${bonus})`;
    }
  }

  persoSelect.addEventListener("change", updateTestLabels);
  updateTestLabels();

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
const typePNJSelect = document.getElementById('typePNJSelect');
const ctPNJContainer = document.getElementById('ctPNJContainer');

if (typePNJSelect && ctPNJContainer) {
  typePNJSelect.addEventListener('change', () => {
    if (typePNJSelect.value === 'distance') {
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
  });

const tabs = document.querySelectorAll('.tab-button');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach((tab, idx) => {
  tab.addEventListener('click', () => {
    // Reset tous les tabs et contenus
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // Activer le tab cliqué
    tab.classList.add('active');
    contents[idx].classList.add('active');
  });
});

