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
      end: 12,
      cha: 6,
      niveau: 13,
      ca: 13,
      reducphy: 2,
      reducmag: 0,
      pv: 30,
      pistage: 0,
      chasse: 0,
      armurier:0,
      forgemage:0,
      cuisinier:0,
      alchimiste:0,
      bucheron:0,
      mineur:0
    },
    draner: {
      nom: "Drânër",
      for: 5,
      agi: 22,
      int: 5,
      end: 6,
      cha: 6,
      niveau: 12,
      ca: 10,
      reducphy: 0,
      reducmag: 0,
      pv: 14,
      pistage: 0,
      chasse: 0,
      armurier:0,
      forgemage:0,
      cuisinier:0,
      alchimiste:0,
      bucheron:0,
      mineur:0
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
    perso.bonusJetEnd = Math.floor(perso.end / 5);  // +1 tous les 5 END
    perso.bonusJetCha = Math.floor(perso.cha / 3);  // +1 tous les 3 CHA


    // --- Spécial ---
    perso.bonusApprivoiser = Math.floor(perso.cha / 5); // compagnons
    perso.poidsMax = 20 + perso.for * 2; // poids transportable
  }
}

hydratePersonnages();

window.gameData = gameData;
// Exemple d’utilisation 
const perso = gameData.personnages["brakmar"];
console.log(perso);

const persoSelect = document.getElementById('personnage'); // définie avant tout usage
if (persoSelect) {
  updateTestOptions(persoSelect.value);
  persoSelect.addEventListener('change', e => updateTestOptions(e.target.value));
}


// =====================================================
// 📦 2) 📝 Mise à jour dynamique des options Tests (Force, Agi, etc.)
// =====================================================

function updateTestOptions(persoId) {
  const perso = gameData.personnages[persoId];
  if (!perso) return;

  const select = document.getElementById('arme');
  const testGroup = select.querySelector('optgroup[label="Tests"]');
  if (!testGroup) return;

  testGroup.innerHTML = ""; // vide avant reconstruction

  ["for","agi","int","end","cha","pv"].forEach(stat => {
    const opt = document.createElement("option");
    opt.value = (stat === "pv") ? "1d6" : "1d20";
    opt.dataset.type = "test";
    opt.dataset.stat = stat;
    const bonus = perso[bonusMapping[stat]] || 0;
    opt.textContent = `${statLabels[stat]} (${bonus >= 0 ? "+" : ""}${bonus})`;
    testGroup.appendChild(opt);
  });
}

// Appel initial + listener
const persoSelectEl = document.getElementById('personnage');
if (persoSelectEl) {
  updateTestOptions(persoSelectEl.value);
  persoSelectEl.addEventListener('change', e => updateTestOptions(e.target.value));
}


// ============================================
// 🔗 3) Raccourcis DOM
// ============================================
// Récupérer tous les sélecteurs qui influencent l'affichage de la sidebar

const selectsPerso = document.querySelectorAll(
  "#personnage, #ciblePNJ, #nomChasseur, #personnageStats"
);

const statsDiv = document.getElementById('statsPerso');
const armeSelect = document.getElementById('arme');
const historiqueDiv = document.getElementById('historique');
const seuilInput = document.getElementById('seuilToucher');
const bonusContextInput = document.getElementById('bonusContext');
const resultatDiv = document.getElementById('resultat');
const resumeDiv = document.getElementById('resume');

let historique = [];

// =====================================================
// 🧾 4) Affichage des stats
// =====================================================

