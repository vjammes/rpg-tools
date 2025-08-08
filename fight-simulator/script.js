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
  const forVal = opt.dataset.for;
  const agilVal = opt.dataset.agi;
  const intVal = opt.dataset.int;
  const endVal = opt.dataset.end;
  const chaVal = opt.dataset.cha;
  const bonusFor = parseInt(opt.dataset.bonusfor);
  const bonusAgi = parseInt(opt.dataset.bonusagi);
  const bonusInt = parseInt(opt.dataset.bonusint);
  const bonusEnd = parseInt(opt.dataset.bonusend);
  const bonusCha = parseInt(opt.dataset.bonuscha);
  const combatCac = parseInt(opt.dataset.combatcac);
  const combatDist = parseInt(opt.dataset.combatdist);

  statsDiv.innerHTML = `
    <table>
      <tr><th>Caractéristique</th><th>Stats</th><th>Bonus test</th></tr>
      <tr><td>FOR</td><td>${forVal}</td><td>${bonusFor}</td></tr>
      <tr><td>AGI</td><td>${agilVal}</td><td>${bonusAgi}</td></tr>
      <tr><td>INT</td><td>${intVal}</td><td>${bonusInt}</td></tr>
      <tr><td>END</td><td>${endVal}</td><td>${bonusEnd}</td></tr>
      <tr><td>CHA</td><td>${chaVal}</td><td>${bonusCha}</td></tr>
    </table>
    <table>
      <tr><th>Bonus Combat</th><th>CàC</th><th>Distance</th></tr>
      <tr><td></td><td>${combatCac}</td><td>${combatDist}</td></tr>
    </table>
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
  // Roll uniquement sur la partie dés (sans le +4)
  const degatsRollObj = rollDice(formuleDes);  // Utiliser formuleDes, pas armeValeur

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


document.addEventListener("DOMContentLoaded", () => {
  const personnageSelect = document.getElementById("personnage");
  const armeSelect = document.getElementById("arme");

function updateTestLabels() {
  const selectedPersonnage = personnageSelect.options[personnageSelect.selectedIndex];

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

  personnageSelect.addEventListener("change", updateTestLabels);
  updateTestLabels();
});

