// ==UserScript==
// @name         Dueling Nexus Translate (EN,ES,FR,DE,IT,PT)
// @namespace    https://duelingnexus.com/
// @description  Script para traducir la descripción de las cartas a los idiomas soportados en yugioh.fandom.com
// @author       UsakaRokujou
// @version      0.1-beta
// @match        https://duelingnexus.com/game/*
// @match        https://duelingnexus.com/editor/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Usaka/DuelingNexusTranslate/master/translate.js
// @downloadURL  https://raw.githubusercontent.com/Usaka/DuelingNexusTranslate/master/translate.js
// ==/UserScript==

(function(){
    function changeLanguage(){
        localStorage.setItem('language', select.value)
        language = select.value
        let temp = lastCurrentCardId
        lastCurrentCardId = 0
        Engine.ui.setCardInfo(temp)
    }

    function loadLanguage(a){
        var card = Engine.getCardData(a)

        if (!(0 >= a) && lastCurrentCardId !== a) {
            lastCurrentCardId = a
            document.getElementById("card-name").innerHTML = '...'
            document.getElementById("card-description").innerHTML = '...'

            if(cardsTemp[a]){
                document.getElementById("card-name").innerHTML = cardsTemp[a][language].name

                for (let html of document.getElementsByClassName('card-types')){
                    let cardType = [];

                    html.innerHTML.split('|').forEach(elem => {
                        cardType.push(dataText[elem] ? dataText[elem][language] : elem)
                    })

                    html.innerHTML = cardType.join(' / ')
                }

                let race = document.getElementById("card-race")
                if (race.innerHTML !== "") {
                    race.innerHTML = dataText[race.innerHTML] ? dataText[race.innerHTML][language] : race.innerHTML;
                }

                let attribute = document.getElementById("card-attribute")
                if (attribute.innerHTML !== "") {
                    attribute.innerHTML = dataText[attribute.innerHTML] ? dataText[attribute.innerHTML][language] : attribute.innerHTML;
                }

                let level = document.getElementById("card-level")
                if (level.innerHTML !== "") {
                    let l = level.innerHTML.split(' ');
                    l[0] = dataText[l[0]] ? dataText[l[0]][language] : l[0];
                    level.innerHTML = l.join(' ')
                }

                var pendulum = cardsTemp[a][language].pendulum ? `←${card.lscale}【Pendulum Effect】${card.lscale}→<br> ${cardsTemp[a][language].pendulum} <br><br> 【Monster Effect】<br>` : '';

                document.getElementById("card-description").innerHTML = pendulum + cardsTemp[a][language].lore
            }else{
                const name = encodeURIComponent(card.name)
                fetch(`https://yugioh.fandom.com/api.php?action=query&titles=${name}&prop=revisions&rvslots=*&rvprop=content&formatversion=2&format=json&origin=*`)
                    .then(res => res.json())
                    .then(result => {
                    var content = result.query?.pages[0]?.revisions[0]?.slots?.main?.content

                    content = content.split('|')
                    languageList.forEach(l => {
                        if(l !== 'en'){
                            let translate = {
                                name : content.find(f => f.includes(`${l}_name`))?.split('=')[1]?.trim(),
                                lore : content.find(f => f.includes(`${l}_lore`))?.split('=')[1]?.trim().replace('\'',''),
                                pendulum : content.find(f => f.includes(`${l}_pendulum_effect`))?.split('=')[1]?.trim().replace('\'',''),
                            }

                            if(cardsTemp[a]){
                                cardsTemp[a][l] = translate
                            }else{
                                cardsTemp[a] = {}
                                cardsTemp[a][l] = translate
                            }
                        }
                    })

                    localStorage.setItem('cardsTemp', JSON.stringify(cardsTemp));
                    lastCurrentCardId = 0
                    loadLanguage(a)
                })
            }
        }
    }

    var version = '0.1-beta';

    var currentVersion = localStorage.getItem('currentVersion');

    if(version !== currentVersion){
        localStorage.clear();
        localStorage.setItem('currentVersion', version);
        window.location.reload();
    }

    var cardsTemp = JSON.parse(localStorage.getItem('cardsTemp'));

    if(!cardsTemp){
        cardsTemp = {}
    }

    var language = localStorage.getItem('language')

    if(!language){
        language = 'en'
    }

    var languageList = ['en','es','fr','de','it','pt'];

    var select = document.createElement("select")
    select.id = 'language'
    select.classList.add('editor-select')
    select.addEventListener('change', changeLanguage)

    languageList.forEach(l => {
        var option = document.createElement("option")
        option.value = l
        option.text = l.toUpperCase()

        select.appendChild(option)
    })

    select.value = language

    document.getElementById('editor-menu-content')?.appendChild(select)

    var oldSetCardInfo = Engine.UI.prototype.setCardInfo

    var lastCurrentCardId = 0

    Engine.ui.setCardInfo = function(a){
        oldSetCardInfo.call(this, a);
        if(language !== 'en') loadLanguage.call(this, a);
    };

    var dataText = {
        // Attributes
        Earth : {
            de:'Land',
            es:'Tierra',
            fr:'Terre',
            it:'Terra',
            pt:'Terra',
        },
        Water : {
            de:'Wasser',
            es:'Agua',
            fr:"L'eau",
            it:'acqua',
            pt:'Água',
        },
        Fire : {
            de:'Feuer',
            es:'Fuego',
            fr:'Feu',
            it:'Fuoco',
            pt:'Incêndio',
        },
        Wind : {
            de:'Wind',
            es:'Viento',
            fr:'Vent',
            it:'Vento',
            pt:'Vento',
        },
        Light : {
            de:'Licht',
            es:'Luz',
            fr:'Lumière',
            it:'Leggero',
            pt:'Luz',
        },
        Dark : {
            de:'Dunkelheit',
            es:'Oscuridad',
            fr:'Obscurité',
            it:'Buio',
            pt:'Trevas',
        },
        Divine : {
            de:'Gottheit',
            es:'Divinidad',
            fr:'Divinité',
            it:'Divinità',
            pt:'Divindade',
        },
        // Races
        Warrior : {
            de:'Krieger',
            es:'Guerrero',
            fr:'guerrier',
            it:'Guerriero',
            pt:'Guerreiro',
        },
        Spellcaster : {
            de:'Hexer',
            es:'Lanzador de Conjuros',
            fr:'Jeteur de sorts',
            it:'Lanciatore di magie',
            pt:'Feiticeiro',
        },
        Fairy : {
            de:'Fee',
            es:'Hada',
            fr:'Fée',
            it:'Fata',
            pt:'Fada',
        },
        Fiend : {
            de:'Teufel',
            es:'Demonio',
            fr:'diable',
            it:'diavolo',
            pt:'diabo',
        },
        Zombie : {
            de:'Zombie',
            es:'Zombi',
            fr:'Zombi',
            it:'Zombie',
            pt:'Zumbi',
        },
        Machine : {
            de:'Maschine',
            es:'Máquina',
            fr:'Machine',
            it:'Macchina',
            pt:'Máquina',
        },
        Aqua : {
            de:'Wasser',
            es:'Agua',
            fr:"L'eau",
            it:'acqua',
            pt:'Água',
        },
        Pyro : {
            de:'Pyro',
            es:'Pyro',
            fr:'Pyro',
            it:'Piro',
            pt:'Pyro',
        },
        Rock : {
            de:'Felsen',
            es:'Roca',
            fr:'rocheux',
            it:'roccia',
            pt:'pedra',
        },
        "Winged Beast" : {
            de:'Geflügeltes Biest',
            es:'Bestia Alada',
            fr:'Bête ailée',
            it:'Bestia alata',
            pt:'Animal alado',
        },
        Plant : {
            de:'Pflanze',
            es:'Planta',
            fr:'Plante',
            it:'pianta',
            pt:'Plantar',
        },
        Insect : {
            de:'Insekt',
            es:'Insecto',
            fr:'Insecte',
            it:'Insetto',
            pt:'Inseto',
        },
        Thunder : {
            de:'Donner',
            es:'Trueno',
            fr:'tonnerre',
            it:'tuono',
            pt:'Trovão',
        },
        Dragon : {
            de:'Drachen',
            es:'Dragón',
            fr:'Dragon',
            it:'Drago',
            pt:'Dragão',
        },
        Beast : {
            de:'Tier',
            es:'Bestia',
            fr:'La bête',
            it:'Bestia',
            pt:'Fera',
        },
        "Beast-Warrior" : {
            de:'Krieger-Bestie',
            es:'Guerrero-Bestia',
            fr:'Guerrier-Bête',
            it:'Guerriero-Bestia',
            pt:'Guerreiro-Besta',
        },
        Dinosaur : {
            de:'Dinosaurier',
            es:'Dinosaurio',
            fr:'Dinosaure',
            it:'Dinosauro',
            pt:'Dinossauro',
        },
        Fish : {
            de:'Fisch',
            es:'Pez',
            fr:'Poisson',
            it:'Pesce',
            pt:'Peixe',
        },
        "Sea Serpent" : {
            de:'Seeschlange',
            es:'Serpiente marina',
            fr:'Serpent de mer',
            it:'serpente di mare',
            pt:'Serpente marinha',
        },
        Reptile : {
            de:'Reptil',
            es:'Reptil',
            fr:'Reptile',
            it:'Rettile',
            pt:'Réptil',
        },
        Psychic : {
            de:'Hellseher',
            es:'Psíquico',
            fr:'Psychique',
            it:'Psichico',
            pt:'Psíquico',
        },
        "Divine-Beast" : {
            de:'Göttliches Tier',
            es:'Bestia Divina',
            fr:'Bête divine',
            it:'Bestia Divina',
            pt:'Besta divina',
        },
        "Creator God" : {
            de:'Schöpfergott',
            es:'Dios Creador',
            fr:'Dieu créateur',
            it:'Dio creatore',
            pt:'Deus criador',
        },
        Wyrm : {
            de:'Wyrm',
            es:'Wyrm',
            fr:'Ver',
            it:'Wyrm',
            pt:'Wyrm',
        },
        Cyberse : {
            de:'Cyberse',
            es:'Ciberso',
            fr:'Cyberse',
            it:'Cyberse',
            pt:'Cyberse',
        },
        // Types
        Monster : {
            de:'Monster',
            es:'Monstruo',
            fr:'Monstre',
            it:'Mostro',
            pt:'Monstro',
        },
        Spell : {
            de:'Magie',
            es:'Magia',
            fr:'la magie',
            it:'Magia',
            pt:'Magia',
        },
        Trap : {
            de:'Falle',
            es:'Trampa',
            fr:'Prendre au piège',
            it:'Trappola',
            pt:'Armadilha',
        },
        Normal : {
            de:'Normal',
            es:'Normal',
            fr:'Normal',
            it:'Normale',
            pt:'Normal',
        },
        Effect : {
            de:'Bewirken',
            es:'Efecto',
            fr:'Effet',
            it:'Effetto',
            pt:'Efeito',
        },
        Fusion : {
            de:'Verschmelzung',
            es:'Fusión',
            fr:'La fusion',
            it:'Fusione',
            pt:'Fusão',
        },
        Ritual : {
            de:'Ritual',
            es:'Ritual',
            fr:'Rituel',
            it:'Rituale',
            pt:'Ritual',
        },
        "Trap-Monster" : {
            de:'Monster-Falle',
            es:'Monstruo-Trampa',
            fr:'Monstre-Piège',
            it:'Mostro-Trappola',
            pt:'Monster-Trap',
        },
        Spirit : {
            de:'Geist',
            es:'Espíritu',
            fr:'Esprit',
            it:'Spirito',
            pt:'Espírito',
        },
        Union : {
            de:'Union',
            es:'Unión',
            fr:'syndicat',
            it:'Unione',
            pt:'União',
        },
        Dual : {
            de:'Doppelt',
            es:'Doble',
            fr:'Double',
            it:'Doppio',
            pt:'Dobro',
        },
        Tuner : {
            de:'Sänger',
            es:'Cantante',
            fr:'Chanteur',
            it:'Cantante',
            pt:'Cantor',
        },
        Synchro : {
            de:'Synchron',
            es:'Synchro',
            fr:'Synchro',
            it:'sincronizzato',
            pt:'Synchro',
        },
        Token : {
            de:'Zeichen',
            es:'Token',
            fr:'Jeton',
            it:'Gettone',
            pt:'Símbolo',
        },
        "Quick-Play" : {
            de:'Schnelles Spiel',
            es:'Juego rápido',
            fr:'Jeu rapide',
            it:'Gioco veloce',
            pt:'Jogo rápido',
        },
        Continuous : {
            de:'Weitermachen',
            es:'Continua',
            fr:'Continuer',
            it:'Andare avanti',
            pt:'Continue',
        },
        Equip : {
            de:'Mannschaft',
            es:'Equipo',
            fr:'équipe',
            it:'Squadra',
            pt:'Equipe',
        },
        Field : {
            de:'Landschaft',
            es:'Campo',
            fr:'Campagne',
            it:'Campagna',
            pt:'Campo',
        },
        Counter : {
            de:'Buchhalter',
            es:'Contador',
            fr:'Comptable',
            it:'Contabile',
            pt:'Contador',
        },
        Flip : {
            de:'Flip',
            es:'Volteo',
            fr:'Retourner',
            it:'Flip',
            pt:'Giro',
        },
        Toon : {
            de:'Toon',
            es:'Toon',
            fr:'dessin animé',
            it:'cartone animato',
            pt:'Toon',
        },
        Xyz : {
            de:'X und Z',
            es:'Xyz',
            fr:'X y Z',
            it:'X e Z',
            pt:'X e Z',
        },
        Pendulum : {
            de:'Pendel',
            es:'Péndulo',
            fr:'Pendule',
            it:'Pendolo',
            pt:'Pêndulo',
        },
        SpSummon : {
            de:'SpBeschwörung',
            es:'SpSummon',
            fr:'SpSummon',
            it:'SpEvoca',
            pt:'SpSummon',
        },
        Link : {
            de:'Verknüpfung',
            es:'Enlace',
            fr:'Relier',
            it:'collegamento',
            pt:'Link',
        },
        // Levels
        Level : {
            de:'Niveau',
            es:'Nivel',
            fr:'Niveau',
            it:'Livello',
            pt:'Nível',
        },
        Rank : {
            de:'Rang',
            es:'Rango',
            fr:'Rang',
            it:'Rango',
            pt:'Classificação',
        },
    }
})();