function afficherStats() {
  const statsDiv = document.getElementById('statsPerso');

  // Trouver la valeur d’un sélecteur qui correspond à un perso existant
  let persoId = null;

selectsPerso.forEach(sel => {
  if (!persoId && gameData.personnages[sel.value]) {
    persoId = sel.value;
  }
});

  if (!persoId) {
    statsDiv.innerHTML = "Sélectionnez un personnage";
    return;
  }

  const perso = gameData.personnages[persoId];

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
        <tr><th>Zone</th><th>Tacle</th><th>Esquive</th></tr>
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

      <div class="table-wrapper">
      <table>
        <tr><th>Armurier</th><td>${perso.armurier}</td></tr>
        <tr><th>Forgemage</th><td>${perso.forgemage}</td></tr>
        <tr><th>Cuisinier</th><td>${perso.cuisinier}</td></tr>
        <tr><th>Alchimiste</th><td>${perso.alchimiste}</td></tr>
        <tr><th>Bûcheron</th><td>${perso.bucheron}</td></tr>
        <tr><th>Mineur</th><td>${perso.mineur}</td></tr>
      </table>
    </div>
  `;
}

// Event listener

function syncSelects(source) {
  const value = source.value;
  selectsPerso.forEach(sel => {
    if (sel !== source) sel.value = value;
  });
  afficherStats(); // met à jour le tableau des stats
}

selectsPerso.forEach(sel => {
  sel.addEventListener('change', () => syncSelects(sel));
});

// =====================================================
// 🎲 5) Utilitaires de dés 
// =====================================================

function rollDice(expr) {
  expr = expr.replace(/\s+/g, ''); // supprime les espaces

  // Cas intervalle "A-B"
  const intervalleMatch = expr.match(/^(\d+)-(\d+)$/);
  if (intervalleMatch) {
    const min = parseInt(intervalleMatch[1], 10);
    const max = parseInt(intervalleMatch[2], 10);
    if (min > max) throw new Error("Intervalle invalide : " + expr);

    const valeur = Math.floor(Math.random() * (max - min + 1)) + min;
    return { total: valeur, rolls: [valeur], bonus: 0 };
  }

  // Cas classique "XdY+Z"
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

  if (total < 1) total = 1; // minimum 1
  return { total, rolls, bonus };
}

// =====================================================
// 📌 6) Utilitaire : bouton copier
// =====================================================
function addCopyButton(buttonId, targetId) {
  const btn = document.getElementById(buttonId);
  const target = document.getElementById(targetId);
  if (!btn || !target) return;

  btn.addEventListener("click", () => {
    const texte = target.textContent
      .replace(/\*\*(.*?)\*\*/g, "*$1*")   // conversion markdown bold → WhatsApp
      .replace(/_(.*?)_/g, "_$1_");       // italique reste pareil

    navigator.clipboard.writeText(texte).then(() => {
      btn.textContent = "✅ Copié !";
      setTimeout(() => (btn.textContent = "📋 Copier"), 1500);
    });
  });
}

// =====================================================
// 📦 7) Mise à jour dynamique des tests
// =====================================================
function updateTestOptions(persoId) {
  const perso = gameData.personnages[persoId];
  if (!perso) return;

  const select = document.getElementById('arme');
  const testGroup = select.querySelector('optgroup[label="Tests"]');
  if (!testGroup) return;

  // Conserve les options existantes
  const existingOptions = Array.from(testGroup.querySelectorAll('option[data-type="test"]'));
  // On garde uniquement celles qui ne sont PAS des tests de stats classiques
  const existingNonStatOptions = existingOptions.filter(opt =>
  !(opt.value === "1d20" && ['for','agi','int','end','cha'].includes(opt.dataset.stat))
  );

  testGroup.innerHTML = ""; // vide avant reconstruction

  // Ajoute les options de stats (1d20)
  const stats = ['for','agi','int','end','cha'];
  stats.forEach(stat => {
    const bonus = perso[stat] || 0;
    const label = `${stat.charAt(0).toUpperCase() + stat.slice(1)}${bonus !== 0 ? ` (${bonus >= 0 ? '+' : ''}${bonus})` : ''}`;
    const opt = document.createElement('option');
    opt.value = "1d20";
    opt.dataset.type = "test";
    opt.dataset.stat = stat;
    opt.textContent = label;
    testGroup.appendChild(opt);
  });

  // Réajoute les options non-stats (comme "PV résurrection", "Combattre la mort", etc.)
  existingNonStatOptions.forEach(opt => {
    const newOpt = document.createElement('option');
    newOpt.value = opt.value; // valeur d'origine (1d6, 1d20, etc.)
    newOpt.dataset.type = opt.dataset.type;
    newOpt.dataset.stat = opt.dataset.stat;
    newOpt.textContent = opt.textContent; // libellé d'origine
    testGroup.appendChild(newOpt);
  });
}

// =====================================================
// ⚔️ 8) Attaque Personnage (PJ)
// =====================================================

function attaquePerso() {
  try {
    // const persoSelectEl = document.getElementById('personnage');
    const armeSelectEl  = document.getElementById('arme');
    const bonusContextEl = document.getElementById('bonusContext');
    const seuilEl = document.getElementById('seuilToucher');
    const reducPersoInput = document.getElementById("reduceDamage");

    if (!persoSelectEl) return;

    const id = persoSelectEl.value;
    const perso = gameData.personnages[id];
    if (!perso) return;
    const persoNom = perso.nom;

    const bonusContext = parseInt(bonusContextEl?.value, 10) || 0;
    const seuil = parseInt(seuilEl?.value, 10) || 10;
    const reducContext = parseInt(reducPersoInput?.value, 10) || 0; // uniquement réduction contextuelle

    let armeNom = "Aucune arme";
    let armeType = "unknown";
    let armeValeur = "1d1";
    let statBonus = 0;

    // --- essentiel corrigé : armeOpt défini dès le début ---
    let armeOpt = null;
    if (armeSelectEl) {
      armeOpt = armeSelectEl.options[armeSelectEl.selectedIndex] || null;
      if (armeOpt) {
        armeNom = armeOpt.textContent || armeNom;
        armeType = armeOpt.dataset.type || armeType;
        armeValeur = armeOpt.value || armeValeur;
      }
    }

    if (armeType === "test" && armeOpt) {
      const stat = armeOpt.dataset.stat;
      const bonusMapping = {
        for: "bonusJetFor",
        agi: "bonusJetAgi",
        int: "bonusJetInt",
        end: "bonusJetEnd",
        cha: "bonusJetCha"
      };
      statBonus = perso[bonusMapping[stat]] || 0;
    }


    let echecCritique = false;
    let successCritique = false;
    let touche = false;
    let resultatTexte = "";
    let resumeTexte = "";
    let jetToucher = 0;
    let degats = 0;

    // --- détermination de la réduction contextuelle ---
    const reducCible = reducContext;

    // === Corps à corps ===
    if (armeType === "cac") {
      const jetToucherObj = rollDice("1d20");
      jetToucher = jetToucherObj.total;

      if (jetToucher === 1) echecCritique = true;
      if (jetToucher === 20) successCritique = true;

      const bonusTest = 0;
      const totalToucher = jetToucher + bonusTest + bonusContext;
      touche = totalToucher >= seuil;

      resumeTexte += `🎲 Jet (1d20) : ${jetToucher}`;
      if (bonusTest) resumeTexte += ` + ${bonusTest} (bonus fixe)`;
      if (bonusContext) resumeTexte += ` + ${bonusContext} (bonus contexte)`;
      resumeTexte += ` = ${totalToucher}\n`;
      resumeTexte += touche ? "✅ Touché\n" : "❌ Raté\n";

      if (touche) {
        const armeValeurClean = (armeValeur || "").replace(/\s+/g, "");
        const match = armeValeurClean.match(/^(\d+d\d+)([+-]\d+)?$/);
        let formuleDes = match ? match[1] : "1d1";
        let bonusFixe = (match ? parseInt(match[2] || "0", 10) : 0) + (perso.bonusDegatsCAC || 0) + bonusContext;

        const degatsRollObj = rollDice(formuleDes);
        const baseDes = degatsRollObj.total;

        if (successCritique) {
          const totalAvantReduc = baseDes * 2 + bonusFixe;
          degats = Math.max(0, totalAvantReduc - reducCible); // ici on applique seulement le contexte
          resumeTexte += `💥 Dégâts critiques : ( ${degatsRollObj.rolls.join(" + ")} ×2 )`;
          if (bonusFixe) resumeTexte += ` + ${bonusFixe} (bonus)`;
          resumeTexte += ` = ${totalAvantReduc}\n`;
        } else {
          const totalAvantReduc = baseDes + bonusFixe;
          degats = Math.max(0, totalAvantReduc - reducCible);
          resumeTexte += `⚔️ Dégâts : ( ${degatsRollObj.rolls.join(" + ")} )`;
          if (bonusFixe) resumeTexte += ` + ${bonusFixe} (bonus)`;
          resumeTexte += ` = ${totalAvantReduc}\n`;
        }

        if (reducCible) resumeTexte += `🔻 Réduction (${reducCible}) → ${degats}\n`;
        resultatTexte = (successCritique ? "🎯 Coup critique ! → " : "✅ Touché ! → ") + `${degats} dégâts`;
      } else {
        resultatTexte = echecCritique ? `💀 Échec critique ! → ${persoNom} perd son prochain tour` : "❌ Résultat : Échec.";
      }

    // === Distance ===
    } else if (armeType === "distance") {
      const jetToucherObj = rollDice("1d6");
      jetToucher = jetToucherObj.total;
      touche = jetToucher >= seuil;
      resumeTexte += `🎯 Jet distance (1d6) : ${jetToucher} pour un objectif à ${seuil}\n`;
      resumeTexte += touche ? "✅ Touché\n" : "❌ Raté\n";

      if (touche) {
        const degatsRollObj = rollDice(armeValeur);
        const baseDes = degatsRollObj.total;
        const bonusFixe = (perso.bonusDegatsDist || 0) + bonusContext;
        const totalAvantReduc = baseDes + bonusFixe;
        degats = Math.max(0, totalAvantReduc - reducCible);
        resumeTexte += `⚔️ Dégâts : ( ${degatsRollObj.rolls.join(" + ")} )`;
        if (bonusFixe) resumeTexte += ` + ${bonusFixe} (bonus)`;
        resumeTexte += ` = ${totalAvantReduc}\n`;
        if (reducCible) resumeTexte += `🔻 Réduction (${reducCible}) → ${degats}\n`;
        resultatTexte = `✅ Touché ! → ${degats} dégâts`;
      } else {
        resultatTexte = "❌ Résultat : Échec.";
      }

    // === Test stat ===
    } else if (armeType === "test") {
      const jetObj = rollDice(armeValeur);
      jetToucher = jetObj.total;
      const total = jetToucher + statBonus + bonusContext;
      const reussi = total >= seuil;

      resumeTexte += `🎲 Jet (${armeValeur}) : ${jetToucher}`;
      if (statBonus) resumeTexte += ` + ${statBonus} (bonus stat)`;
      if (bonusContext) resumeTexte += ` + ${bonusContext} (bonus contexte)`;
      resumeTexte += ` = ${total} pour un objectif à ${seuil}\n`;
      // resumeTexte += reussi ? "✅ Réussi\n" : "❌ Échec\n";

      resultatTexte = reussi
        ? `✅ Test réussi ! (${total} ≥ ${seuil})`
        : `❌ Test raté ... (${total} < ${seuil})`;
    }

    const date = new Date().toLocaleTimeString();
    const histEntry = `[${date}] ${armeNom} → ${resultatTexte}`;
    if (historique && Array.isArray(historique)) {
      historique.unshift(histEntry);
      if (historique.length > 10) historique.pop();
    }
    if (historiqueDiv) historiqueDiv.textContent = historique.join('\n');

    if (resultatDiv) resultatDiv.textContent = resultatTexte;
    if (resumeDiv) resumeDiv.textContent = resumeTexte;

    showCopyButtonIfContent("copyPJBtn", "resultat", "resume");

  } catch (err) {
    console.error("Erreur dans attaquePerso:", err);
    if (resultatDiv) resultatDiv.textContent = "❌ Erreur interne (voir console)";
  }
}


// =====================================================
// 👆 9) Initialisation du sélecteur personnage pour tests
// =====================================================
if (persoSelectEl) {
  updateTestOptions(persoSelectEl.value);
  persoSelectEl.addEventListener('change', e => updateTestOptions(e.target.value));
}



// =====================================================
// 👹 10) Attaque PNJ
// =====================================================

function attaquePNJ() {
  try {
    const nom = document.getElementById("nomPNJ")?.value.trim() || "PNJ";
    const ct = parseInt(document.getElementById("ctPNJ")?.value, 10) || 0;
    const attaqueNom = document.getElementById("attaquePNJ")?.value.trim() || "Attaque";
    const degatsExpr = document.getElementById("degatsPNJ")?.value.trim() || "1d6";
    const cibleId = document.getElementById("ciblePNJ")?.value;
    const type = document.getElementById('attackTypePNJSelect').value;

    const cible = cibleId ? gameData.personnages[cibleId] : null;
    const cibleLabel = cible ? cible.nom : "Cible";
    const caCible = cible ? cible.ca : 0;

    // === CORRECTIF : Choix de la réduction selon type de dégâts ===
    const damageType = document.getElementById('damageTypePNJSelect')?.value || 'physique';
    const reduc = cible ? (damageType === 'physique' ? cible.reducphy : cible.reducmag) : 0;

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
      if (jetToucher === 1) echecCrit = true;
      if (jetToucher === 20) succesCrit = true;
      touche = jetToucher >= caCible;

      resumeText += `🎲 Jet (1d20) : ${jetToucher} vs CA ${caCible}\n`;
      resumeText += touche ? "✅ Touché\n" : "❌ Raté\n";

      if (!touche) {
        resultatText = echecCrit ? `💀 Échec critique ! ${nom} perd son prochain tour` : `❌ ${nom} rate son attaque`;
      } else {
        const exprClean = degatsExpr.replace(/\s+/g, "");
        const match = exprClean.match(/^(\d+d\d+)([+-]\d+)?$/);
        let formule = exprClean, bonusFixe = 0;
        if (match) {
          formule = match[1];
          bonusFixe = parseInt(match[2] || "0", 10);
        }

        const rollD = rollDice(formule);

        if (succesCrit) {
          const totalAvantReduc = rollD.total * 2 + bonusFixe;
          degats = Math.max(0, totalAvantReduc - reduc);
          resumeText += `💥 Dégâts critiques : ( ${rollD.rolls.join(" + ")} ×2 )`;
          if (bonusFixe > 0) resumeText += ` + ${bonusFixe} (bonus)`;
          resumeText += ` = ${totalAvantReduc}\n`;
        } else {
          const totalAvantReduc = rollD.total + bonusFixe;
          degats = Math.max(0, totalAvantReduc - reduc);
          resumeText += `⚔️ Dégâts : ( ${rollD.rolls.join(" + ")} )`;
          if (bonusFixe > 0) resumeText += ` + ${bonusFixe} (bonus)`;
          resumeText += ` = ${totalAvantReduc}\n`;
        }
        if (reduc > 0) resumeText += `🔻 Réduction (${reduc}) → ${degats}\n`;
        resultatText = (succesCrit ? `🎯 Coup critique ! ` : `✅ ${nom} touche `) + `${cibleLabel} → ${degats} dégâts`;
      }

    } else if (type === "distance") {
      const jet = rollDice("1d6");
      jetToucher = jet.total;
      touche = (jetToucher > 1) && (jetToucher >= ct);

      resumeText += `🎯 Jet distance (1d6) : ${jetToucher} vs CT ${ct}\n`;
      resumeText += touche ? "✅ Touché\n" : "❌ Raté\n`";

      if (!touche) {
        resultatText = `❌ Échec (${jetToucher} < CT ${ct})`;
      } else {
        const rollD = rollDice(degatsExpr);
        const totalAvantReduc = rollD.total;
        degats = Math.max(0, totalAvantReduc - reduc);
        resumeText += `⚔️ Dégâts : ( ${rollD.rolls.join(" + ")} ) = ${totalAvantReduc}\n`;
        if (reduc > 0) resumeText += `🔻 Réduction (${reduc}) → ${degats}\n`;
        resultatText = `✅ ${nom} touche ${cibleLabel} → ${degats} dégâts`;
      }
    }

    const date = new Date().toLocaleTimeString();
    historique.unshift(`[${date}] ${attaqueNom} (${nom} → ${cibleLabel}) → ${resultatText}`);
    if (historique.length > 10) historique.pop();
    historiqueDiv.textContent = historique.join("\n");

    document.getElementById("resultatPNJ").textContent = resultatText + "\n" + resumeText;
    showCopyButtonIfContent("copyPNJBtn", "resultatPNJ");

  } catch (err) {
    document.getElementById("resultatPNJ").textContent = "❌ Erreur attaque PNJ";
  }
}

// =====================================================
// 🚀 11) Initialisation boutons copier
// =====================================================
  addCopyButton("copyPJBtn", ["resultat", "resume"]);
  addCopyButton("copyPNJBtn", ["resultatPNJ"]);


// =====================================================
// 🐾 12) Données Chasse 
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
    {min:10,max:12,animal:"une chèvre sauvage",jets:{FOR:12,AGI:10,CHA:12},loot:[{t:"ration(s) de viande",q:"1-3"},{t:"corne(s) de Chèvre",q:"1d3"},{t:"cuir(s) de Chèvre",q:"1d3"}],degats:"1"},
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
// 🎲 13) Utilitaires chasse
// =====================================================
function lancerDe(faces) {
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
      total += lancerDe(parseInt(faces, 10));
    }
    return total;
  }

  // Cas "X-Y"
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
// 🏹 14) Lancer la chasse
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

  // --- BONUS depuis l'UI ---
  const bonusPistageContext = parseInt(document.getElementById("bonusPistage").value, 10) || 0;
  const bonusChasseContext = parseInt(document.getElementById("bonusChasse").value, 10) || 0;
  const bonusApprivoiserContext = parseInt(document.getElementById("bonusApprivoiser").value, 10) || 0;
  const bonusLoot = parseInt(document.getElementById("bonusLoot").value, 10) || 0;

  // --- BONUS PASSIFS du personnage ---
  const bonusPistage = bonusPistageContext + (chasseur ? chasseur.pistage : 0);
  const bonusChasse = bonusChasseContext + (chasseur ? chasseur.chasse : 0);
  const bonusApprivoiser = bonusApprivoiserContext + (chasseur ? chasseur.bonusApprivoiser : 0);

  let pvActuels = parseInt(document.getElementById("pvActuels").value, 10) || (chasseur ? chasseur.pv : 10);
  let pvPerdus = 0;
  let butin = [];
  let compagnons = [];
  let log = [];
  let cible = null;
  let stopChasse = false;

  for (let h = 1; h <= duree; h++) {
    if (pvActuels <= 0 || stopChasse) break;

    // --- Pistage ---
    if (!cible) {
      const dePistage = lancerDe(20);
      const jetPistage = dePistage + bonusPistage;
      cible = trouverAnimal(zone, jetPistage);

      if (!cible) {
        log.push(`- *Heure ${h}* : 🎲 Jet de pistage ${dePistage} (+${bonusPistage} bonus) = ${jetPistage} → Rien trouvé`);
        continue;
      }

      log.push(`- *Heure ${h}* : 🎲 Jet de pistage ${dePistage} (+${bonusPistage} bonus) = ${jetPistage} → 🎯 ${nomChasseur} rencontre *${cible.animal}* !`);
    } else {
      log.push(`- *Heure ${h}* : ${nomChasseur} continue le combat contre *${cible.animal}*.`);
    }

    // --- Priorité compagnon / apprivoisement ---
    if (priorite === "compagnon" && cible.jets.CHA) {
      const deCha = lancerDe(20);
      const jetAction = deCha + bonusApprivoiser;
      const texteJet = `${deCha} (+${bonusApprivoiser} bonus apprivoisement) = ${jetAction}`;
      const seuil = cible.jets.CHA;

      if (jetAction >= seuil) {
        compagnons.push(cible.animal);
        log.push(`    - 🐾 Jet CHA ${texteJet} (≥ ${seuil}) → ✅ Succès ! ${cible.animal} devient un compagnon 🐾`);
        log.push(`⚑ La chasse s'arrête car ${nomChasseur} a trouvé un compagnon 🐾`);
        cible = null;
        stopChasse = true;
      } else {
        const dmg = evalDegats(cible.degats);
        pvActuels -= dmg;
        pvPerdus += dmg;
        log.push(`    - 🐾 Jet CHA ${texteJet} (< ${seuil}) → ❌ Échec, ${cible.animal} riposte 💥 -${dmg} PV (reste ${pvActuels})`);
      }
    } else {
      // --- Combat normal ---
      const deChasse = lancerDe(20);
      const jetAction = deChasse + bonusChasse;
      const texteJet = `${deChasse} (+${bonusChasse} bonus chasse) = ${jetAction}`;
      const seuil = methode === "brutale" ? cible.jets.FOR :
                    methode === "discrete" ? cible.jets.AGI :
                    cible.jets.CHA;

      if (seuil && jetAction >= seuil) {
        let lootTrouve = [];
        cible.loot.forEach(obj => {
          let quantite = evalDegats(obj.q || obj.de || "1") + bonusLoot;
          lootTrouve.push({ q: quantite, t: obj.t });
        });

        // Application des priorités
        if (priorite === "viande") {
          const viande = lootTrouve.find(l => l.t.includes("viande"));
          if (viande) viande.q += 1;
          const autre = lootTrouve.find(l => !l.t.includes("viande"));
          if (autre) autre.q = Math.max(0, autre.q - 1);
        }
        if (priorite === "ressource") {
          const autre = lootTrouve.find(l => !l.t.includes("viande"));
          if (autre) autre.q += 1;
          const viande = lootTrouve.find(l => l.t.includes("viande"));
          if (viande) viande.q = Math.max(0, viande.q - 1);
        }

        const lootTextes = lootTrouve.map(l => `${l.q} ${l.t}`);
        butin.push(...lootTextes);
        log.push(`    - 🎲 Jet ${texteJet} (≥ ${seuil}) → ✅ Succès ! ${cible.animal} est vaincu et rapporte *${lootTextes.join(", ")}*.`);
        cible = null;
      } else {
        const dmg = evalDegats(cible.degats);
        pvActuels -= dmg;
        pvPerdus += dmg;
        log.push(`    - 🎲 Jet ${texteJet} (< ${seuil}) → ❌ Échec, ${cible.animal} riposte 💥 -${dmg} PV (reste ${pvActuels})`);
      }
    }

    if (pvActuels <= 0) {
      log.push(`💀 ${nomChasseur} est épuisé !`);
      butin = [];
      compagnons = [];
      pvActuels = 1;
      break;
    }
  }

  // --- regroupement du butin ---
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

  // --- Affichage final avec rappel des bonus ---
  document.getElementById("resultatChasse").innerHTML =
    `### Résumé de la chasse<br>` +
    log.join("<br>") + `<br><br>` +
    `(Bonus utilisés : Pistage +${bonusPistage}, Chasse +${bonusChasse}, Apprivoiser +${bonusApprivoiser}, Loot +${bonusLoot})<br>` +
    `<strong>Bilan : ${nomChasseur}</strong><br>` +
    `PV restants ❤️: ${pvActuels}<br>` +
    `PV perdus 💔: ${pvPerdus}<br>` +
    `Butin 🥩: ${butinRegroupe.join(", ") || "Aucun"}<br>` +
    (priorite === "compagnon" ? `Compagnon 🐾 : ${compagnons.join(", ") || "Aucun"}` : "");

  showCopyButtonIfContent("copyChasseBtn", "resultatChasse");

  const historiqueDivLocal = document.getElementById("historique"); 
  if (!window.historiqueChasses) window.historiqueChasses = []; 
  const date = new Date().toLocaleTimeString();
  const texteBilan = `[${date}] ${nomChasseur} : PV ${pvActuels}, PV perdus ${pvPerdus}, Butin : ${butinRegroupe.join(", ") || "Aucun"}${priorite === "compagnon" ? ", Compagnons : " + (compagnons.join(", ") || "Aucun") : ""}`;
  window.historiqueChasses.unshift(texteBilan);
  if (window.historiqueChasses.length > 10) window.historiqueChasses.pop();
  historiqueDivLocal.textContent = window.historiqueChasses.join("\n---\n");
}

// =====================================================
// 🔓 15) Données Crochetage
// =====================================================
const outilsCrochetage = {
  1: { nom:"matériel rudimentaire", acces:[10], bonus:{10:0}, durabilite:5 },
  2: { nom:"matériel standard", acces:[10,15], bonus:{10:1}, durabilite:10 },
  3: { nom:"matériel avancé", acces:[10,15,20], bonus:{10:2,15:1}, durabilite:15 },
  4: { nom:"matériel du maître", acces:[10,15,20,25], bonus:{10:3,15:2,20:1}, durabilite:20 },
};

const serrures = {
  10: "Facile (DD 10)",
  15: "Modérée (DD 15)",
  20: "Difficile (DD 20)",
  25: "Très difficile (DD 25)"
};

// =====================================================
// 🎲 16) Lancer Crochetage
// =====================================================

function lancerCrochetage() {
  const outilLevel = parseInt(document.getElementById("outilCrochetage").value, 10);
  const serrureDD = parseInt(document.getElementById("serrureCrochetage").value, 10);
  const outilData = outilsCrochetage[outilLevel];

  const resultatDiv = document.getElementById("resultatCrochetage");
  const historiqueDiv = document.getElementById("historique");
  const inputDurabilite = document.getElementById("durabiliteCrochetage");

  let durabilite = parseInt(inputDurabilite.value, 10);

  // Vérifie si l’outil peut tenter cette serrure
  if (!(serrureDD in outilData.bonus)) {
    resultatDiv.textContent = `❌ Votre ${outilData.nom} ne peut pas crocheter cette serrure (DD ${serrureDD}).`;
    return;
  }

  // Lancer du dé
  let jet = rollDice("1d20");
  jet = (typeof jet === "object" && "total" in jet) ? jet.total : Number(jet); 
  const bonus = outilData.bonus[serrureDD] || 0;
  const total = jet + bonus;
  const succes = total >= serrureDD;
  let log = `🎲 Jet: ${jet}${bonus ? ` (+${bonus})` : ""} = ${total}\n` +
            `DD: ${serrureDD}\n` +
            (succes ? "✅ Réussite !" : "❌ Échec...");

  // Durabilité
  if (succes) {
    durabilite = Math.max(0, durabilite - 1);
    log += `\nL’outil perd 1 point de durabilité. (durabilité restante : ${durabilite})`;
  } else {
    const perte = Math.floor(Math.random() * 3) + 1; // 1d3
    if (perte === 1) {
      durabilite = 0;
      log += `\n⚡ L’outil est brisé !`;
    } else {
      const perteDur = perte === 2 ? 2 : 3;
      durabilite = Math.max(0, durabilite - perteDur);
      log += `\nL’outil perd ${perteDur} points de durabilité. (durabilité restante : ${durabilite})`;
    }
  }

  inputDurabilite.value = durabilite;

  // 👉 Affiche le résultat courant
  resultatDiv.textContent = log;

  // Historique condensé en une ligne
  if (!window.historiqueCrochetage) window.historiqueCrochetage = [];
  const date = new Date().toLocaleTimeString();
  const logSynth = `${date} | Outil: ${outilData.nom} | Jet: ${total} (d20 ${jet}${bonus ? `+${bonus}` : ""}) | DD: ${serrureDD} | Résultat: ${succes ? "Réussite" : "Échec"} | Durabilité: ${durabilite}`;
  window.historiqueCrochetage.unshift(logSynth);
  if (window.historiqueCrochetage.length > 10) window.historiqueCrochetage.pop();
  historiqueDiv.textContent = window.historiqueCrochetage.join("\n");


  // 👉 Active le bouton copier
  document.getElementById("copyCrochetageBtn").style.display = "inline-block";
}

// 👉 Bouton "Copier" → copie seulement le résultat courant
document.getElementById("copyCrochetageBtn").addEventListener("click", () => {
  const texte = document.getElementById("resultatCrochetage").textContent;
});

// =====================================================
// 🛠️ CRAFT AVANCÉ (PRODUCTION MULTIPLE + CRITIQUES)
// =====================================================

function lancerCraft() {
  const nom = document.getElementById("nomObjet").value || "Objet inconnu";
  const type = document.getElementById("typeCraft").value;
  const niveauMetier = parseInt(document.getElementById("niveauMetier").value);
  let tentativesRestantes = parseInt(document.getElementById("quantiteCraft").value);
  const ingredients = parseInt(document.getElementById("nbIngredients").value);
  const bonusOutil = parseInt(document.getElementById("outilCraft").value);
  const assistant = document.getElementById("assistantCraft").value;

  const resultatDiv = document.getElementById("resultatCraft");
  const historiqueDiv = document.getElementById("historique");
  const inputDurabilite = document.getElementById("durabiliteCraft");

  let durabilite = parseInt(inputDurabilite.value);

  // 🎯 DIFFICULTÉ
  let diff = ingredients - niveauMetier;
  let seuil = 10;

  if (diff <= -2) seuil = 5;
  else if (diff >= 2) seuil = 15;

  let totalXP = 0;
  let succesCount = 0;
  let echecCount = 0;
  let critSuccess = 0;
  let critFail = 0;
  let ressourcesPerdues = 0;
  let potionsCreees = 0;
  let craftsEffectues = 0;

  while (tentativesRestantes > 0 && durabilite > 0) {

    craftsEffectues++;
    tentativesRestantes--; // on consomme une tentative

    let jet = rollDice("1d20").total;

    let bonusAssistant = (assistant === "maitre") ? 2 : 0;
    let bonusMetier = (seuil === 15) ? 0 : niveauMetier;

    let total = jet + bonusMetier + bonusOutil + bonusAssistant;
    let succes = total >= seuil;

    let critique = null;

    if (jet === 1) {
      succes = false;
      critique = "fail";
      critFail++;
    }

    if (jet === 20) {
      succes = true;
      critique = "success";
      critSuccess++;
    }

    let xp = 0;
    let perteRessources = 0;
    let perteDurabilite = 0;

    // ✅ SUCCÈS
    if (succes) {
      succesCount++;
      potionsCreees++;

      // ❌ PAS D'XP SI TROP FACILE
      if (!(diff <= -2)) {
        xp = ingredients * 10;

        if (assistant === "maitre") xp = Math.floor(xp * 1.3);
        if (critique === "success") xp *= 2;
      }

      perteDurabilite = ingredients;

    } else {
      // ❌ ÉCHEC
      echecCount++;

      perteRessources = (assistant === "none")
        ? ingredients
        : Math.ceil(ingredients / 2);

      if (critique === "fail") {
        perteRessources = ingredients;
        perteDurabilite = ingredients * 4;
      } else {
        perteDurabilite = ingredients * 2;
      }

      // XP échec maître
      if (assistant === "maitre" && seuil !== 5) {
        xp = Math.floor((ingredients * 10) * 0.5);
      }

      // 🔥 IMPACT SUR LES TENTATIVES
      let craftsPerdus = Math.floor(perteRessources / ingredients);
      tentativesRestantes -= craftsPerdus;

      ressourcesPerdues += perteRessources;
    }

    totalXP += xp;

    // 🔧 DURABILITÉ
    durabilite = Math.max(0, durabilite - perteDurabilite);

    // 🛑 sécurité
    if (tentativesRestantes < 0) tentativesRestantes = 0;
  }

  inputDurabilite.value = durabilite;

  // 🎭 Narration
  let narration = "";

  if (durabilite === 0) {
    narration = "Votre outil se brise sous la pression du travail...";
  } else if (critFail > 0) {
    narration = "Plusieurs erreurs critiques ralentissent la production.";
  } else if (critSuccess > 0) {
    narration = "Certains gestes atteignent une perfection remarquable.";
  } else if (succesCount > echecCount) {
    narration = "La production est efficace.";
  } else {
    narration = "Le rendement est médiocre.";
  }

  // 🧾 LOG FINAL
  let log = `🛠️ Production : ${nom}\n`;
  log += `Type : ${type}\n`;
  log += `🧪 Ingrédients : ${ingredients} | Niveau métier : ${niveauMetier}\n`;
  log += `🎯 Seuil : ${seuil}\n\n`;

  log += `📖 ${narration}\n\n`;

  log += `📊 Crafts réalisés : ${craftsEffectues}\n`;
  log += `🧪 Objets créés : ${potionsCreees}\n\n`;

  log += `✅ Réussites : ${succesCount}\n`;
  log += `❌ Échecs : ${echecCount}\n`;
  log += `✨ Critiques : ${critSuccess}\n`;
  log += `💥 Échecs critiques : ${critFail}\n\n`;

  log += `📦 Ressources perdues : ${ressourcesPerdues}\n`;
  log += `⭐ XP totale : ${totalXP}\n`;
  log += `🔧 Durabilité restante : ${durabilite}`;

  resultatDiv.textContent = log;

  // 📜 Historique
  if (!window.historiqueGlobal) window.historiqueGlobal = [];

  const date = new Date().toLocaleTimeString();
  const synth = `${date} | ${nom} | ${potionsCreees} créés | XP:${totalXP}`;

  window.historiqueGlobal.unshift(synth);
  if (window.historiqueGlobal.length > 20) window.historiqueGlobal.pop();

  historiqueDiv.textContent = window.historiqueGlobal.join("\n");

  document.getElementById("copyCraftBtn").style.display = "inline-block";
}

// =====================================================
// 📋 Copier résultat Craft
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("copyCraftBtn");

  if (btn) {
    btn.addEventListener("click", () => {
      const texte = document.getElementById("resultatCraft").textContent;
      navigator.clipboard.writeText(texte);
    });
  }
});



// =====================================================
// 🧭 17) Initialisations DOMContentLoaded (updateTestLabels, menu, onglets, CT distance…)
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
      cha: "Charisme",
      pv: "PV résurrection",
      death: "Combattre la mort"
    };

    const bonusMapping = {
      for: "bonusJetFor",
      agi: "bonusJetAgi",
      int: "bonusJetInt",
      end: "bonusJetEnd",
      cha: "bonusJetCha",
      pv: "bonusJetEnd"
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
// =====================================================
// 📋 18) Utilitaire "copier"
// - supporte un id ou un tableau d'ids
// - préserve *gras* et _italique_ pour WhatsApp (on copie le texte, pas le HTML)
// =====================================================

function addCopyButton(buttonId, targetIds) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  const ids = Array.isArray(targetIds) ? targetIds : [targetIds];

  // Initialement caché
  btn.style.display = "none";

  btn.addEventListener("click", () => {
    let text = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return "";
      return (el.innerText ?? el.textContent ?? "").trim();
    }).filter(Boolean).join("\n\n");

    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      const label = btn.textContent;
      btn.textContent = "✅ Copié !";
      setTimeout(() => (btn.textContent = label), 1200);
    });
  });
}

// Petite aide pour afficher le bouton seulement quand il y a du contenu
function showCopyButtonIfContent(buttonId, ...elementIds) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  const hasContent = elementIds.some(id => {
    const el = document.getElementById(id);
    return el && (el.innerText ?? el.textContent ?? "").trim().length > 0;
  });
  btn.style.display = hasContent ? "inline-block" : "none";
}

// --- Initialisation minimale
addCopyButton("copyPJBtn", ["resultat", "resume"]);
addCopyButton("copyPNJBtn", ["resultatPNJ"]);
addCopyButton("copyChasseBtn", ["resultatChasse"]);
addCopyButton("copyCrochetageBtn", ["resultatCrochetage"]);

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

  // === SELECT MOBILE (dropdown onglets) ===
  const tabSelect = document.getElementById("tabSelect");

  if (tabSelect) {
    tabSelect.addEventListener("change", function () {
      const value = this.value;

      // Reset contenus
      tabContents.forEach(c => {
        c.classList.remove("active");
        c.style.display = "none";
      });

      // Affiche le bon
      const target = document.getElementById("tab-" + value);
      if (target) {
        target.classList.add("active");
        target.style.display = "";
      }

      // Sync boutons desktop
      tabButtons.forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.tab === value) {
          btn.classList.add("active");
        }
      });
    });
  }

  // === Synchronisation boutons → select ===
  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      if (tabSelect) {
        tabSelect.value = this.dataset.tab;
      }
    });
  });

  // === GESTION DES BONUS CHASSE ===
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleBonusBtn");
  const bonusContainer = document.getElementById("bonusContainer");
  
  toggleBtn.addEventListener("click", () => {
    if (bonusContainer.style.display === "none") {
      bonusContainer.style.display = "block";
      toggleBtn.textContent = "Voir moins ▲";
    } else {
      bonusContainer.style.display = "none";
      toggleBtn.textContent = "Voir plus ▼";
    }
  });
});

// Mettre à jour les stats quand on change de sélection
selectsPerso.forEach(select => {
  if (select) {
    select.addEventListener('change', afficherStats);
  }
});

// Affichage initial au chargement
document.addEventListener("DOMContentLoaded", afficherStats);

// Charger crochetage
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnCrochetage");
  if (btn) btn.addEventListener("click", lancerCrochetage);
});
